import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/transactional";
import { normalizeLocale } from "@/lib/i18n";
import { buildPublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";
import { buildOrientationProspectEmail } from "@/lib/orientation/prospect-email";
import { validatePublicOrientationAnswers } from "@/lib/orientation/validate";
import { createOrientationResumeToken } from "@/lib/orientation/resume-token";
import {
  isCompletePublicOrientationIdentity,
  restorePublicOrientationIdentity,
} from "@/lib/orientation/public";
import { evaluateSmartOrientationPriority } from "@/lib/phase2/smart-orientation";
import { linkOrientationHumanReview } from "@/lib/orientation-engine/review/store";
import { createFreeValidationInterestToken } from "@/lib/phase2/free-validation-interest-token";
import {
  isPhase2EmailDeliveryEnabled,
  isPhase2ProspectCaptureEnabled,
} from "@/lib/phase2/config";
import {
  isPhase2AttributionEnabled,
  normalizeAcquisitionContext,
} from "@/lib/phase2/acquisition";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";

const MAX_BODY_BYTES = 24_000;
const ENGINE_VERSION = "public-orientation-v1";
const PRIVACY_NOTICE_VERSION = "orientation-prospect-v1";
const CONTACT_CONSENT_VERSION = "smart-orientation-contact-v1";

function validEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized.length < 3 || normalized.length > 320) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return null;
  return normalized;
}

function publicSiteUrl() {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

async function findProspectId(
  supabase: ReturnType<typeof createPrivilegedSupabaseClient>,
  email: string,
) {
  const { data, error } = await supabase
    .from("prospects")
    .select("id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id as string | undefined;
}

export async function POST(request: Request) {
  if (!isPhase2ProspectCaptureEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (JSON.stringify(body).length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const email = validEmail(record.email);
  const answers = validatePublicOrientationAnswers(record.answers);
  const identityRecord = record.identity && typeof record.identity === "object"
    ? record.identity
    : null;
  const identity = identityRecord
    ? restorePublicOrientationIdentity(identityRecord)
    : null;
  const privacyAcknowledged = record.privacyAcknowledged === true;
  const contactConsent = record.contactConsent === true;
  const reviewId =
    typeof record.reviewId === "string" && record.reviewId.length <= 64
      ? record.reviewId
      : null;
  const locale = normalizeLocale(typeof record.locale === "string" ? record.locale : null);
  const acquisitionRecord = record.acquisition && typeof record.acquisition === "object"
    ? record.acquisition as Record<string, unknown>
    : null;
  const acquisition = isPhase2AttributionEnabled() && acquisitionRecord
    ? normalizeAcquisitionContext(acquisitionRecord.kind, acquisitionRecord.sourceId)
    : null;

  if (!email || !answers || !privacyAcknowledged) {
    return NextResponse.json({ error: "Invalid orientation submission." }, { status: 400 });
  }

  if (
    identityRecord
    && (
      !identity
      || !isCompletePublicOrientationIdentity(identity)
      || identity.email !== email
    )
  ) {
    return NextResponse.json({ error: "Invalid orientation identity." }, { status: 400 });
  }

  const diagnostic = buildPublicOrientationDiagnostic(answers);
  const smartPriority = evaluateSmartOrientationPriority(answers);
  const resume = createOrientationResumeToken();
  const interest = createFreeValidationInterestToken();

  let supabase;
  try {
    supabase = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Prospect persistence is not configured." }, { status: 503 });
  }

  try {
    let prospectId = await findProspectId(supabase, email);

    if (!prospectId) {
      const { data, error } = await supabase
        .from("prospects")
        .insert({ email })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505") {
          prospectId = await findProspectId(supabase, email);
        } else {
          throw error;
        }
      } else {
        prospectId = data.id as string;
      }
    }

    if (!prospectId) throw new Error("Prospect identity could not be resolved.");

    const contactConsentWrite = contactConsent
      ? {
          contact_consent: true,
          contact_consent_at: new Date().toISOString(),
          contact_consent_version: CONTACT_CONSENT_VERSION,
        }
      : {};

    const { error: prospectUpdateError } = await supabase
      .from("prospects")
      .update({
        updated_at: new Date().toISOString(),
        ...contactConsentWrite,
      })
      .eq("id", prospectId);
    if (prospectUpdateError) throw prospectUpdateError;

    const { data: orientation, error: orientationError } = await supabase
      .from("orientations")
      .insert({
        prospect_id: prospectId,
        engine_version: ENGINE_VERSION,
        input: {
          answers,
          ...(identity ? { identity } : {}),
          locale,
          privacy_notice_version: PRIVACY_NOTICE_VERSION,
          privacy_acknowledged: true,
          smart_priority: smartPriority,
          contact_consent: contactConsent,
          contact_consent_version: contactConsent ? CONTACT_CONSENT_VERSION : null,
          ...(acquisition ? { acquisition } : {}),
        },
        result: diagnostic,
        resume_token_hash: resume.hash,
        resume_token_expires_at: resume.expiresAt,
        free_validation_interest_token_hash: interest.hash,
        free_validation_interest_token_expires_at: interest.expiresAt,
      })
      .select("id")
      .single();

    if (orientationError) throw orientationError;

    if (reviewId) {
      await linkOrientationHumanReview({
        reviewId,
        profile: answers,
        orientationId: String(orientation.id),
      }).catch(() => false);
    }

    if (!isPhase2EmailDeliveryEnabled()) {
      return NextResponse.json({ saved: true, delivery: "disabled", interestToken: interest.token }, { status: 201 });
    }

    const baseUrl = publicSiteUrl();
    if (!baseUrl) {
      await supabase
        .from("orientations")
        .update({ delivery_attempted_at: new Date().toISOString() })
        .eq("id", orientation.id);
      return NextResponse.json({ saved: true, delivery: "unavailable", interestToken: interest.token }, { status: 201 });
    }

    const reportUrl = new URL(
      `/orientation/report/${encodeURIComponent(resume.token)}`,
      baseUrl,
    ).toString();
    const signupUrl = new URL("/signup", baseUrl);
    signupUrl.searchParams.set("orientation_token", resume.token);
    const interestUrl = contactConsent
      ? new URL(
          `/orientation/continue/${encodeURIComponent(interest.token)}`,
          baseUrl,
        ).toString()
      : null;

    const emailContent = buildOrientationProspectEmail({
      locale,
      diagnostic,
      reportUrl,
      signupUrl: signupUrl.toString(),
      interestUrl,
    });

    const delivery = await sendTransactionalEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      idempotencyKey: `phase2-orientation/${orientation.id}`,
    });

    const deliveryMetadata: Record<string, string> = {
      delivery_attempted_at: new Date().toISOString(),
    };

    if (delivery.status === "sent") {
      deliveryMetadata.delivery_provider = delivery.provider;
      deliveryMetadata.delivery_message_id = delivery.messageId;
      deliveryMetadata.delivered_at = new Date().toISOString();
    }

    await supabase
      .from("orientations")
      .update(deliveryMetadata)
      .eq("id", orientation.id);

    return NextResponse.json(
      { saved: true, delivery: delivery.status, interestToken: interest.token },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to save the orientation." }, { status: 500 });
  }
}
