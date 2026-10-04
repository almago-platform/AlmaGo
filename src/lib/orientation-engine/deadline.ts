export type OrientationIntakeCheckStatus =
  | "missing_target"
  | "match"
  | "unavailable"
  | "unknown";

export type OrientationDeadlineCheckStatus =
  | "missing_target"
  | "open"
  | "closed"
  | "to_verify"
  | "unknown";

export type OrientationDeadlineEvaluation = {
  intakeStatus: OrientationIntakeCheckStatus;
  deadlineStatus: OrientationDeadlineCheckStatus;
  deadline: string | null;
  cycleYear: number | null;
};

function normalized(value: string | null | undefined) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function intakeFamily(value: string | null | undefined): "winter" | "summer" | null {
  const text = normalized(value);
  if (!text) return null;
  if (text.includes("winter") || text.includes("hiver") || /(^|\s)ws(\s|$)/.test(text)) return "winter";
  if (text.includes("summer") || text.includes("sommer") || text.includes("ete") || /(^|\s)ss(\s|$)/.test(text)) return "summer";
  return null;
}

function validDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function berlinDateOnly(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function validVerifiedSource(sourceUrl: string | null, verifiedAt: string | null, now: Date) {
  if (!sourceUrl || !verifiedAt) return false;

  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  } catch {
    return false;
  }

  const timestamp = Date.parse(verifiedAt);
  return Number.isFinite(timestamp) && timestamp <= now.getTime();
}

function deadlineCycleYear(season: "winter" | "summer", deadline: string) {
  const [year, month] = deadline.split("-").map(Number);
  if (season === "winter") return year;

  // Summer-semester applications can close late in the preceding calendar year.
  // This only aligns an already stored date to a target cycle; it never invents a date.
  return month >= 7 ? year + 1 : year;
}

export function evaluateOrientationDeadline(
  input: {
    targetIntakeSeason: "" | "winter" | "summer";
    targetIntakeYear: string;
    intakeTerms: string[];
    winterDeadline: string | null;
    summerDeadline: string | null;
    sourceUrl: string | null;
    verifiedAt: string | null;
  },
  now: Date = new Date(),
): OrientationDeadlineEvaluation {
  const targetYear = Number(input.targetIntakeYear);
  const hasTarget = Boolean(input.targetIntakeSeason)
    && Number.isInteger(targetYear)
    && targetYear >= 2026
    && targetYear <= 2040;

  if (!hasTarget) {
    return {
      intakeStatus: "missing_target",
      deadlineStatus: "missing_target",
      deadline: null,
      cycleYear: null,
    };
  }

  const targetSeason = input.targetIntakeSeason as "winter" | "summer";
  const intakeFamilies = [...new Set(
    input.intakeTerms
      .map((term) => intakeFamily(term))
      .filter((family): family is "winter" | "summer" => family !== null),
  )];

  const intakeStatus: OrientationIntakeCheckStatus = intakeFamilies.length === 0
    ? "unknown"
    : intakeFamilies.includes(targetSeason)
      ? "match"
      : "unavailable";

  if (intakeStatus === "unavailable") {
    return {
      intakeStatus,
      deadlineStatus: "unknown",
      deadline: null,
      cycleYear: null,
    };
  }

  const deadline = targetSeason === "winter"
    ? input.winterDeadline
    : input.summerDeadline;

  if (!deadline) {
    return {
      intakeStatus,
      deadlineStatus: "unknown",
      deadline: null,
      cycleYear: null,
    };
  }

  if (!validDateOnly(deadline)) {
    return {
      intakeStatus,
      deadlineStatus: "to_verify",
      deadline,
      cycleYear: null,
    };
  }

  const cycleYear = deadlineCycleYear(targetSeason, deadline);

  if (
    !validVerifiedSource(input.sourceUrl, input.verifiedAt, now)
    || cycleYear !== targetYear
  ) {
    return {
      intakeStatus,
      deadlineStatus: "to_verify",
      deadline,
      cycleYear,
    };
  }

  return {
    intakeStatus,
    deadlineStatus: deadline < berlinDateOnly(now) ? "closed" : "open",
    deadline,
    cycleYear,
  };
}


