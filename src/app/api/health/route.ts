import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "almago",
      revision: process.env.RENDER_GIT_COMMIT?.slice(0, 12) || null,
      branch: process.env.RENDER_GIT_BRANCH || null,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
