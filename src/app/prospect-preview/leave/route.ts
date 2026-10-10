import { NextResponse } from "next/server";
import { PROVISIONAL_COOKIE, PROVISIONAL_COOKIE_PATH } from "@/lib/prospect/provisional-cookie";

export async function GET() {
  // A relative Location preserves the public host behind Render/Next proxies.
  const response = new NextResponse(null, { status: 303, headers: { Location: "/" } });
  response.cookies.set(PROVISIONAL_COOKIE, "", { path: PROVISIONAL_COOKIE_PATH, maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
