import { NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n";
import { validatePublicOrientationAnswers } from "@/lib/orientation/validate";
import { createOrientationAdvisor } from "@/lib/orientation-engine/advisor/deterministic";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import {
  buildOrientationEngineResult,
  hasPreferredCityCatalogueMatch,
} from "@/lib/orientation-engine/service";
import { buildOrientationIntelligence } from "@/lib/orientation-engine/intelligence";
import { runOrientationResultPipeline } from "@/lib/orientation-engine/result/service";
import { buildOrientationCanonicalShortlist } from "@/lib/orientation-engine/result/canonical";
import type { OrientationPublicPersonalizedResult } from "@/lib/orientation-engine/result/types";

const MAX_BODY_BYTES = 24_000;

export async function POST(request: Request) {
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

  try {
    const catalogue = await loadVerifiedProgrammeCatalogue();
    const engineResult = buildOrientationEngineResult(profile, catalogue);
    const catalogueHasPreferredCityMatch =
      hasPreferredCityCatalogueMatch(engineResult);
    const advisor = createOrientationAdvisor();
    const advisorResult = await advisor.advise({
      locale,
      profile,
      engineResult,
    });
    const intelligence = await buildOrientationIntelligence(
      locale,
      profile,
      engineResult,
    );

    let personalized: OrientationPublicPersonalizedResult | null = null;
    if (!catalogueHasPreferredCityMatch) {
      try {
        personalized = await runOrientationResultPipeline(locale, profile);
      } catch {
        // E is additive. A provider/persistence failure must never remove the
        // already-safe deterministic orientation returned below.
        personalized = null;
      }
    }

    const shortlist = buildOrientationCanonicalShortlist(
      engineResult,
      personalized,
    );

    return NextResponse.json(
      {
        engine: engineResult,
        advisor: advisorResult,
        letter: intelligence.letter,
        scout: intelligence.scout,
        shortlist,
        personalized,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Orientation engine is temporarily unavailable." },
      { status: 503 },
    );
  }
}
