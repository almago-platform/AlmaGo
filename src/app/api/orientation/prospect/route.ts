import { NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n";
import { buildPublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { isPhase2ProspectCaptureEnabled } from "@/lib/phase2/config";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import {
  budgetOptions,
  degreeOptions,
  diplomaOptions,
  languageLevelOptions,
  preferredCityOptions,
  studyFieldOptions,
  studyLanguageOptions,
  tunisianBacTrackOptions,
  valuesOf,
} from "@/lib/student/profile-options";

const MAX_BODY_BYTES = 24_000;
const ENGINE_VERSION = "public-orientation-v1";
const PRIVACY_NOTICE_VERSION = "orientation-prospect-v1";

const allowed = {
  bacTrack: new Set(valuesOf(tunisianBacTrackOptions)),
  diploma: new Set(valuesOf(diplomaOptions)),
  degree: new Set(valuesOf(degreeOptions)),
  field: new Set(valuesOf(studyFieldOptions)),
  level: new Set(valuesOf(languageLevelOptions)),
  studyLanguage: new Set(valuesOf(studyLanguageOptions)),
  budget: new Set(valuesOf(budgetOptions)),
  city: new Set(preferredCityOptions),
};

function validEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized.length < 3 || normalized.length > 320) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return null;
  return normalized;
}

function validAnswers(value: unknown) {
  const answers = restorePublicOrientationAnswers(value);
  const year = Number(answers.bacYear);
  const average = answers.generalAverage === "" ? null : Number(answers.generalAverage);

  if (answers.bacStatus !== "obtained" && answers.bacStatus !== "preparing") return null;
  if (!Number.isInteger(year) || year < 2000 || year > 2035) return null;
  if (!allowed.bacTrack.has(answers.bacTrack)) return null;
  if (average !== null && (!Number.isFinite(average) || average < 0 || average > 20)) return null;
  if (answers.lastDiploma && !allowed.diploma.has(answers.lastDiploma)) return null;
  if (!allowed.degree.has(answers.targetDegree)) return null;
  if (!allowed.field.has(answers.targetField)) return null;
  if (!allowed.level.has(answers.germanLevel) || !allowed.level.has(answers.englishLevel)) return null;
  if (!allowed.studyLanguage.has(answers.studyLanguage)) return null;
  if (!allowed.budget.has(answers.budgetRange)) return null;
  if (answers.preferredCities.length > 3 || answers.preferredCities.some((city) => !allowed.city.has(city as never))) return null;

  return answers;
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
  const answers = validAnswers(record.answers);
  const privacyAcknowledged = record.privacyAcknowledged === true;
  const locale = normalizeLocale(typeof record.locale === "string" ? record.locale : null);

  if (!email || !answers || !privacyAcknowledged) {
    return NextResponse.json({ error: "Invalid orientation submission." }, { status: 400 });
  }

  const diagnostic = buildPublicOrientationDiagnostic(answers);

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
    } else {
      const { error } = await supabase
        .from("prospects")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", prospectId);
      if (error) throw error;
    }

    if (!prospectId) throw new Error("Prospect identity could not be resolved.");

    const { error: orientationError } = await supabase.from("orientations").insert({
      prospect_id: prospectId,
      engine_version: ENGINE_VERSION,
      input: {
        answers,
        locale,
        privacy_notice_version: PRIVACY_NOTICE_VERSION,
        privacy_acknowledged: true,
      },
      result: diagnostic,
    });

    if (orientationError) throw orientationError;

    return NextResponse.json({ saved: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save the orientation." }, { status: 500 });
  }
}
