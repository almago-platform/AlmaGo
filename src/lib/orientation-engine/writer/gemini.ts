import "server-only";

import {
  buildDeterministicOrientationWriterContent,
  buildOrientationWriterContext,
  parseOrientationWriterPayload,
  type RawOrientationWriterPayload,
} from "@/lib/orientation-engine/writer/core";
import type {
  OrientationWriterInput,
  OrientationWriterResult,
  OrientationWriterUsage,
} from "@/lib/orientation-engine/writer/types";

const DEFAULT_MODEL = "gemini-3.8-flash";
const REQUEST_TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
};

const cache = new Map<
  string,
  {
    expiresAt: number;
    value: OrientationWriterResult;
  }
>();

const inFlight = new Map<string, Promise<OrientationWriterResult>>();

function emptyUsage(durationMs = 0): OrientationWriterUsage {
  return {
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    durationMs,
  };
}

function providerUsage(
  payload: GeminiGenerateContentResponse,
  durationMs: number,
): OrientationWriterUsage {
  return {
    requests: 1,
    inputTokens: payload.usageMetadata?.promptTokenCount || 0,
    outputTokens: payload.usageMetadata?.candidatesTokenCount || 0,
    totalTokens: payload.usageMetadata?.totalTokenCount || 0,
    durationMs,
  };
}

function fallbackResult(
  input: OrientationWriterInput,
  reason: OrientationWriterResult["reason"],
  model: string | null,
  usage: OrientationWriterUsage = emptyUsage(),
): OrientationWriterResult {
  return {
    provider: "deterministic",
    model,
    status: "fallback",
    reason,
    content: buildDeterministicOrientationWriterContent(input),
    usage,
  };
}

function localeInstruction(locale: OrientationWriterInput["locale"]) {
  return {
    fr: "Écris en français simple, chaleureux et naturel pour un étudiant tunisien de 18 à 22 ans. Utilise un ton humain, encourageant et convaincant sans jargon administratif.",
    ar: "اكتب بالعربية الفصحى السهلة والطبيعية لطالب تونسي عمره بين 18 و22 سنة. استخدم أسلوبًا إنسانيًا ومشجعًا ومقنعًا من دون لغة إدارية معقدة.",
    en: "Write in simple, warm, natural English for a student aged 18 to 22. Be human, encouraging and persuasive without administrative jargon.",
    de: "Schreibe in einfachem, warmem und natürlichem Deutsch für Studierende zwischen 18 und 22 Jahren. Sei menschlich, motivierend und überzeugend, ohne Verwaltungssprache.",
  }[locale];
}

function systemPrompt(locale: OrientationWriterInput["locale"]) {
  return [
    "You are Campus Allemagne's personalized orientation writer.",
    "You are a UX and marketing writer, not an admissions authority and not a research agent.",
    localeInstruction(locale),
    "",
    "NON-NEGOTIABLE TRUTH RULE:",
    "AlmaGo has already performed discovery, verification and deterministic selection.",
    "You must never change, recalculate, rank, add or remove a university option.",
    "You must never decide admission eligibility, diploma recognition or visa eligibility.",
    "Use only the supplied JSON context. Do not use outside knowledge.",
    "Do not invent deadlines, fees, language thresholds, certificates, durations, cities, university facts, admission chances or requirements.",
    "A fact in facts_to_review is uncertain and must never be stated as certain.",
    "A missing_fact stays missing. Do not fill it.",
    "Never guarantee admission or acceptance.",
    "",
    "WRITING PRINCIPLES:",
    "The student is the hero; Campus Allemagne is the guide.",
    "Celebrate only achievements explicitly present in PROFIL_ETUDIANT.",
    "Make a large project feel like the next small step.",
    "If LANGUAGE_FOCUS provides a next_level, focus on that immediate next level instead of listing the whole language ladder.",
    "Explain that the university project can keep progressing while language preparation progresses, but do not claim a Campus Allemagne service unless it exists in OPTIONS_CAMPUS_ALLEMAGNE.",
    "Keep paragraphs short and easy to scan.",
    "Avoid engine words such as score, algorithm, verified engine, candidate pool, deterministic, provider, cache or model.",
    "Do not expose internal reason/warning codes.",
    "Do not mention source URLs.",
    "",
    "STUDY OPTIONS:",
    "Return exactly the supplied option_ids, once each, in their existing order.",
    "Do not add another university or programme.",
    "The backend injects institution/programme/city names, so study_options must contain only option_id, why_it_fits and verification_note.",
    "why_it_fits may summarize only supported reasons/facts from that option.",
    "verification_note must stay honest about remaining review/unknown items.",
    "",
    "CAMPUS VALUE:",
    "If OPTIONS_CAMPUS_ALLEMAGNE is non-empty, describe only those services.",
    "If it is empty, use a generic idea: language and the university project can progress in parallel. Do not invent partner schools, online document handling, visa management or other services.",
    "",
    "CTA:",
    "Use exactly one action_id from ACTIONS_DISPONIBLES.",
    "Do not invent another action.",
    "",
    "Return only JSON matching the schema.",
  ].join("\n");
}

