import { NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n";
import { validatePublicOrientationAnswers } from "@/lib/orientation/validate";
import { createOrientationAdvisor } from "@/lib/orientation-engine/advisor/deterministic";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import {
  buildOrientationEngineResult,
  buildOrientationEngineResultForGeographicScope,
  hasStrongCatalogueMatch,
} from "@/lib/orientation-engine/service";
import {
  buildOrientationGeographicScopes,
  type OrientationGeographicScope,
} from "@/lib/orientation-engine/geography";
import { buildOrientationIntelligence } from "@/lib/orientation-engine/intelligence";
import {
  finalizeOrientationSelectionPipeline,
  runOrientationResultPipeline,
  runOrientationSelectionPipeline,
  type OrientationSelectionPipelineAttempt,
} from "@/lib/orientation-engine/result/service";
import { buildOrientationCanonicalShortlist } from "@/lib/orientation-engine/result/canonical";
import type { OrientationPublicPersonalizedResult } from "@/lib/orientation-engine/result/types";
import {
  acquireRequestConcurrency,
  concurrencyLimitedResponse,
  enforceRequestRateLimit,
  PUBLIC_ABUSE_POLICIES,
} from "@/lib/security/abuse";

const MAX_BODY_BYTES = 24_000;

export async function POST(request: Request) {
  const startedAt = Date.now();
  const policy = PUBLIC_ABUSE_POLICIES.orientationEngine;
  const limited = enforceRequestRateLimit(request, policy);
  if (limited) return limited;

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || JSON.stringify(body).length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const profile = validatePublicOrientationAnswers(record.answers);
  const locale = normalizeLocale(typeof record.locale === "string" ? record.locale : null);

  if (!profile) {
    return NextResponse.json({ error: "Invalid orientation profile." }, { status: 400 });
  }

  const lease = acquireRequestConcurrency(policy.route, 2);
  if (!lease) return concurrencyLimitedResponse(policy.route);

  try {
    const catalogue = await loadVerifiedProgrammeCatalogue();
    const baseEngineResult = buildOrientationEngineResult(profile, catalogue);
    let engineResult = baseEngineResult;
    let personalized: OrientationPublicPersonalizedResult | null = null;
    let lastScopedAttempt: OrientationSelectionPipelineAttempt | null = null;

    const geography: {
      requestedCities: string[];
      resolvedTier: OrientationGeographicScope["tier"] | null;
      source: "catalogue" | "openai" | null;
      scopeCities: string[];
      landNames: string[];
      attempted: Array<{
        tier: OrientationGeographicScope["tier"];
        source: "catalogue" | "openai";
      }>;
    } = {
      requestedCities: [...profile.preferredCities],
      resolvedTier: null,
      source: null,
      scopeCities: [],
      landNames: [],
      attempted: [],
    };

    if (profile.preferredCities.length > 0) {
      const scopes = buildOrientationGeographicScopes(profile.preferredCities);

      for (const scope of scopes) {
        geography.attempted.push({ tier: scope.tier, source: "catalogue" });
        const scopedEngineResult =
          buildOrientationEngineResultForGeographicScope(
            profile,
            catalogue,
            scope,
          );

        if (hasStrongCatalogueMatch(scopedEngineResult)) {
          engineResult = scopedEngineResult;
          geography.resolvedTier = scope.tier;
          geography.source = "catalogue";
          geography.scopeCities = [...scope.cities];
          geography.landNames = [...scope.landNames];
          break;
        }

        // Catalogue checks retain all geographic tiers. To prevent four
        // serial remote discovery pipelines on sparse cities, run the remote
        // search at most once, after local/regional catalogue checks.
        if (scope.tier !== "germany") continue;
        geography.attempted.push({ tier: scope.tier, source: "openai" });

        try {
          const attempt = await runOrientationSelectionPipeline(profile, scope);
          lastScopedAttempt = attempt;

          if (attempt.selection.selected.length > 0) {
            personalized = await finalizeOrientationSelectionPipeline(
              locale,
              profile,
              attempt,
            );
            geography.resolvedTier = scope.tier;
            geography.source = "openai";
            geography.scopeCities = [...scope.cities];
            geography.landNames = [...scope.landNames];
            break;
          }
        } catch {
          // A failed OpenAI/verification tier never skips the deterministic
          // catalogue checks at the next geographic tier.
        }
      }

      if (
        !personalized
        && geography.resolvedTier === null
        && lastScopedAttempt
      ) {
        try {
          personalized = await finalizeOrientationSelectionPipeline(
            locale,
            profile,
            lastScopedAttempt,
          );
        } catch {
          personalized = null;
        }
      }
    } else if (!hasStrongCatalogueMatch(baseEngineResult)) {
      try {
        personalized = await runOrientationResultPipeline(locale, profile);
      } catch {
        // Catalogue-first remains authoritative: provider/persistence failure
        // cannot remove the deterministic catalogue orientation.
        personalized = null;
      }
    }

    const advisor = createOrientationAdvisor();
    const advisorResult = await advisor.advise({
      locale,
      profile,
      engineResult,
    });
    const shortlist = buildOrientationCanonicalShortlist(
      engineResult,
      personalized,
    );

    const intelligence = await buildOrientationIntelligence(
      locale,
      profile,
      engineResult,
      // The verified personalized result has its own Gemini writer.
      // Avoid an unused second AI letter request for that pathway.
      { generateLetter: shortlist.source !== "personalized_verified", enableScout: false },
    );

    console.info("orientation_v4_engine", JSON.stringify({
      outcome: "ready",
      durationMs: Date.now() - startedAt,
      shortlistSource: shortlist.source,
      selected: shortlist.items.length,
      geographicAttempts: geography.attempted.length,
    }));
    return NextResponse.json(
      {
        engine: engineResult,
        advisor: advisorResult,
        letter: intelligence.letter,
        scout: intelligence.scout,
        shortlist,
        personalized,
        geography,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch {
    // Never log student answers, location preferences or provider secrets.
    console.warn("orientation_v4_engine", JSON.stringify({
      outcome: "error",
      durationMs: Date.now() - startedAt,
    }));
    return NextResponse.json(
      { error: "Orientation engine is temporarily unavailable." },
      { status: 503 },
    );
  } finally {
    lease.release();
  }
}
