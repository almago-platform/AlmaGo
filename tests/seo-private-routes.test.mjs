import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rootLayout = readFileSync("src/app/layout.tsx", "utf8");
const privateSurfaces = [
  "src/app/student/layout.tsx",
  "src/app/admin/layout.tsx",
  "src/app/login/page.tsx",
  "src/app/signup/page.tsx",
  "src/app/reset-password/page.tsx",
  "src/app/unauthorized/page.tsx",
];

test("public root remains indexable", () => {
  assert.match(rootLayout, /robots:\s*\{[\s\S]*index:\s*true[\s\S]*follow:\s*true/);
});

test("private and auth surfaces explicitly opt out of indexing", () => {
  for (const path of privateSurfaces) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /export const metadata: Metadata/);
    assert.match(source, /robots:\s*\{[\s\S]*index:\s*false[\s\S]*follow:\s*false/, path);
  }
});
