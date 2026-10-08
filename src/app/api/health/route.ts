import { getRuntimeExposureMode } from "@/lib/prelaunch";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "almago",
      revision: process.env.ALMAGO_BUILD_COMMIT?.slice(0, 12) || null,
      branch: process.env.ALMAGO_BUILD_BRANCH || null,
      exposureMode: getRuntimeExposureMode(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
