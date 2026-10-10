import { NextResponse } from "next/server";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { enforceRequestRateLimit, PUBLIC_ABUSE_POLICIES } from "@/lib/security/abuse";
import {
  createProvisionalSession,
  hashProvisionalPassword,
  isProvisionalCandidateEnabled,
  isTrustedProvisionalMutation,
  normalizeProvisionalEmail,
  validProvisionalPassword,
  verifyProvisionalPassword,
} from "@/lib/prospect/provisional-auth";

export const dynamic = "force-dynamic";
const invalid = () => NextResponse.json(
  { error: "Identifiants incorrects ou accès provisoire expiré." },
  { status: 401, headers: { "Cache-Control": "private, no-store" } },
);

export async function POST(request: Request) {
  if (!isProvisionalCandidateEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!(await isTrustedProvisionalMutation(request))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > 1024) return invalid();
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = normalizeProvisionalEmail(body?.email);
  const password = body?.password;
  if (!email || !validProvisionalPassword(password)) return invalid();
  const limited = enforceRequestRateLimit(
    request, PUBLIC_ABUSE_POLICIES.orientationAccountMutation, { accountId: email },
  );
  if (limited) return limited;

  try {
    const supabase = createPrivilegedSupabaseClient();
    const { data: credential, error } = await supabase
      .from("provisional_candidate_credentials")
      .select("id,orientation_id,email,first_name,last_name,password_hash,expires_at,failed_attempts,locked_until")
      .eq("email", email)
      .is("revoked_at", null)
      .is("verified_user_id", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) return invalid();
    if (!credential) {
      // Equalize the response cost for unknown credentials to reduce account
      // enumeration via response timing. No identifiable data is logged.
      await hashProvisionalPassword("fixed-invalid-credential");
      return invalid();
    }
    if (credential.locked_until && Date.parse(credential.locked_until) > Date.now()) {
      return invalid();
    }
    if (!(await verifyProvisionalPassword(password, credential.password_hash))) {
      await supabase.rpc("record_provisional_login_failure", { p_credential_id: credential.id });
      return invalid();
    }
    const { error: resetError } = await supabase
      .from("provisional_candidate_credentials")
      .update({ failed_attempts: 0, locked_until: null })
      .eq("id", credential.id)
      .is("revoked_at", null);
    if (resetError) return invalid();

    const ok = await createProvisionalSession({
      id: credential.id,
      orientationId: credential.orientation_id,
      email: credential.email,
      firstName: credential.first_name,
      lastName: credential.last_name,
      expiresAt: credential.expires_at,
    });
    if (!ok) return NextResponse.json({ error: "Connexion indisponible." }, { status: 503 });
    return NextResponse.json(
      { provisional: true, expiresAt: credential.expires_at },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Connexion indisponible." }, { status: 503 });
  }
}
