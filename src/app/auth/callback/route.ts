import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  // Do not turn a user-facing redirect into https://localhost:3000 when
  // a reverse proxy passes its internal URL to this route.
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: next,
      "Cache-Control": "private, no-store",
    },
  });
}

function safeNextPath(value: string | null) {
  if (!value) return "/student";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/student";
  return value;
}
