import "server-only";

import type { OrientationLetterOutput } from "@/lib/orientation-engine/types";

type Locale = "fr" | "ar" | "en" | "de";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

type LetterDraft = {
  paragraphs?: unknown;
  closing?: unknown;
};

const DEFAULT_MODEL = "gemini-3.8-flash";
const REQUEST_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const cache = new Map<string, { expiresAt: number; value: OrientationLetterOutput }>();
const inFlight = new Map<string, Promise<OrientationLetterOutput>>();

const localeInstructions: Record<Locale, string> = {
  fr: "Écris en français simple et direct, compréhensible par un lycéen tunisien. Vouvoie toujours le candidat : « vous », « votre », « vos » ; jamais « tu », « ton », « ta » ou « tes ». Utilise des phrases courtes, sans jargon administratif, compliments vagues ou langage commercial.",
  ar: "اكتب بالعربية الفصحى السهلة لطالب تونسي. استخدم جملاً قصيرة وواضحة ومباشرة، وتجنب المصطلحات الإدارية المعقدة والمديح العام والعبارات التسويقية.",
  en: "Write clear, direct everyday English for a prospective Tunisian student. Use short sentences; avoid administrative jargon, vague praise and marketing language.",
  de: "Schreibe einfaches, direktes Deutsch für Studieninteressierte. Verwende kurze Sätze; vermeide Behördensprache, pauschales Lob und Werbesprache.",
};

function logOutcome(outcome: string, model: string, durationMs: number, httpStatus?: number) {
  // Never log student answers, API keys, or the generated text.
  console.info("orientation_gemini_letter", JSON.stringify({
    outcome,
    model,
    durationMs,
    ...(httpStatus ? { httpStatus } : {}),
  }));
}

function pruneCache() {
  const now = Date.now();
  for (const [key, item] of cache) {
    if (item.expiresAt <= now) cache.delete(key);
  }
  while (cache.size > MAX_CACHE_ENTRIES) {
    const first = cache.keys().next().value;
    if (!first) break;
    cache.delete(first);
  }
}

function readDraft(payload: GeminiResponse): LetterDraft | null {
  const responseText = payload.candidates?.[0]?.content?.parts
    ?.map((part) => typeof part.text === "string" ? part.text : "")
    .join("")
    .trim();
  if (!responseText) return null;
  try {
    const parsed: unknown = JSON.parse(responseText);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as LetterDraft
      : null;
  } catch {
    return null;
  }
}

function groundedLetter(draft: LetterDraft | null, baseline: OrientationLetterOutput): OrientationLetterOutput | null {
  if (!draft || !Array.isArray(draft.paragraphs) || draft.paragraphs.length !== baseline.paragraphs.length) {
    return null;
  }
  if (
    draft.paragraphs.some((paragraph) =>
      typeof paragraph !== "string" || paragraph.trim().length < 35 || paragraph.trim().length > 850
    )
    || typeof draft.closing !== "string"
    || draft.closing.trim().length < 25
    || draft.closing.trim().length > 650
  ) {
    return null;
  }
  const paragraphs = draft.paragraphs.map((paragraph: string) => paragraph.trim());
  const closing = draft.closing.trim();
  const combined = [...paragraphs, closing].join(" ");
  const baselineText = [...baseline.paragraphs, baseline.closing].join(" ");

  // Reject URLs, leaked contact addresses, HTML, new numerical facts and
  // categorical promises that were not present in the verified reference.
  if (/https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|[<>]/i.test(combined)) return null;
  const referenceNumbers = new Set(baselineText.match(/\d+(?:[.,]\d+)?/g) || []);
  const outputNumbers = combined.match(/\d+(?:[.,]\d+)?/g) || [];
  if (outputNumbers.some((value) => !referenceNumbers.has(value))) return null;
  if (/\b(?:admission garantie|admis à coup sûr|visa garanti|guaranteed admission|guaranteed visa|garantierte zulassung)\b/i.test(combined)) {
    return null;
  }
  return {
    provider: "gemini-letter-v1",
    mode: "grounded_ai",
    title: baseline.title, // Keep the approved user-visible heading and design.
    paragraphs,
    closing,
    scoutUsed: baseline.scoutUsed,
  };
}

