import { NextResponse } from "next/server";
import {
  isProvisionalCandidateEnabled,
  isTrustedProvisionalMutation,
  revokeCurrentProvisionalSession,
} from "@/lib/prospect/provisional-auth";

export async function POST(request: Request) {
  if (!isProvisionalCandidateEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!(await isTrustedProvisionalMutation(request))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const revoked = await revokeCurrentProvisionalSession();
  if (!revoked) {
    return NextResponse.json(
      { error: "Déconnexion impossible. Réessayez." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
