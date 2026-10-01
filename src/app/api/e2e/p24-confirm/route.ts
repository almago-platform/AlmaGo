import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isPhase2P24E2EProof } from "@/lib/phase2/config";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set<EmailOtpType>(["signup", "recovery"]);

function safeNextPath(value: string | null) {
  if (!value) return "/prospect";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/prospect";
  }
  return value;
}

export async function GET(request: Request) {
  if (!isPhase2P24E2EProof()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");

  if (!tokenHash || !rawType || !allowedTypes.has(rawType as EmailOtpType)) {
    return NextResponse.json({ error: "Invalid proof link." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: rawType as EmailOtpType,
  });

  if (error) {
    return NextResponse.json({ error: "Proof verification failed." }, { status: 400 });
  }

  return NextResponse.redirect(
    new URL(safeNextPath(url.searchParams.get("next")), url.origin),
  );
}
