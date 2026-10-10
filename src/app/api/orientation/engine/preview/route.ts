import { NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n";
import { validatePublicOrientationAnswers } from "@/lib/orientation/validate";
import { createOrientationAdvisor } from "@/lib/orientation-engine/advisor/deterministic";
import { deterministicLetter } from "@/lib/orientation-engine/intelligence";
import { buildOrientationCanonicalShortlist } from "@/lib/orientation-engine/result/canonical";
import { buildOrientationEngineResult } from "@/lib/orientation-engine/service";
import {
  enforceRequestRateLimit,
  PUBLIC_ABUSE_POLICIES,
} from "@/lib/security/abuse";

const MAX_BODY_BYTES = 24_000;

/**
 * A fast, bounded first-contact result. In particular, this route must never
 * query the programme catalogue or call OpenAI, Gemini, Supabase or persistence.
 * Unknown/unverified programmes are never included in its empty shortlist.
 * The original /api/orientation/engine enriches this response independently.
 */
export async function POST(request: Request) {
  const limited = enforceRequestRateLimit(request, PUBLIC_ABUSE_POLICIES.orientationPreview);
  if (limited) return limited;

  const length = Number(request.headers.get("content-length") || "0");
  if (length > MAX_BODY_BYTES) {
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
  if (!profile) {
    return NextResponse.json({ error: "Invalid orientation profile." }, { status: 400 });
  }

  const locale = normalizeLocale(typeof record.locale === "string" ? record.locale : null);
  const startedAt = Date.now();

  try {
    const engine = buildOrientationEngineResult(profile, []);
    const advisor = await createOrientationAdvisor().advise({ locale, profile, engineResult: engine });
    const letter = deterministicLetter(locale, profile, engine);
    const shortlist = buildOrientationCanonicalShortlist(engine, null);
    // Never log student facts, locations, letters or identifiers.
    console.info("orientation_v4_preview", JSON.stringify({
      outcome: "ready",
      durationMs: Date.now() - startedAt,
    }));

    return NextResponse.json({
      engine,
      advisor,
      letter,
      scout: {
        provider: "disabled",
        mode: "disabled",
        status: "disabled",
        candidates: [],
        citationUrls: [],
      },
      shortlist,
      personalized: null,
    }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    console.warn("orientation_v4_preview", JSON.stringify({ outcome: "error" }));
    return NextResponse.json({ error: "Preview unavailable." }, {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
