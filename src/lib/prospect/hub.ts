import "server-only";

import {
  publicDiagnosticCodes,
  publicDiagnosticHeadlineCodes,
  publicDiagnosticStatuses,
  type PublicDiagnosticItem,
  type PublicOrientationDiagnostic,
} from "@/lib/orientation/diagnostic";
import {
  restorePublicOrientationAnswers,
  type PublicOrientationAnswers,
} from "@/lib/orientation/public";
import { findRecoverableOrientationForAccount } from "@/lib/orientation/recovery";
import {
  buildProspectRoadmap,
  type ProspectRoadmap,
} from "@/lib/orientation/roadmap";
import {
  loadProspectIntakeState,
  type ProspectIntakeRecord,
  type StarterDocumentSummary,
} from "@/lib/prospect/intake";
import {
  prospectQualificationNextActions,
  prospectQualificationStates,
  type ProspectQualificationNextAction,
  type ProspectQualificationState,
} from "@/lib/phase2/qualification";
import { createClient } from "@/lib/supabase/server";

export type ProspectStoredOrientation = {
  id: string;
  engine_version: string;
  input: unknown;
  result: unknown;
  created_at: string;
};

export type ProspectValidOrientation = ProspectStoredOrientation & {
  diagnostic: PublicOrientationDiagnostic;
  answers: PublicOrientationAnswers;
};

export type ProspectStoredQualification = {
  state: ProspectQualificationState;
  next_action: ProspectQualificationNextAction | null;
};

export type ProspectHubState = {
  prospectId: string | null;
  recovery: Awaited<ReturnType<typeof findRecoverableOrientationForAccount>>;
  orientations: ProspectValidOrientation[];
  current: ProspectValidOrientation | null;
  answers: PublicOrientationAnswers | null;
  diagnostic: PublicOrientationDiagnostic | null;
  roadmap: ProspectRoadmap | null;
  qualification: ProspectStoredQualification | null;
  intake: ProspectIntakeRecord | null;
  starterSummary: StarterDocumentSummary;
  orientationConfirmed: boolean;
};

function validStoredQualification(value: unknown): value is ProspectStoredQualification {
  if (!value || typeof value !== "object") return false;
  const qualification = value as Record<string, unknown>;
  const state = qualification.state;
  const nextAction = qualification.next_action;

  return (
    typeof state === "string"
    && prospectQualificationStates.includes(state as ProspectQualificationState)
    && (
      nextAction === null
      || (
        typeof nextAction === "string"
        && prospectQualificationNextActions.includes(
          nextAction as ProspectQualificationNextAction,
        )
      )
    )
  );
}

function validDiagnosticItem(value: unknown): value is PublicDiagnosticItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.code === "string"
    && publicDiagnosticCodes.includes(
      item.code as (typeof publicDiagnosticCodes)[number],
    )
    && typeof item.status === "string"
    && publicDiagnosticStatuses.includes(
      item.status as (typeof publicDiagnosticStatuses)[number],
    )
  );
}

function validDiagnostic(value: unknown): value is PublicOrientationDiagnostic {
  if (!value || typeof value !== "object") return false;
  const diagnostic = value as Record<string, unknown>;

  return (
    typeof diagnostic.overallStatus === "string"
    && publicDiagnosticStatuses.includes(
      diagnostic.overallStatus as (typeof publicDiagnosticStatuses)[number],
    )
    && typeof diagnostic.headlineCode === "string"
    && publicDiagnosticHeadlineCodes.includes(
      diagnostic.headlineCode as (typeof publicDiagnosticHeadlineCodes)[number],
    )
    && Array.isArray(diagnostic.paths)
    && diagnostic.paths.every(validDiagnosticItem)
    && Array.isArray(diagnostic.priorities)
    && diagnostic.priorities.every(validDiagnosticItem)
    && Array.isArray(diagnostic.checks)
    && diagnostic.checks.every(validDiagnosticItem)
    && Array.isArray(diagnostic.ruleTrace)
  );
}

function orientationAnswers(input: unknown) {
  if (!input || typeof input !== "object") {
    return restorePublicOrientationAnswers(null);
  }

  return restorePublicOrientationAnswers(
    (input as Record<string, unknown>).answers,
  );
}

export async function loadProspectHubState({
  userId,
  email,
  emailConfirmed,
}: {
  userId: string;
  email?: string | null;
  emailConfirmed: boolean;
}): Promise<ProspectHubState> {
  const supabase = await createClient();

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const prospectId =
    prospect && typeof prospect.id === "string" ? prospect.id : null;

  const recovery = !prospectId
    ? await findRecoverableOrientationForAccount({
        userId,
        email,
        emailConfirmed,
      })
    : null;

  let storedOrientations: ProspectStoredOrientation[] = [];

  if (prospectId) {
    const { data } = await supabase
      .from("orientations")
      .select("id,engine_version,input,result,created_at")
      .eq("prospect_id", prospectId)
      .order("created_at", { ascending: false })
      .limit(8);

    if (data) storedOrientations = data as ProspectStoredOrientation[];
  }

  const orientations = storedOrientations.flatMap((orientation) => {
    if (
      orientation.engine_version !== "public-orientation-v1"
      || !validDiagnostic(orientation.result)
    ) {
      return [];
    }

    return [{
      ...orientation,
      diagnostic: orientation.result,
      answers: orientationAnswers(orientation.input),
    }];
  });

  const current = orientations[0] ?? null;
  const answers = current?.answers ?? null;
  const diagnostic = current?.diagnostic ?? null;
  const roadmap = answers && diagnostic
    ? buildProspectRoadmap(answers, diagnostic)
    : null;

  let qualification: ProspectStoredQualification | null = null;

  if (current?.id) {
    const { data } = await supabase
      .from("prospect_qualifications")
      .select("state,next_action")
      .eq("orientation_id", current.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (validStoredQualification(data)) qualification = data;
  }

  const { intake, starterSummary } = await loadProspectIntakeState(userId);
  const orientationConfirmed = Boolean(
    current?.id
    && intake?.orientation_id === current.id
    && intake?.orientation_confirmed_at,
  );

  return {
    prospectId,
    recovery,
    orientations,
    current,
    answers,
    diagnostic,
    roadmap,
    qualification,
    intake,
    starterSummary,
    orientationConfirmed,
  };
}
