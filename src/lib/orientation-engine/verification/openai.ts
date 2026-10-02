import "server-only";

import {
  buildOrientationProgrammeVerification,
  buildOrientationVerificationFallback,
  ORIENTATION_VERIFICATION_MAX_CANDIDATES,
  selectOrientationCandidatesForVerification,
  type RawProgrammeVerificationEvidence,
} from "@/lib/orientation-engine/verification/core";
import {
  emptyOrientationDiscoveryUsage,
  mergeOrientationDiscoveryUsage,
} from "@/lib/orientation-engine/discovery/research";
import type {
  OrientationDiscoveryResearchCandidate,
  OrientationDiscoveryUsage,
} from "@/lib/orientation-engine/discovery/types";
import type {
  OrientationProgrammeVerification,
  OrientationVerificationResult,
} from "@/lib/orientation-engine/verification/types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-6-luna";
const QUERY_TIMEOUT_MS = 12_000;
const MAX_PROVIDER_REQUESTS = ORIENTATION_VERIFICATION_MAX_CANDIDATES + 1;

type OpenAIWebSource = {
  url?: string;
};

type OpenAIResponseItem = {
  type?: string;
  action?: {
    sources?: OpenAIWebSource[];
  };
  content?: Array<{
    type?: string;
    text?: string;
    annotations?: Array<{
      type?: string;
      url?: string;
      url_citation?: {
        url?: string;
      };
    }>;
  }>;
};

type OpenAIResponsePayload = {
  output_text?: string;
  output?: OpenAIResponseItem[];
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
};

type CandidateVerificationResult = {
  ok: boolean;
  retriable: boolean;
  programme: OrientationProgrammeVerification;
  usage: OrientationDiscoveryUsage;
};

const nullableStringSchema = {
  anyOf: [
    { type: "string" },
    { type: "null" },
  ],
} as const;

const nullableBooleanSchema = {
  anyOf: [
    { type: "boolean" },
    { type: "null" },
  ],
} as const;

function scalarEvidenceSchema(valueSchema: object) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      value: valueSchema,
      sourceUrl: nullableStringSchema,
    },
    required: ["value", "sourceUrl"],
  } as const;
}

const stringArrayEvidenceSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    value: {
      type: "array",
      maxItems: 16,
      items: { type: "string" },
    },
    sourceUrl: nullableStringSchema,
  },
  required: ["value", "sourceUrl"],
} as const;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    programmeExists: scalarEvidenceSchema(nullableBooleanSchema),
    degreeLevel: scalarEvidenceSchema(nullableStringSchema),
    city: scalarEvidenceSchema(nullableStringSchema),
    teachingLanguage: scalarEvidenceSchema(nullableStringSchema),
    germanLanguageRequirement: scalarEvidenceSchema(nullableStringSchema),
    englishLanguageRequirement: scalarEvidenceSchema(nullableStringSchema),
    acceptedLanguageCertificates: stringArrayEvidenceSchema,
    intakeTerms: stringArrayEvidenceSchema,
    winterDeadline: scalarEvidenceSchema(nullableStringSchema),
    summerDeadline: scalarEvidenceSchema(nullableStringSchema),
    applicationRoute: scalarEvidenceSchema({
      anyOf: [
        { type: "string", enum: ["direct", "uni_assist", "other"] },
        { type: "null" },
      ],
    }),
    applicationUrl: scalarEvidenceSchema(nullableStringSchema),
    studienkollegRequirement: scalarEvidenceSchema(nullableBooleanSchema),
    tuitionOrSemesterFees: scalarEvidenceSchema(nullableStringSchema),
  },
  required: [
    "programmeExists",
    "degreeLevel",
    "city",
    "teachingLanguage",
    "germanLanguageRequirement",
    "englishLanguageRequirement",
    "acceptedLanguageCertificates",
    "intakeTerms",
    "winterDeadline",
    "summerDeadline",
    "applicationRoute",
    "applicationUrl",
    "studienkollegRequirement",
    "tuitionOrSemesterFees",
  ],
} as const;