function requestBody(locale: Locale, baseline: OrientationLetterOutput) {
  return {
    systemInstruction: {
      parts: [{ text: [
        "You are the personal orientation letter writer for Campus Allemagne.",
        localeInstructions[locale],
        "Rewrite the supplied orientation letter for a prospective student reading it for the first time: warm, encouraging, optimistic, personal, factual and easy to scan.",
        "The supplied reference is authoritative: do not add facts or inferences not explicitly there.",
        "Never invent university admission, equivalence, visas, tuition, costs, deadlines, programme names, scores or language requirements.",
        "Keep all cautions, limitations, and the need for human verification.",
        "If academic access is unconfirmed in the reference, say plainly that it still needs checking. Never turn uncertainty into eligibility or admission.",
        "Language levels in the reference are student-declared levels, not accepted certificates unless explicitly identified as such. Never imply that a university accepted a certificate.",
        "If the reference contains a monthly budget, preserve its amount and currency in the rewritten letter. Explain that Campus Allemagne will take the declared budget into account if the student continues. Do not claim that any city or programme is affordable before actual costs are checked.",
        "If no city was chosen, say that the choice is still open; do not call it an advantage or imply better admission chances.",
        "Programme leads are options to examine, not confirmed admissions or proof that requirements are met.",
        "Do not claim that Campus Allemagne already contacted or verified a university unless the reference says so.",
        "No university names, contact details, URLs, citations, marketing promises, or claims of guaranteed results.",
        "Do not mention AI, algorithms, prompts, deterministic text, or providers.",
        "Return exactly the same number of paragraphs as in the reference, in the same factual order.",
        "Keep each paragraph on its own topic in this order when present: academic profile and study goal; academic access; declared languages; city preference; first programme leads.",
        "Aim for one or two short sentences per paragraph, roughly 20 to 40 words when possible; never omit a required fact or caution just to meet a length target.",
        "Build the student's confidence in exploring study opportunities while staying truthful. Prefer encouraging and concrete language over administrative or discouraging phrasing. Avoid vague praise, inflated confidence and repetitive reminders to check requirements.",
        "Only rewrite the natural language. In the closing, invite the student to continue with Campus Allemagne. If the student chooses to continue, our team can review the academic conditions and guide the next steps. Do not give the student an administrative to-do list or claim that human review already started.",
      ].join("\n") }],
    },
    contents: [{
      role: "user",
      parts: [{ text: JSON.stringify({
        locale,
        reference_paragraphs: baseline.paragraphs,
        reference_closing: baseline.closing,
      }) }],
    }],
    generationConfig: {
      maxOutputTokens: 3600,
      thinkingConfig: { thinkingLevel: "low" },
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        properties: {
          paragraphs: {
            type: "array",
            items: { type: "string" },
            minItems: baseline.paragraphs.length,
            maxItems: baseline.paragraphs.length,
          },
          closing: { type: "string" },
        },
        required: ["paragraphs", "closing"],
      },
    },
  };
}

async function generateLetter(
  locale: Locale,
  baseline: OrientationLetterOutput,
  apiKey: string,
  model: string,
  key: string,
): Promise<OrientationLetterOutput> {
  const startedAt = Date.now();
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody(locale, baseline)),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      },
    );
    const durationMs = Date.now() - startedAt;
    if (!response.ok) {
      logOutcome("provider_http_error", model, durationMs, response.status);
      return baseline;
    }
    const payload = await response.json() as GeminiResponse;
    const rewritten = groundedLetter(readDraft(payload), baseline);
    if (!rewritten) {
      logOutcome("invalid_or_unsupported_output", model, durationMs);
      return baseline;
    }
    cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value: rewritten });
    pruneCache();
    logOutcome("generated", model, durationMs);
    return rewritten;
  } catch {
    logOutcome("network_or_timeout", model, Date.now() - startedAt);
    return baseline;
  }
}

/**
 * The candidate-facing fallback letter is independent from university discovery.
 * In particular, an empty shortlist must not disable Gemini copywriting.
 */
export async function writeOrientationLetterWithGemini(
  locale: Locale,
  baseline: OrientationLetterOutput,
): Promise<OrientationLetterOutput> {
  if (baseline.mode !== "deterministic") return baseline;
  if (process.env.ALMAGO_ORIENTATION_WRITER_PROVIDER !== "gemini") return baseline;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    logOutcome("missing_credentials", "none", 0);
    return baseline;
  }
  const model = process.env.ALMAGO_ORIENTATION_WRITER_MODEL?.trim() || DEFAULT_MODEL;
  const key = JSON.stringify({ model, locale, baseline });
  pruneCache();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const generation = generateLetter(locale, baseline, apiKey, model, key);
  inFlight.set(key, generation);
  try {
    return await generation;
  } finally {
    if (inFlight.get(key) === generation) inFlight.delete(key);
  }
}
