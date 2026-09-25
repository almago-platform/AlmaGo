export const applicationRoutes = ["direct", "uni_assist", "vpd", "unknown"] as const;
export type ApplicationRoute = (typeof applicationRoutes)[number];

export const requirementVerificationStatuses = [
  "verified",
  "unknown",
  "needs_manual_review",
  "needs_reverification",
] as const;
export type RequirementVerificationStatus = (typeof requirementVerificationStatuses)[number];

export type RequirementEvidence = {
  source_url?: string | null;
  verified_at?: string | null;
  review_due_at?: string | null;
};

export type VerifiedRequirement<T> = RequirementEvidence & {
  value?: T | null;
  free_text?: string | null;
};

export type MasterRequirementProfile = {
  minimum_ects?: VerifiedRequirement<number>;
  subject_credits?: Array<VerifiedRequirement<number> & { subject: string }>;
  minimum_grade?: VerifiedRequirement<number>;
  prior_degree?: VerifiedRequirement<string>;
  languages?: Array<VerifiedRequirement<string> & { language: string }>;
  intake?: VerifiedRequirement<string>;
  deadline?: VerifiedRequirement<string>;
  application_route?: VerifiedRequirement<ApplicationRoute>;
};

export type RequirementResolution<T> = {
  status: RequirementVerificationStatus;
  value: T | null;
  reason: string;
};

function validHttps(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function validTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function evidenceState(
  evidence: RequirementEvidence,
  now: Date,
): Exclude<RequirementVerificationStatus, "needs_manual_review"> {
  const verifiedAt = validTimestamp(evidence.verified_at);
  const reviewDueAt = validTimestamp(evidence.review_due_at);
  const nowMs = now.getTime();

  if (!evidence.source_url && !evidence.verified_at && !evidence.review_due_at) return "unknown";
  if (!validHttps(evidence.source_url) || verifiedAt === null) return "needs_reverification";
  if (verifiedAt > nowMs) return "needs_reverification";
  if (reviewDueAt !== null && reviewDueAt <= nowMs) return "needs_reverification";
  return "verified";
}

export function resolveVerifiedValue<T>(
  requirement: VerifiedRequirement<T> | null | undefined,
  now: Date = new Date(),
): RequirementResolution<T> {
  if (!requirement) return { status: "unknown", value: null, reason: "Information non renseignée." };

  const state = evidenceState(requirement, now);
  if (state !== "verified") {
    return {
      status: state,
      value: null,
      reason: state === "unknown"
        ? "Information non renseignée."
        : "Source ou vérification à revalider.",
    };
  }

  if (requirement.free_text && (requirement.value === null || requirement.value === undefined)) {
    return {
      status: "needs_manual_review",
      value: null,
      reason: "Le prérequis est disponible uniquement en texte libre.",
    };
  }

  if (requirement.value === null || requirement.value === undefined) {
    return { status: "unknown", value: null, reason: "Valeur vérifiée absente." };
  }

  return { status: "verified", value: requirement.value, reason: "Valeur vérifiée." };
}

export function resolvePositiveNumber(
  requirement: VerifiedRequirement<number> | null | undefined,
  now: Date = new Date(),
): RequirementResolution<number> {
  const resolved = resolveVerifiedValue(requirement, now);
  if (resolved.status !== "verified") return resolved;
  if (!Number.isFinite(resolved.value) || Number(resolved.value) <= 0) {
    return {
      status: "needs_manual_review",
      value: null,
      reason: "Valeur numérique non exploitable.",
    };
  }
  return resolved;
}

export function resolveApplicationRoute(
  requirement: VerifiedRequirement<ApplicationRoute> | null | undefined,
  now: Date = new Date(),
): RequirementResolution<ApplicationRoute> {
  const resolved = resolveVerifiedValue(requirement, now);
  if (resolved.status !== "verified") {
    return { ...resolved, value: null };
  }
  if (!applicationRoutes.includes(resolved.value as ApplicationRoute) || resolved.value === "unknown") {
    return {
      status: "unknown",
      value: "unknown",
      reason: "Route de candidature non confirmée.",
    };
  }
  return resolved;
}

export function resolveMasterRequirementProfile(
  profile: MasterRequirementProfile,
  now: Date = new Date(),
) {
  return {
    minimum_ects: resolvePositiveNumber(profile.minimum_ects, now),
    minimum_grade: resolvePositiveNumber(profile.minimum_grade, now),
    prior_degree: resolveVerifiedValue(profile.prior_degree, now),
    intake: resolveVerifiedValue(profile.intake, now),
    deadline: resolveVerifiedValue(profile.deadline, now),
    application_route: resolveApplicationRoute(profile.application_route, now),
    subject_credits: (profile.subject_credits || []).map((item) => ({
      subject: item.subject,
      requirement: resolvePositiveNumber(item, now),
    })),
    languages: (profile.languages || []).map((item) => ({
      language: item.language,
      requirement: resolveVerifiedValue(item, now),
    })),
  };
}
