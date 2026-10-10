import "server-only";

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { getPublicOrigin } from "@/lib/public-origin";
import { isPhase2AccountLinkingEnabled, isPhase2ProspectCaptureEnabled } from "@/lib/phase2/config";

function scrypt(password: string, salt: Buffer, length: number, options: { N: number; r: number; p: number; maxmem: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, length, options, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}
const PROVISIONAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const HASH_PREFIX = "scrypt-v1";
const COOKIE_NAME = process.env.NODE_ENV === "production"
  ? "__Host-almago-provisional" : "almago-provisional-dev";

export function isProvisionalCandidateEnabled() {
  return process.env.ALMAGO_PROVISIONAL_AUTH_ENABLED === "true"
    && isPhase2AccountLinkingEnabled()
    && isPhase2ProspectCaptureEnabled();
}

export function normalizeProvisionalEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  if (email.length < 3 || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function validProvisionalPassword(input: unknown): input is string {
  return typeof input === "string"
    && input.length >= 8
    && input.length <= 256
    && Buffer.byteLength(input, "utf8") <= 1024;
}

export function hashProvisionalToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashProvisionalPassword(password: string): Promise<string> {
  if (!validProvisionalPassword(password)) throw new Error("invalid_credentials");
  const salt = randomBytes(32);
  const key = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }) as Buffer;
  return [HASH_PREFIX, salt.toString("base64url"), key.toString("base64url")].join(":");
}

export async function verifyProvisionalPassword(password: string, stored: string): Promise<boolean> {
  if (!validProvisionalPassword(password)) return false;
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== HASH_PREFIX) return false;
  const salt = Buffer.from(parts[1], "base64url");
  const expected = Buffer.from(parts[2], "base64url");
  if (salt.length !== 32 || expected.length !== 64) return false;
  const actual = await scrypt(password, salt, expected.length, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }) as Buffer;
  return timingSafeEqual(actual, expected);
}

export async function isTrustedProvisionalMutation(request: Request): Promise<boolean> {
  const origin = request.headers.get("origin");
  // A proxy-provided host can be spoofed. Production must declare the
  // canonical origin explicitly before accepting password-bearing requests.
  if (process.env.NODE_ENV === "production" && !process.env.SITE_URL) return false;
  if (!origin) return false;
  try {
    const trustedOrigin = await getPublicOrigin();
    return new URL(origin).origin === trustedOrigin.origin;
  } catch {
    return false;
  }
}

export type ProvisionalIdentity = {
  id: string;
  orientationId: string;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: string;
};

export async function createProvisionalSession(identity: ProvisionalIdentity): Promise<boolean> {
  const expiresAt = Math.min(new Date(identity.expiresAt).getTime(), Date.now() + PROVISIONAL_DURATION_MS);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const secret = randomBytes(32).toString("base64url");
  const supabase = createPrivilegedSupabaseClient();
  const { error } = await supabase.from("provisional_candidate_sessions").insert({
    credential_id: identity.id,
    token_hash: hashProvisionalToken(secret),
    expires_at: new Date(expiresAt).toISOString(),
  });
  if (error) return false;

  (await cookies()).set(COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
  return true;
}

/** A pending credential proves its own password; NEVER email ownership. */
export async function getProvisionalIdentity(): Promise<ProvisionalIdentity | null> {
  if (!isProvisionalCandidateEnabled()) return null;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const supabase = createPrivilegedSupabaseClient();
  const now = new Date().toISOString();
  const { data: session, error } = await supabase
    .from("provisional_candidate_sessions")
    .select("credential_id")
    .eq("token_hash", hashProvisionalToken(token))
    .is("revoked_at", null)
    .gt("expires_at", now)
    .maybeSingle();
  if (error || !session?.credential_id) return null;

  const { data: credential, error: credentialError } = await supabase
    .from("provisional_candidate_credentials")
    .select("id,orientation_id,email,first_name,last_name,expires_at")
    .eq("id", session.credential_id)
    .is("revoked_at", null)
    .is("verified_user_id", null)
    .gt("expires_at", now)
    .maybeSingle();
  if (credentialError || !credential?.id) return null;
  return {
    id: credential.id,
    orientationId: credential.orientation_id,
    email: credential.email,
    firstName: credential.first_name,
    lastName: credential.last_name,
    expiresAt: credential.expires_at,
  };
}

export async function revokeCurrentProvisionalSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
    try {
      const supabase = createPrivilegedSupabaseClient();
      const { error } = await supabase.from("provisional_candidate_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("token_hash", hashProvisionalToken(token));
      if (error) return false;
    } catch {
      // A database outage must not be presented as a completed logout.
      return false;
    }
  }
  store.delete(COOKIE_NAME);
  return true;
}