function systemInstructions() {
  return [
    "You are AlmaGo's programme fact verification researcher.",
    "You verify one German university programme at a time.",
    "Use the web search tool exactly once to revisit the candidate and primary official sources.",
    "Prefer the official programme page and other pages on the same university domain.",
    "Use DAAD, Hochschulkompass or uni-assist only as secondary evidence when a university source is unavailable.",
    "Never decide student admission eligibility or diploma recognition.",
    "Never infer a language threshold, deadline, intake, fee, application route, Studienkolleg requirement, or certificate.",
    "For every field, provide a value only when the source explicitly supports it.",
    "For programmeExists, return true only when a current official source clearly presents the programme; return false only when an official source explicitly says it is discontinued/closed; otherwise null.",
    "For deadlines, do not calculate or transform a date that the source does not explicitly state.",
    "For applicationRoute, use direct only for a university-direct application, uni_assist only when explicitly documented, other for another explicit route, and null otherwise.",
    "For array fields, return an empty array when no explicit evidence is found.",
    "Every non-null/non-empty value must carry the exact source URL where it was found.",
    "Do not claim that the whole programme is verified. AlmaGo applies deterministic source gates after your extraction.",
  ].join("\n");
}

function userInput(candidate: OrientationDiscoveryResearchCandidate) {
  return JSON.stringify({
    candidate: {
      institution: candidate.institution,
      programme: candidate.programme,
      degree: candidate.degree,
      city: candidate.city,
      teaching_language: candidate.teachingLanguage,
      official_programme_url: candidate.officialProgrammeUrl,
      official_university_url: candidate.officialUniversityUrl,
      known_source_urls: candidate.sourceUrls,
    },
    requested_facts: [
      "programme existence",
      "degree level",
      "city",
      "teaching language",
      "German language requirement",
      "English language requirement",
      "accepted language certificates",
      "available intake terms",
      "winter deadline",
      "summer deadline",
      "application route",
      "application URL",
      "Studienkolleg requirement when explicitly documented",
      "tuition or semester fees when explicitly documented",
    ],
  });
}

function responseText(payload: OpenAIResponsePayload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  for (const item of payload.output || []) {
    if (item.type !== "message") continue;
    for (const content of item.content || []) {
      if (
        (content.type === "output_text" || !content.type)
        && typeof content.text === "string"
        && content.text.trim()
      ) {
        return content.text.trim();
      }
    }
  }

  return null;
}

function sourceUrlsFromResponse(payload: OpenAIResponsePayload) {
  const urls: string[] = [];

  for (const item of payload.output || []) {
    if (item.type === "web_search_call") {
      for (const source of item.action?.sources || []) {
        if (typeof source.url === "string") urls.push(source.url);
      }
    }

    if (item.type === "message") {
      for (const content of item.content || []) {
        for (const annotation of content.annotations || []) {
          const url = annotation.url || annotation.url_citation?.url;
          if (typeof url === "string") urls.push(url);
        }
      }
    }
  }

  return [...new Set(urls)];
}

function usageFromResponse(
  payload: OpenAIResponsePayload,
  durationMs: number,
  sourceCount: number,
): OrientationDiscoveryUsage {
  const inputTokens = payload.usage?.input_tokens || 0;
  const outputTokens = payload.usage?.output_tokens || 0;

  return {
    requests: 1,
    webSearchCalls: (payload.output || []).filter(
      (item) => item.type === "web_search_call",
    ).length,
    queriesAttempted: 1,
    queriesSucceeded: 1,
    inputTokens,
    outputTokens,
    totalTokens: payload.usage?.total_tokens || inputTokens + outputTokens,
    sourceUrlsSeen: sourceCount,
    durationMs,
  };
}

function failedUsage(durationMs: number): OrientationDiscoveryUsage {
  return {
    ...emptyOrientationDiscoveryUsage(),
    requests: 1,
    queriesAttempted: 1,
    durationMs,
  };
}

