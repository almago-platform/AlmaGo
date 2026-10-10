import { NextResponse } from "next/server";
import { isPhase2AccountLinkingEnabled } from "@/lib/phase2/config";
import { hashOrientationResumeToken } from "@/lib/orientation/resume-token";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { PROVISIONAL_COOKIE, PROVISIONAL_COOKIE_PATH, PROVISIONAL_COOKIE_TTL_SECONDS } from "@/lib/prospect/provisional-cookie";

export const dynamic = "force-dynamic";
 

// A preview is a short-lived, read-only capability, NOT an Auth session.
// Never resolve or claim a prospect using only an unconfirmed email address.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination = new URL("/prospect-preview", url.origin);
  const response = NextResponse.redirect(destination, { status: 303 });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.cookies.set(PROVISIONAL_COOKIE, "", { path: PROVISIONAL_COOKIE_PATH, maxAge: 0 });

  if (!isPhase2AccountLinkingEnabled()) {
    return NextResponse.redirect(new URL("/orientation", url.origin));
  }

  const raw = url.searchParams.get("orientation_token");
  const hash = raw && hashOrientationResumeToken(raw);
  if (!raw || !hash) return response;

  try {
    const supabase = createPrivilegedSupabaseClient();
    const { data, error } = await supabase
      .from("orientations")
      .select("id")
      .eq("resume_token_hash", hash)
      .gt("resume_token_expires_at", new Date().toISOString())
      .eq("engine_version", "public-orientation-v1")
      .maybeSingle();
    if (!error && data?.id) {
      response.cookies.set(PROVISIONAL_COOKIE, raw, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: PROVISIONAL_COOKIE_PATH,
        maxAge: PROVISIONAL_COOKIE_TTL_SECONDS,
      });
    }
  } catch {
    // Never fall back to an email lookup or broaden access on DB failure.
  }
  return response;
}