function responseSchema(input: OrientationWriterInput) {
  const context = buildOrientationWriterContext(input);
  const optionIds = context.FAITS_VERIFIES.programmes.map(
    (programme) => programme.option_id,
  );
  const actionIds = context.ACTIONS_DISPONIBLES.map((action) => action.id);

  return {
    type: "object",
    additionalProperties: false,
    properties: {
      opening: { type: "string" },
      project_status: { type: "string" },
      main_priority: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          text: { type: "string" },
          next_step: { type: "string" },
        },
        required: ["title", "text", "next_step"],
      },
      language_plan: {
        type: "object",
        additionalProperties: false,
        properties: {
          show: { type: "boolean" },
          current_level: { type: ["string", "null"] },
          next_level: { type: ["string", "null"] },
          text: { type: "string" },
          available_paths: {
            type: "array",
            maxItems: 5,
            items: { type: "string" },
          },
        },
        required: [
          "show",
          "current_level",
          "next_level",
          "text",
          "available_paths",
        ],
      },
      campus_value: { type: "string" },
      study_options: {
        type: "array",
        minItems: optionIds.length,
        maxItems: optionIds.length,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            option_id: {
              type: "string",
              enum: optionIds.length > 0 ? optionIds : ["none"],
            },
            why_it_fits: { type: "string" },
            verification_note: { type: "string" },
          },
          required: ["option_id", "why_it_fits", "verification_note"],
        },
      },
      roadmap: {
        type: "array",
        minItems: 2,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            label: { type: "string" },
            text: { type: "string" },
          },
          required: ["id", "label", "text"],
        },
      },
      reassurance: { type: "string" },
      cta: {
        type: "object",
        additionalProperties: false,
        properties: {
          action_id: {
            type: "string",
            enum: actionIds,
          },
          label: { type: "string" },
          text: { type: "string" },
        },
        required: ["action_id", "label", "text"],
      },
    },
    required: [
      "opening",
      "project_status",
      "main_priority",
      "language_plan",
      "campus_value",
      "study_options",
      "roadmap",
      "reassurance",
      "cta",
    ],
  };
}

export function buildGeminiOrientationWriterRequest(
  input: OrientationWriterInput,
) {
  const context = buildOrientationWriterContext(input);

  return {
    systemInstruction: {
      parts: [{ text: systemPrompt(input.locale) }],
    },
    contents: [{
      role: "user",
      parts: [{
        text: [
          "Write the personalized orientation from this exact AlmaGo context.",
          "Do not add knowledge that is not present here.",
          JSON.stringify(context),
        ].join("\n\n"),
      }],
    }],
    generationConfig: {
      temperature: 0.45,
      maxOutputTokens: 4000,
      thinkingConfig: {
        thinkingLevel: "low",
      },
      responseMimeType: "application/json",
      responseJsonSchema: responseSchema(input),
    },
  };
}

function responseText(payload: GeminiGenerateContentResponse) {
  const parts = payload.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => typeof part.text === "string" ? part.text : "")
    .join("")
    .trim();
}

function pruneCache(now = Date.now()) {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }

  while (cache.size > MAX_CACHE_ENTRIES) {
    const first = cache.keys().next().value as string | undefined;
    if (!first) break;
    cache.delete(first);
  }
}

function cacheKey(input: OrientationWriterInput, model: string) {
  return JSON.stringify({
    model,
    context: buildOrientationWriterContext(input),
  });
}

async function executeGeminiOrientationWriter(
  input: OrientationWriterInput,
  model: string,
  apiKey: string,
  key: string,
): Promise<OrientationWriterResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(buildGeminiOrientationWriterRequest(input)),
        signal: controller.signal,
        cache: "no-store",
      },
    );

    const durationMs = Date.now() - startedAt;
    if (!response.ok) {
      console.info("orientation_v4_gemini_http", JSON.stringify({
        model,
        status: response.status,
      }));

      return fallbackResult(
        input,
        "provider_error",
        model,
        {
          ...emptyUsage(durationMs),
          requests: 1,
        },
      );
    }

    const payload = await response.json() as GeminiGenerateContentResponse;
    const usage = providerUsage(payload, durationMs);
    const text = responseText(payload);

    if (!text) {
      return fallbackResult(input, "invalid_output", model, usage);
    }

    let raw: RawOrientationWriterPayload;
    try {
      raw = JSON.parse(text) as RawOrientationWriterPayload;
    } catch {
      return fallbackResult(input, "invalid_output", model, usage);
    }

    const content = parseOrientationWriterPayload(input, raw);
    if (!content) {
      return fallbackResult(input, "invalid_output", model, usage);
    }

    const result: OrientationWriterResult = {
      provider: "gemini",
      model,
      status: "ready",
      reason: null,
      content,
      usage,
    };

    cache.set(key, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      value: result,
    });
    pruneCache();

    return result;
  } catch {
    const durationMs = Date.now() - startedAt;
    return fallbackResult(
      input,
      "provider_error",
      model,
      {
        ...emptyUsage(durationMs),
        requests: 1,
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function runGeminiOrientationWriter(
  input: OrientationWriterInput,
): Promise<OrientationWriterResult> {
  const model =
    process.env.ALMAGO_ORIENTATION_WRITER_MODEL?.trim() || DEFAULT_MODEL;

  if (input.selection.selected.length === 0) {
    return fallbackResult(input, "no_selection", model);
  }

  if (process.env.ALMAGO_ORIENTATION_WRITER_PROVIDER !== "gemini") {
    return fallbackResult(input, "feature_disabled", model);
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return fallbackResult(input, "missing_credentials", model);
  }

  const key = cacheKey(input, model);
  pruneCache();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const execution = executeGeminiOrientationWriter(
    input,
    model,
    apiKey,
    key,
  );
  inFlight.set(key, execution);

  try {
    return await execution;
  } finally {
    if (inFlight.get(key) === execution) {
      inFlight.delete(key);
    }
  }
}
