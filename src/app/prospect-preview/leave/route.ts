import { NextResponse } from "next/server";
import { PREVIEW_COOKIE } from "../start/route";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.delete(PREVIEW_COOKIE);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
