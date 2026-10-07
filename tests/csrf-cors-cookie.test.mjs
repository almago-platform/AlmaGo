import assert from "node:assert/strict";
import test from "node:test";

import { validateMutationRequest } from "../src/lib/security/request.ts";

const env = {
  NODE_ENV: "production",
  SITE_URL: "https://almago.example",
  RENDER_EXTERNAL_URL: "https://almago-dev.onrender.com",
};

function mutation({
  origin = "https://almago.example",
  host = "almago.example",
  contentType = "application/json",
  body = "{}",
  extraHeaders = {},
} = {}) {
  const headers = new Headers(extraHeaders);
  if (origin !== null) headers.set("origin", origin);
  if (host !== null) headers.set("host", host);
  if (contentType !== null) headers.set("content-type", contentType);
  return new Request("https://almago.example/api/student/project", {
    method: "POST",
    headers,
    body,
  });
}

test("same-origin JSON mutations pass the shared request guard", () => {
  assert.equal(validateMutationRequest(mutation(), env), null);
});

test("foreign and sibling origins are rejected", () => {
  assert.deepEqual(validateMutationRequest(mutation({ origin: "https://evil.example" }), env), {
    status: 403,
    code: "origin",
  });
  assert.deepEqual(
    validateMutationRequest(mutation({ origin: "https://admin.almago.example" }), env),
    { status: 403, code: "origin" },
  );
});

test("browser cross-site mutations cannot bypass the guard by omitting Origin", () => {
  assert.deepEqual(
    validateMutationRequest(
      mutation({ origin: null, extraHeaders: { "sec-fetch-site": "cross-site" } }),
      env,
    ),
    { status: 403, code: "origin" },
  );
});

test("untrusted Host values are rejected independently of Origin", () => {
  assert.deepEqual(validateMutationRequest(mutation({ host: "evil.example" }), env), {
    status: 403,
    code: "host",
  });
});

test("client-controlled forwarded Host values never override the validated Host", () => {
  assert.equal(
    validateMutationRequest(
      mutation({ extraHeaders: { "x-forwarded-host": "evil.example" } }),
      env,
    ),
    null,
  );
  assert.deepEqual(
    validateMutationRequest(
      mutation({
        host: "evil.example",
        extraHeaders: { "x-forwarded-host": "almago.example" },
      }),
      env,
    ),
    { status: 403, code: "host" },
  );
});

test("missing or invalid mutation content types are rejected", () => {
  assert.deepEqual(validateMutationRequest(mutation({ contentType: null }), env), {
    status: 415,
    code: "content_type",
  });
  assert.deepEqual(validateMutationRequest(mutation({ contentType: "text/plain" }), env), {
    status: 415,
    code: "content_type",
  });
});

test("oversized mutation bodies are rejected before route handling", () => {
  assert.deepEqual(
    validateMutationRequest(
      mutation({ extraHeaders: { "content-length": "1048577" } }),
      env,
    ),
    { status: 413, code: "body_size" },
  );
});

test("bodyless same-origin mutations remain supported", () => {
  const request = new Request("https://almago.example/api/orientation/recover", {
    method: "POST",
    headers: {
      host: "almago.example",
      origin: "https://almago.example",
    },
  });
  assert.equal(validateMutationRequest(request, env), null);
});
