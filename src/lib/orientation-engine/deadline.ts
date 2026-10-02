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