export type CampusDeadlineKind =
  | "official_hard_deadline"
  | "official_external_date"
  | "internal_target"
  | "source_review_date";

export type CampusDeadlineVerificationStatus =
  | "open"
  | "closed"
  | "to_verify"
  | "unknown";

export type CampusVerifiedDeadline = {
  kind: CampusDeadlineKind;
  date: string | null;
  cycle: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
  status: CampusDeadlineVerificationStatus;
};

export type CampusApplicationMethod =
  | "direct"
  | "uni_assist"
  | "vpd_then_direct"
  | "other_documented"
  | "unknown";

export type CampusInternalTargetKey =
  | "documents_ready"
  | "authentication_translation_ready"
  | "uni_assist_submit_target"
  | "vpd_request_target"
  | "direct_submit_target"
  | "final_review";

export type CampusInternalTarget = {
  key: CampusInternalTargetKey;
  kind: "internal_target";
  date: string;
  offsetDays: number;
};

function addUtcDays(dateOnly: string, days: number) {
  if (!validDateOnly(dateOnly)) return null;
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function cycleMatches(dateOnly: string, cycle: string) {
  const normalizedCycle = normalized(cycle);
  if (!normalizedCycle) return false;

  const yearMatch = normalizedCycle.match(/20\d{2}/)?.[0];
  if (!yearMatch) return false;

  const family = intakeFamily(normalizedCycle);
  if (!family) return dateOnly.startsWith(yearMatch);

  return deadlineCycleYear(family, dateOnly) === Number(yearMatch);
}

export function evaluateCampusOfficialDeadline(
  input: {
    kind: "official_hard_deadline" | "official_external_date";
    date: string | null;
    cycle: string | null;
    sourceUrl: string | null;
    verifiedAt: string | null;
  },
  now: Date = new Date(),
): CampusVerifiedDeadline {
  if (!input.date) {
    return { ...input, status: "unknown" };
  }

  if (
    !validDateOnly(input.date)
    || !input.cycle
    || !cycleMatches(input.date, input.cycle)
    || !validVerifiedSource(input.sourceUrl, input.verifiedAt, now)
  ) {
    return { ...input, status: "to_verify" };
  }

  return {
    ...input,
    status: input.date < berlinDateOnly(now) ? "closed" : "open",
  };
}

export function buildCampusInternalTargets(
  officialDeadline: CampusVerifiedDeadline,
  applicationMethod: CampusApplicationMethod = "unknown",
): CampusInternalTarget[] {
  if (
    officialDeadline.kind !== "official_hard_deadline"
    || officialDeadline.status !== "open"
    || !officialDeadline.date
  ) {
    return [];
  }

  const targets: Array<[CampusInternalTargetKey, number]> = [
    ["documents_ready", -84],
    ["authentication_translation_ready", -70],
  ];

  if (applicationMethod === "uni_assist") {
    targets.push(["uni_assist_submit_target", -56]);
  } else if (applicationMethod === "vpd_then_direct") {
    targets.push(["vpd_request_target", -70]);
    targets.push(["direct_submit_target", -21]);
  } else if (applicationMethod === "direct") {
    targets.push(["direct_submit_target", -21]);
  }

  targets.push(["final_review", -7]);

  return targets.flatMap(([key, offsetDays]) => {
    const date = addUtcDays(officialDeadline.date as string, offsetDays);
    return date ? [{ key, kind: "internal_target" as const, date, offsetDays }] : [];
  });
}


export function evaluateCampusApplicationDeadline(
  application: {
    deadline: string | null;
    deadline_kind?: string | null;
    deadline_cycle?: string | null;
    deadline_source_url?: string | null;
    deadline_verified_at?: string | null;
  },
  now: Date = new Date(),
): CampusVerifiedDeadline {
  const kind = application.deadline_kind === "official_external_date"
    ? "official_external_date"
    : "official_hard_deadline";

  return evaluateCampusOfficialDeadline(
    {
      kind,
      date: application.deadline,
      cycle: application.deadline_cycle || null,
      sourceUrl: application.deadline_source_url || null,
      verifiedAt: application.deadline_verified_at || null,
    },
    now,
  );
}
