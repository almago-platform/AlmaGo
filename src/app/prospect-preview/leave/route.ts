import { NextResponse } from "next/server";
import { PROVISIONAL_COOKIE, PROVISIONAL_COOKIE_PATH } from "@/lib/prospect/provisional-cookie";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set(PROVISIONAL_COOKIE, "", { path: PROVISIONAL_COOKIE_PATH, maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
