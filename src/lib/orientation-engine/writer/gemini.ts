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
    fr: "Écris en français simple, chaleureux et naturel pour un étudiant tunisien. Vouvoie toujours le candidat. Utilise un ton humain, rassurant et premium, sans jargon administratif.",
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
    "Write like a trusted study-abroad agency that already understands the candidate's project and is actively piloting the next steps.",
    "Use a balanced tone: emotional enough to create confidence, professional enough to demonstrate expertise, and simple enough to scan quickly.",
    "Celebrate only achievements explicitly present in PROFIL_ETUDIANT. Never invent effort, family reactions, prestige, admission potential or personal history.",
    "Never write absolute-fit or prestige claims such as perfectly matches, exactly matches, ideal, elite, excellence standards, prestigious, top university or strong admission potential unless that exact claim is supplied as a verified fact.",
    "A declared language level is not automatically a certified or validated level. Never say validated, certified or passed unless the supplied context explicitly says so.",
    "Do not say the candidate is taking modules, attending a course, using a partner school or preparing a specific exam unless that activity is explicitly supplied.",
    "Do not say a language milestone is required by the selected universities unless that requirement is present in verified programme facts. Otherwise present it only as the candidate's next progression objective.",
    "Do not claim budget fit, direct academic access, Numerus Clausus status, diploma recognition, subject-module recognition or a future intake unless explicitly supported by verified facts.",
    "Avoid words that imply a guarantee such as secure, guarantee, unlock admission, perfect dossier or ensure success. Prefer structure, prepare, clarify, verify, compare and coordinate.",
    "Open with the candidate's real situation in a genuinely human way, then immediately turn it into a concrete Germany plan.",
    "The candidate should feel: I am understood as a person, I know what I need to do next, and Campus Allemagne is handling the complex coordination around me.",
    "Give the candidate ONE clear immediate priority. Do not give them a long list of research tasks.",
    "Phrase research, verification and dossier coordination as Campus Allemagne's work: we compare, we verify, we organize, we keep track, we prepare the next step.",
    "Never tell the candidate to independently verify university requirements when Campus Allemagne can frame that as an ongoing verification.",
    "If LANGUAGE_FOCUS provides a next_level, make it the candidate's immediate language milestone, not the whole language ladder.",
    "Explain that Campus Allemagne continues the university work while the candidate advances on language or documents.",
    "Only claim concrete paid/operational services such as visa handling, translations, partner language schools, blocked account handling, applications or installation support when that service is explicitly present in OPTIONS_CAMPUS_ALLEMAGNE.",
    "Do not promise admission, visa success, recognition, acceptance or a perfect dossier.",
    "Keep every visible field concise, premium and easy to scan. Prefer one precise sentence over two explanatory sentences, and never repeat a fact already stated in another field.",
    "Avoid engine words such as score, algorithm, verified engine, candidate pool, deterministic, provider, cache, model, controlled selection or post-result audit.",
    "Do not expose internal reason/warning codes.",
    "Do not mention source URLs.",
    "",
    "HUMAN OPENING:",
    "The opening is the emotional handshake of the orientation. It must feel written for this candidate, not copied from a template.",
    "Use only facts explicitly present in PROFIL_ETUDIANT.",
    "If bac_status is obtained, congratulate the achievement naturally. If average_out_of_20 is present, you may mention it.",
    "If bac_status is preparing, encourage the candidate for the Bac stage without predicting success. Good examples are equivalent to: 'Bon courage pour cette étape vers le Bac. Votre projet Allemagne peut déjà se préparer dès maintenant.'",
    "If bac_status is no_bac, do not shame, alarm or imply that Germany is impossible. Acknowledge that the project can still be structured and that the next academic step must be clarified.",
    "If target_degree is Master and last_diploma shows prior higher education, acknowledge the academic path already completed before moving to the Master project.",
    "If german_level is C1 or C2, it is acceptable to acknowledge that this is already meaningful progress in the Germany project, but never call it certified unless certification is explicitly supplied.",
    "Prefer warmth over hype: congratulations, encouragement, acknowledgement of progress, or calm reassurance depending on the profile.",
    "Never invent effort, sleepless nights, family pride, personality, talent, future success, admission potential or emotions.",
    "Never say 'you will get the Bac', 'you will be admitted', or any equivalent prediction. Encourage the next step without guaranteeing it.",
    "Do not force congratulations when there is no explicit achievement to celebrate.",
    "",
    "OUTPUT EXPERIENCE:",
    "opening: exactly 1 human sentence, ideally under 190 characters, adapted to the candidate's current academic stage. It should contain either congratulations, encouragement, acknowledgement of progress, or calm reassurance—whichever is genuinely supported.",
    "project_status: exactly 1 short transition sentence, ideally under 150 characters. It appears directly after the human opening, so move from emotion to action without repeating the opening or the hero title. For example, acknowledge that an important step has been crossed and that Campus Allemagne will now organise the next part of the project. Keep it factual and grounded.",
    "main_priority: this is the candidate's own next action. Use a short title and at most 1 concise sentence of explanation. Avoid repeating the same next step twice.",
    "language_plan: explain the immediate language milestone only when relevant.",
    "campus_value: explain what Campus Allemagne is doing in parallel. Use first-person plural in the candidate's language (we / nous / wir / نحن).",
    "roadmap: use exactly 3 concise responsibility steps: candidate, Campus Allemagne, shared milestone. Each text must be one short sentence, ideally under 100 characters. Do not duplicate the priority or reassurance.",
    "reassurance: close with calm confidence, emphasizing that the candidate does not have to manage the whole process alone.",
    "cta: make the label/action feel concrete and immediate while keeping exactly one allowed action_id.",
    "",
    "STUDY OPTIONS:",
    "Return exactly the supplied option_ids, once each, in their existing order.",
    "Do not add another university or programme.",
    "The backend injects institution/programme/city names, so study_options must contain only option_id, why_it_fits and verification_note.",
    "why_it_fits: exactly 1 concise sentence, ideally under 180 characters, answering why this programme belongs in this candidate's shortlist using only supported selection reasons and verified facts.",
    "Avoid generic filler such as 'this programme matches your goals' or merely restating the field/degree. When available, combine 2-3 differentiators such as specialty match, teaching-language match, preferred city, target intake, known deadline or known application route.",
    "Use a positive candidate-facing admission outlook when the supplied core_status, verified facts and selection reasons support it. In French, wording such as 'Première estimation Campus Allemagne : fortes chances d’admission' is allowed for strongly supported options; otherwise use a softer positive formulation such as 'bon potentiel d’admission'.",
    "Always frame that outlook as an initial Campus Allemagne estimate that will be confirmed together during the final human review. Never present it as guaranteed admission or as a statistical probability.",
    "Do not invent ranking advantages, cost-of-living claims or comparisons that are not present in the supplied facts.",
    "verification_note: exactly 1 concise sentence, ideally under 170 characters. Mention only the 2-3 most important remaining checks; do not restate confirmed facts already shown elsewhere.",
    "Do not write 'you must verify', 'check this yourself' or similar hand-offs to the candidate unless the supplied action explicitly requires it.",
    "Use precise fee wording: distinguish tuition fees from semester contributions and other published charges.",
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
