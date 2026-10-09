import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { sendTransactionalEmail } from "@/lib/email/transactional";
import { normalizeLocale } from "@/lib/i18n";
import { buildPublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";
import { buildOrientationProspectEmail } from "@/lib/orientation/prospect-email";
import { buildOrientationEmailPdfAttachments } from "@/lib/orientation/pdf-attachments";
import { validatePublicOrientationAnswers } from "@/lib/orientation/validate";
import { createOrientationResumeToken } from "@/lib/orientation/resume-token";
import {
  isAdultPublicOrientationIdentity,
  isCompletePublicOrientationIdentity,
  restorePublicOrientationIdentity,
} from "@/lib/orientation/public";
import { evaluateSmartOrientationPriority } from "@/lib/phase2/smart-orientation";
import { linkOrientationHumanReview } from "@/lib/orientation-engine/review/store";
import {
  projectOrientationHumanReviewBundleToPublicResult,
} from "@/lib/orientation-engine/review/core";
import { createFreeValidationInterestToken } from "@/lib/phase2/free-validation-interest-token";
import {
  isPhase2AccountLinkingEnabled,
  isPhase2EmailDeliveryEnabled,
  isOrientationIncludedEmailEnabled,
  isPhase2ProspectCaptureEnabled,
} from "@/lib/phase2/config";
import {
  isPhase2AttributionEnabled,
  normalizeAcquisitionContext,
} from "@/lib/phase2/acquisition";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";

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

  const ipLimited = enforceRequestRateLimit(
    request,
    PUBLIC_ABUSE_POLICIES.orientationProspect,
  );
  if (ipLimited) return ipLimited;

  const { user: authenticatedUser } = await getAuthenticatedUser();
  if (authenticatedUser) {
    const accountLimited = enforceRequestRateLimit(
      request,
      PUBLIC_ABUSE_POLICIES.orientationProspect,
      { accountId: authenticatedUser.id },
    );
    if (accountLimited) return accountLimited;
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
  const automaticDelivery = record.deliveryMode === "automatic";
  const includedDelivery = record.deliveryMode === "included";
  const emailDeliveryConsent = record.emailDeliveryConsent === true;
  const emailNoticeShown = record.emailNoticeShown === true;
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

  // An automatic request is only accepted when prior opt-in was recorded explicitly.
  if (automaticDelivery && !emailDeliveryConsent) {
    return NextResponse.json({ error: "Explicit automatic email consent is required." }, { status: 400 });
  }

  // Included delivery is a separately gated service request with prominent
  // advance privacy notice, not an inferred or fabricated consent checkbox.
  if (includedDelivery && (!isOrientationIncludedEmailEnabled() || !emailNoticeShown)) {
    return NextResponse.json({ error: "Included email delivery is not available." }, { status: 403 });
  }

  if (!email || !answers || (!privacyAcknowledged && !includedDelivery)) {
    return NextResponse.json({ error: "Invalid orientation submission." }, { status: 400 });
  }

  if (
    !identity
    || !isCompletePublicOrientationIdentity(identity)
    || identity.email !== email
  ) {
    return NextResponse.json({ error: "Invalid orientation identity." }, { status: 400 });
  }

  if (!isAdultPublicOrientationIdentity(identity)) {
    return NextResponse.json(
      { error: "Persistent orientation capture is limited to adults." },
      { status: 403 },
    );
  }

  const diagnostic = buildPublicOrientationDiagnostic(answers);
  const smartPriority = evaluateSmartOrientationPriority(answers);
  const resume = createOrientationResumeToken();
  const interest = createFreeValidationInterestToken();
  const signupPath = isPhase2AccountLinkingEnabled()
    ? `/signup?orientation_token=${encodeURIComponent(resume.token)}`
    : null;

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

    if (
      authenticatedUser?.email
      && authenticatedUser.email.trim().toLowerCase() === email
    ) {
      await supabase.rpc("service_claim_prospect_by_verified_email", {
        p_user_id: authenticatedUser.id,
        p_user_email: authenticatedUser.email,
      });
    }

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
          privacy_acknowledged: privacyAcknowledged,
          ...(includedDelivery ? {
            email_delivery_mode: "included",
            email_notice_shown: true,
            email_notice_version: PRIVACY_NOTICE_VERSION,
          } : {}),
          ...(automaticDelivery ? {
            email_delivery_mode: "automatic",
            email_delivery_consent: true,
            email_delivery_consent_at: new Date().toISOString(),
          } : {}),
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

    let personalized: ReturnType<
      typeof projectOrientationHumanReviewBundleToPublicResult
    > = null;

    if (reviewId) {
      const linked = await linkOrientationHumanReview({
        reviewId,
        profile: answers,
        orientationId: String(orientation.id),
      }).catch(() => false);

      if (linked) {
        const { data: linkedReview } = await supabase
          .from("orientation_human_reviews")
          .select("bundle")
          .eq("id", reviewId)
          .eq("orientation_id", orientation.id)
          .maybeSingle();

        if (linkedReview?.bundle) {
          personalized = projectOrientationHumanReviewBundleToPublicResult(
            linkedReview.bundle,
            reviewId,
          );
        }
      }
    }

    if (!isPhase2EmailDeliveryEnabled()) {
      return NextResponse.json(
        { saved: true, delivery: "disabled", interestToken: interest.token, signupPath },
        { status: 201 },
      );
    }

    const baseUrl = publicSiteUrl();
    if (!baseUrl) {
      await supabase
        .from("orientations")
        .update({ delivery_attempted_at: new Date().toISOString() })
        .eq("id", orientation.id);
      return NextResponse.json(
        { saved: true, delivery: "unavailable", interestToken: interest.token, signupPath },
        { status: 201 },
      );
    }

    const orientationReportUrl = new URL(
      `/orientation/report/${encodeURIComponent(resume.token)}`,
      baseUrl,
    ).toString();
    const candidateReportUrl = new URL(
      `/orientation/report/${encodeURIComponent(resume.token)}?document=candidate`,
      baseUrl,
    ).toString();
    const interestUrl = contactConsent
      ? new URL(
          `/orientation/continue/${encodeURIComponent(interest.token)}`,
          baseUrl,
        ).toString()
      : null;

    let attachments: ReturnType<typeof buildOrientationEmailPdfAttachments> = [];
    try {
      attachments = buildOrientationEmailPdfAttachments({
        locale,
        answers,
        identity,
        email,
        diagnostic,
        personalized,
      });
    } catch {
      attachments = [];
    }

    // Do not claim to have emailed two PDFs if attachment generation failed.
    if ((automaticDelivery || includedDelivery) && attachments.length !== 2) {
      await supabase
        .from("orientations")
        .update({ delivery_attempted_at: new Date().toISOString() })
        .eq("id", orientation.id);
      return NextResponse.json(
        { saved: true, delivery: "unavailable", interestToken: interest.token, signupPath },
        { status: 201 },
      );
    }

    const emailContent = buildOrientationProspectEmail({
      locale,
      diagnostic,
      orientationReportUrl,
      candidateReportUrl,
      interestUrl,
      attachmentsIncluded: attachments.length === 2,
    });

    const delivery = await sendTransactionalEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      idempotencyKey: `phase2-orientation/${orientation.id}`,
      attachments,
    });

    const deliveryMetadata: Record<string, string> = {
      delivery_attempted_at: new Date().toISOString(),
    };

    if (delivery.status === "sent") {
      deliveryMetadata.delivery_provider = delivery.provider;
      deliveryMetadata.delivery_message_id = delivery.messageId;
      deliveryMetadata.delivered_at = new Date().toISOString();
    } else if (delivery.status === "failed") {
      deliveryMetadata.delivery_provider = delivery.provider;
    }

    await supabase
      .from("orientations")
      .update(deliveryMetadata)
      .eq("id", orientation.id);

    return NextResponse.json(
      { saved: true, delivery: delivery.status, interestToken: interest.token, signupPath },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to save the orientation." }, { status: 500 });
  }
}
