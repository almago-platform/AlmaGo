import { NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n";
import { buildPublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import {
  acquisitionContextFromStoredInput,
  isPhase2AttributionEnabled,
} from "@/lib/phase2/acquisition";
import {
  evaluateProspectQualification,
} from "@/lib/phase2/qualification";
import { evaluateSmartOrientationPriority } from "@/lib/phase2/smart-orientation";
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
  if (
    answers.preferredCities.length > 3
    || answers.preferredCities.some((city) => !allowed.city.has(city as never))
  ) return null;

  return answers;
}

export async function POST(request: Request) {
  const access = await getPhase2StudentAccess();

  if (!access.phase2Enabled) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!access.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (!access.isStudent || access.canUseClientFeatures) {
    return NextResponse.json({ error: "Espace prospect requis." }, { status: 403 });
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
  const answers = validAnswers(record.answers);
  const locale = normalizeLocale(typeof record.locale === "string" ? record.locale : null);

  if (!answers) {
    return NextResponse.json({ error: "Invalid orientation submission." }, { status: 400 });
  }

  const { data: prospect, error: prospectError } = await access.supabase
    .from("prospects")
    .select("id")
    .eq("user_id", access.user.id)
    .maybeSingle();

  if (prospectError) {
    return NextResponse.json({ error: "Unable to resolve the prospect." }, { status: 500 });
  }
  if (!prospect?.id) {
    return NextResponse.json({ error: "No linked prospect." }, { status: 409 });
  }

  const { data: latestOrientation, error: latestOrientationError } = await access.supabase
    .from("orientations")
    .select("id,input")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestOrientationError) {
    return NextResponse.json({ error: "Unable to resolve the current project." }, { status: 500 });
  }

  const diagnostic = buildPublicOrientationDiagnostic(answers);
  const qualification = evaluateProspectQualification(answers, diagnostic);
  const smartPriority = evaluateSmartOrientationPriority(answers);
  const acquisition = isPhase2AttributionEnabled()
    ? acquisitionContextFromStoredInput(latestOrientation?.input)
    : null;

  let privileged;
  try {
    privileged = createPrivilegedSupabaseClient();
  } catch {
    return NextResponse.json({ error: "Prospect persistence is not configured." }, { status: 503 });
  }

  const { data: persisted, error: persistError } = await privileged.rpc(
    "append_phase2_orientation_qualification",
    {
      p_prospect_id: prospect.id,
      p_user_id: access.user.id,
      p_expected_latest_orientation_id: latestOrientation?.id ?? null,
      p_orientation_engine_version: ENGINE_VERSION,
      p_orientation_input: {
        answers,
        locale,
        source: "prospect_account_update",
        smart_priority: smartPriority,
        ...(acquisition ? { acquisition } : {}),
      },
      p_orientation_result: diagnostic,
      p_qualification_engine_version: qualification.engineVersion,
      p_qualification_state: qualification.state,
      p_reason_codes: qualification.reasonCodes,
      p_missing_fields: qualification.missingFields,
      p_verification_requirements: qualification.verificationRequirements,
      p_next_action: qualification.nextAction,
    },
  );

  if (persistError) {
    return NextResponse.json(
      { error: "Unable to save the project evaluation." },
      { status: 500 },
    );
  }

  const saved = Array.isArray(persisted) ? persisted[0] : persisted;
  if (!saved?.orientation_id || !saved?.qualification_id) {
    return NextResponse.json(
      { error: "Project changed while this update was being saved." },
      { status: 409 },
    );
  }

  return NextResponse.json({ saved: true }, { status: 201 });
}
