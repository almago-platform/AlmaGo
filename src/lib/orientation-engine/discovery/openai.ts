import "server-only";

import {
  DISCOVERY_MAX_CANDIDATES,
  DISCOVERY_MAX_SEARCH_QUERIES,
} from "@/lib/orientation-engine/discovery/contract";
import {
  createGroundedOrientationResearchCandidate,
  dedupeOrientationResearchCandidates,
  emptyOrientationDiscoveryUsage,
  mergeOrientationDiscoveryUsage,
} from "@/lib/orientation-engine/discovery/research";
import type {
  OrientationDiscoveryPlan,
  OrientationDiscoveryResearchCandidate,
  OrientationDiscoveryResearchResult,
  OrientationDiscoveryUsage,
} from "@/lib/orientation-engine/discovery/types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-6-luna";
const QUERY_TIMEOUT_MS = 12_000;
const MAX_PROVIDER_REQUESTS = DISCOVERY_MAX_SEARCH_QUERIES + 1;
const MAX_CANDIDATES_PER_QUERY = 4;

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

type StructuredCandidate = {
  institution: string;
  programme: string;
  degree: string | null;
  city: string | null;
  teachingLanguage: string | null;
  officialProgrammeUrl: string | null;
  officialUniversityUrl: string | null;
  discoveryReason: string;
  sourceUrls: string[];
};

type StructuredPayload = {
  candidates: StructuredCandidate[];
};

type QueryResult = {
  ok: boolean;
  retriable: boolean;
  candidates: OrientationDiscoveryResearchCandidate[];
  usage: OrientationDiscoveryUsage;
};

const nullableStringSchema = {
  anyOf: [
    { type: "string" },
    { type: "null" },
  ],
} as const;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    candidates: {
      type: "array",
      maxItems: MAX_CANDIDATES_PER_QUERY,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          institution: { type: "string" },
          programme: { type: "string" },
          degree: nullableStringSchema,
          city: nullableStringSchema,
          teachingLanguage: nullableStringSchema,
          officialProgrammeUrl: nullableStringSchema,
          officialUniversityUrl: nullableStringSchema,
          discoveryReason: { type: "string" },
          sourceUrls: {
            type: "array",
            maxItems: 8,
            items: { type: "string" },
          },
        },
        required: [
          "institution",
          "programme",
          "degree",
          "city",
          "teachingLanguage",
          "officialProgrammeUrl",
          "officialUniversityUrl",
          "discoveryReason",
          "sourceUrls",
        ],
      },
    },
  },
  required: ["candidates"],
} as const;

function systemInstructions() {
  return [
    "You are AlmaGo's university programme discovery researcher.",
    "Your only task is to discover real German university programmes worth sending to a separate verification engine.",
    "Use the web search tool for the exact supplied query.",
    "Prefer an official university programme page, then the university study portal, then Hochschulkompass or DAAD for discovery.",
    "Do not decide admission eligibility.",
    "Do not infer diploma recognition, Studienkolleg need, deadlines, fees, language thresholds, or accepted certificates.",
    "If a field is not explicitly supported by the web material you saw, return null.",
    "Only output URLs that you actually saw in the web research.",
    "Return at most four useful programme candidates for this query.",
    "A candidate is only a research lead; never describe it as verified or guaranteed.",
  ].join("\n");
}

function userInput(plan: OrientationDiscoveryPlan, query: string) {
  return JSON.stringify({
    query,
    student_profile: plan.profile,
    programme_families: plan.programmeFamilies.map((family) => ({
      id: family.id,
      label: family.label,
      aliases: family.aliases,
    })),
    constraints: {
      target_country: "Germany",
      target_degree: plan.profile.targetDegree,
      preferred_study_language: plan.profile.studyLanguage,
      preferred_cities: plan.profile.preferredCities,
      maximum_candidates_for_this_query: MAX_CANDIDATES_PER_QUERY,
    },
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

async function researchOneQuery({
  apiKey,
  model,
  plan,
  query,
}: {
  apiKey: string;
  model: string;
  plan: OrientationDiscoveryPlan;
  query: string;
}): Promise<QueryResult> {
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
        include: ["web_search_call.action.sources"],
        input: [
          {
            role: "system",
            content: systemInstructions(),
          },
          {
            role: "user",
            content: userInput(plan, query),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "almago_orientation_discovery",
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
        candidates: [],
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
        candidates: [],
        usage,
      };
    }

    let structured: StructuredPayload;
    try {
      structured = JSON.parse(text) as StructuredPayload;
    } catch {
      return {
        ok: false,
        retriable: false,
        candidates: [],
        usage,
      };
    }

    const candidates = Array.isArray(structured.candidates)
      ? structured.candidates
          .map((candidate) =>
            createGroundedOrientationResearchCandidate(
              candidate,
              webSourceUrls,
            )
          )
          .filter(
            (candidate): candidate is OrientationDiscoveryResearchCandidate =>
              Boolean(
                candidate
                && (
                  candidate.sourceUrls.length > 0
                  || candidate.officialProgrammeUrl
                  || candidate.officialUniversityUrl
                )
              ),
          )
      : [];

    return {
      ok: true,
      retriable: false,
      candidates,
      usage,
    };
  } catch {
    return {
      ok: false,
      retriable: true,
      candidates: [],
      usage: failedUsage(Date.now() - startedAt),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runOpenAIOrientationDiscovery(
  plan: OrientationDiscoveryPlan,
): Promise<OrientationDiscoveryResearchResult> {
  const startedAt = Date.now();

  if (plan.status !== "ready") {
    return {
      provider: "openai",
      model: null,
      status: "not_applicable",
      reason: "plan_not_ready",
      candidates: [],
      usage: emptyOrientationDiscoveryUsage(),
    };
  }

  if (process.env.ALMAGO_ORIENTATION_DISCOVERY_PROVIDER !== "openai") {
    return {
      provider: "openai",
      model: null,
      status: "disabled",
      reason: "feature_disabled",
      candidates: [],
      usage: emptyOrientationDiscoveryUsage(),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model =
    process.env.ALMAGO_ORIENTATION_DISCOVERY_MODEL?.trim() || DEFAULT_MODEL;

  if (!apiKey) {
    return {
      provider: "openai",
      model,
      status: "unavailable",
      reason: "missing_credentials",
      candidates: [],
      usage: emptyOrientationDiscoveryUsage(),
    };
  }

  const queries = plan.searchQueries.slice(0, DISCOVERY_MAX_SEARCH_QUERIES);
  const initialResults = await Promise.all(
    queries.map((query) => researchOneQuery({
      apiKey,
      model,
      plan,
      query,
    })),
  );

  const results = [...initialResults];
  const firstRetriableIndex = initialResults.findIndex(
    (result) => !result.ok && result.retriable,
  );

  if (
    firstRetriableIndex >= 0
    && results.length < MAX_PROVIDER_REQUESTS
  ) {
    results.push(await researchOneQuery({
      apiKey,
      model,
      plan,
      query: queries[firstRetriableIndex],
    }));
  }

  const candidates = dedupeOrientationResearchCandidates(
    results.flatMap((result) => result.candidates),
    DISCOVERY_MAX_CANDIDATES,
  );

  const usage = mergeOrientationDiscoveryUsage(
    ...results.map((result) => result.usage),
  );
  usage.durationMs = Date.now() - startedAt;

  return {
    provider: "openai",
    model,
    status: candidates.length > 0 ? "ready" : "unavailable",
    reason: candidates.length > 0 ? null : "provider_error",
    candidates,
    usage,
  };
}
