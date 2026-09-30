import "server-only";

import { createHash, randomBytes } from "node:crypto";

const RESUME_TOKEN_BYTES = 32;
const RESUME_TOKEN_TTL_DAYS = 90;
const BASE64URL_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export type OrientationResumeToken = {
  token: string;
  hash: string;
  expiresAt: string;
};

export function hashOrientationResumeToken(token: string) {
  if (!BASE64URL_TOKEN.test(token)) return null;
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createOrientationResumeToken(now = new Date()): OrientationResumeToken {
  const token = randomBytes(RESUME_TOKEN_BYTES).toString("base64url");
  const hash = hashOrientationResumeToken(token);

  if (!hash) {
    throw new Error("Unable to create orientation resume token.");
  }

  const expiresAt = new Date(
    now.getTime() + RESUME_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  return { token, hash, expiresAt };
}
