import "server-only";

import { createHash, randomBytes } from "node:crypto";

const INTEREST_TOKEN_BYTES = 32;
const INTEREST_TOKEN_TTL_DAYS = 30;
const BASE64URL_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export type FreeValidationInterestToken = {
  token: string;
  hash: string;
  expiresAt: string;
};

export function hashFreeValidationInterestToken(token: string) {
  if (!BASE64URL_TOKEN.test(token)) return null;
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createFreeValidationInterestToken(
  now = new Date(),
): FreeValidationInterestToken {
  const token = randomBytes(INTEREST_TOKEN_BYTES).toString("base64url");
  const hash = hashFreeValidationInterestToken(token);

  if (!hash) {
    throw new Error("Unable to create Free Validation interest token.");
  }

  const expiresAt = new Date(
    now.getTime() + INTEREST_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  return { token, hash, expiresAt };
}
