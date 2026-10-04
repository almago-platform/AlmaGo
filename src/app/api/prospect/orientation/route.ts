import { NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n";
import { buildPublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";
import { validatePublicOrientationAnswers } from "@/lib/orientation/validate";
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

const MAX_BODY_BYTES = 24_000;
const ENGINE_VERSION = "public-orientation-v1";

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
  const answers = validatePublicOrientationAnswers(record.answers);
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

  const { data: intakeCase, error: intakeError } = await access.supabase
    .from("student_intake_cases")
    .select("status")
    .eq("student_id", access.user.id)
    .maybeSingle();

  if (intakeError) {
    return NextResponse.json(
      { error: "Unable to resolve the current intake." },
      { status: 500 },
    );
  }

  if (intakeCase?.status === "procedure_created") {
    return NextResponse.json(
      {
        error: "Cette orientation ne peut plus être remplacée automatiquement car une procédure a déjà été créée.",
        code: "procedure_already_created",
      },
      { status: 409 },
    );
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

  return NextResponse.json(
    {
      saved: true,
      orientationId: saved.orientation_id,
      refreshed: true,
    },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
