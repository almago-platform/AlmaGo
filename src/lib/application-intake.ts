export type ApplicationIntakeFamily = "winter" | "summer";

export type ApplicationIntakeResolution =
  | { status: "resolved"; intake: string; family: ApplicationIntakeFamily; deadline: string | null; reason: string }
  | { status: "needs_manual_review"; intake: null; family: null; deadline: null; reason: string }
  | { status: "deadline_passed"; intake: string; family: ApplicationIntakeFamily; deadline: string; reason: string };

const normalized = (value: string | null | undefined) => (value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase();

export function applicationIntakeFamily(value: string | null | undefined): ApplicationIntakeFamily | null {
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
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
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

export function resolveApplicationIntake(
  input: {
    target_intake?: string | null;
    intake_terms?: string[] | null;
    winter_deadline?: string | null;
    summer_deadline?: string | null;
  },
  now: Date = new Date(),
): ApplicationIntakeResolution {
  const terms = [...new Set((input.intake_terms || []).map((term) => term.trim()).filter(Boolean))];
  const recognized = terms
    .map((term) => ({ term, family: applicationIntakeFamily(term) }))
    .filter((item): item is { term: string; family: ApplicationIntakeFamily } => item.family !== null);

  if (!recognized.length) {
    return {
      status: "needs_manual_review",
      intake: null,
      family: null,
      deadline: null,
      reason: "La rentrée du programme n’est pas suffisamment structurée.",
    };
  }

  const targetFamily = applicationIntakeFamily(input.target_intake);
  let candidates = targetFamily
    ? recognized.filter((item) => item.family === targetFamily)
    : recognized;

  if (targetFamily && !candidates.length) {
    return {
      status: "needs_manual_review",
      intake: null,
      family: null,
      deadline: null,
      reason: "La rentrée souhaitée ne correspond pas aux rentrées structurées du programme.",
    };
  }

  if (candidates.length > 1 && input.target_intake) {
    const exact = candidates.filter((item) => normalized(item.term) === normalized(input.target_intake));
    if (exact.length === 1) candidates = exact;
  }

  if (candidates.length !== 1) {
    return {
      status: "needs_manual_review",
      intake: null,
      family: null,
      deadline: null,
      reason: "Plusieurs rentrées sont possibles : la rentrée doit être confirmée avant de créer la candidature.",
    };
  }

  const selected = candidates[0];
  const deadline = selected.family === "winter" ? input.winter_deadline : input.summer_deadline;
  if (!deadline) {
    return {
      status: "resolved",
      intake: selected.term,
      family: selected.family,
      deadline: null,
      reason: "Rentrée déterminée ; deadline officielle encore à confirmer.",
    };
  }

  if (!validDateOnly(deadline)) {
    return {
      status: "needs_manual_review",
      intake: null,
      family: null,
      deadline: null,
      reason: "La deadline enregistrée pour cette rentrée n’est pas exploitable.",
    };
  }

  if (deadline < berlinDateOnly(now)) {
    return {
      status: "deadline_passed",
      intake: selected.term,
      family: selected.family,
      deadline,
      reason: "La deadline enregistrée pour cette rentrée est dépassée.",
    };
  }

  return {
    status: "resolved",
    intake: selected.term,
    family: selected.family,
    deadline,
    reason: "Rentrée et deadline cohérentes.",
  };
}
