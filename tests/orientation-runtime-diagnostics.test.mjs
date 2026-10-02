import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(
  "src/app/api/admin/orientation/runtime/route.ts",
  "utf8",
);

test("Orientation V4 runtime diagnostics are admin-only and expose presence, never secret values", () => {
  assert.match(route, /getAdminUser/);
  assert.match(route, /if \(!user\)[\s\S]*401/);
  assert.match(route, /if \(!isAdmin\)[\s\S]*403/);
  assert.match(route, /supabasePrivilegedConfigured/);
  assert.match(route, /apiKeyPresent/);
  assert.match(route, /ALMAGO_ORIENTATION_DISCOVERY_PROVIDER/);
  assert.match(route, /ALMAGO_ORIENTATION_VERIFICATION_PROVIDER/);
  assert.match(route, /ALMAGO_ORIENTATION_WRITER_PROVIDER/);
  assert.match(route, /Boolean\(process\.env\.OPENAI_API_KEY\)/);
  assert.match(route, /Boolean\(process\.env\.GEMINI_API_KEY\)/);
  assert.doesNotMatch(route, /OPENAI_API_KEY\s*[,}]|GEMINI_API_KEY\s*[,}]|SUPABASE_SECRET_KEY\s*[,}]/);
});
