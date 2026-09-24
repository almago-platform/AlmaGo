import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  let next = "/student";

  if (requestedNext?.startsWith("/")) {
    try {
      const candidate = new URL(requestedNext, url.origin);
      if (candidate.origin === url.origin) {
        next = `${candidate.pathname}${candidate.search}${candidate.hash}`;
      }
    } catch {
      // Keep the safe default.
    }
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
