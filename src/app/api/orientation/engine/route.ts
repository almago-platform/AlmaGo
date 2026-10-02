import { NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n";
import { validatePublicOrientationAnswers } from "@/lib/orientation/validate";
import { createOrientationAdvisor } from "@/lib/orientation-engine/advisor/deterministic";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import { buildOrientationEngineResult } from "@/lib/orientation-engine/service";

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
    const advisor = createOrientationAdvisor();
    const advisorResult = await advisor.advise({
      locale,
      profile,
      engineResult,
    });

    return NextResponse.json(
      {
        engine: engineResult,
        advisor: advisorResult,
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