async function verifyCandidate({
  apiKey,
  model,
  candidate,
}: {
  apiKey: string;
  model: string;
  candidate: OrientationDiscoveryResearchCandidate;
}): Promise<CandidateVerificationResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        reasoning: { effort: "low" },
        tools: [{
          type: "web_search",
          search_context_size: "low",
        }],
        tool_choice: "required",
        max_tool_calls: 1,
        include: ["web_search_call.action.sources"],
        input: [
          {
            role: "system",
            content: systemInstructions(),
          },
          {
            role: "user",
            content: userInput(candidate),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "almago_orientation_verification",
            strict: true,
            schema: responseSchema,
          },
        },
        max_output_tokens: 3_500,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const durationMs = Date.now() - startedAt;
    if (!response.ok) {
      return {
        ok: false,
        retriable: response.status === 429 || response.status >= 500,
        programme: buildOrientationVerificationFallback(candidate),
        usage: failedUsage(durationMs),
      };
    }

    const payload = await response.json() as OpenAIResponsePayload;
    const text = responseText(payload);
    const webSourceUrls = sourceUrlsFromResponse(payload);
    const usage = usageFromResponse(payload, durationMs, webSourceUrls.length);

    if (!text || webSourceUrls.length === 0) {
      return {
        ok: false,
        retriable: false,
        programme: buildOrientationVerificationFallback(candidate),
        usage,
      };
    }

    let evidence: RawProgrammeVerificationEvidence;
    try {
      evidence = JSON.parse(text) as RawProgrammeVerificationEvidence;
    } catch {
      return {
        ok: false,
        retriable: false,
        programme: buildOrientationVerificationFallback(candidate),
        usage,
      };
    }

    return {
      ok: true,
      retriable: false,
      programme: buildOrientationProgrammeVerification({
        candidate,
        evidence,
        webSourceUrls,
      }),
      usage,
    };
  } catch {
    return {
      ok: false,
      retriable: true,
      programme: buildOrientationVerificationFallback(candidate),
      usage: failedUsage(Date.now() - startedAt),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackResult(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
  status: OrientationVerificationResult["status"],
  reason: OrientationVerificationResult["reason"],
  model: string | null,
): OrientationVerificationResult {
  const selected = selectOrientationCandidatesForVerification(candidates);
  return {
    provider: "deterministic",
    model,
    status,
    reason,
    programmes: selected.map((candidate) =>
      buildOrientationVerificationFallback(candidate)
    ),
    usage: emptyOrientationDiscoveryUsage(),
    candidatesConsidered: selected.length,
    candidatesVerified: 0,
  };
}

export async function runOpenAIOrientationVerification(
  candidates: readonly OrientationDiscoveryResearchCandidate[],
): Promise<OrientationVerificationResult> {
  const selected = selectOrientationCandidatesForVerification(candidates);

  if (selected.length === 0) {
    return fallbackResult([], "unavailable", "no_candidates", null);
  }

  if (process.env.ALMAGO_ORIENTATION_VERIFICATION_PROVIDER !== "openai") {
    return fallbackResult(selected, "disabled", "feature_disabled", null);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model =
    process.env.ALMAGO_ORIENTATION_VERIFICATION_MODEL?.trim() || DEFAULT_MODEL;

  if (!apiKey) {
    return fallbackResult(selected, "unavailable", "missing_credentials", model);
  }

  const startedAt = Date.now();
  const initial = await Promise.all(
    selected.map((candidate) => verifyCandidate({ apiKey, model, candidate })),
  );
  const results = [...initial];

  const retryIndex = initial.findIndex(
    (result) => !result.ok && result.retriable,
  );

  if (retryIndex >= 0 && results.length < MAX_PROVIDER_REQUESTS) {
    results.push(await verifyCandidate({
      apiKey,
      model,
      candidate: selected[retryIndex],
    }));
  }

  const byCandidate = new Map<string, CandidateVerificationResult>();
  for (const result of results) {
    const key = [
      result.programme.candidate.institution,
      result.programme.candidate.programme,
    ].join("::").toLocaleLowerCase("en");

    const current = byCandidate.get(key);
    if (!current || (!current.ok && result.ok)) {
      byCandidate.set(key, result);
    }
  }

  const finalResults = selected.map((candidate) => {
    const key = [candidate.institution, candidate.programme]
      .join("::")
      .toLocaleLowerCase("en");
    return byCandidate.get(key) || {
      ok: false,
      retriable: false,
      programme: buildOrientationVerificationFallback(candidate),
      usage: emptyOrientationDiscoveryUsage(),
    };
  });

  const usage = mergeOrientationDiscoveryUsage(
    ...results.map((result) => result.usage),
  );
  usage.durationMs = Date.now() - startedAt;

  const successful = finalResults.filter((result) => result.ok).length;
  const programmes = finalResults.map((result) => result.programme);

  return {
    provider: "openai",
    model,
    status: successful > 0 ? "ready" : "unavailable",
    reason: successful > 0 ? null : "provider_error",
    programmes,
    usage,
    candidatesConsidered: selected.length,
    candidatesVerified: programmes.filter(
      (programme) => programme.overallStatus === "verified",
    ).length,
  };
}
