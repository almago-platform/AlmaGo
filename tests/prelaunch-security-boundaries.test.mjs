import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function routeFiles(root) {
  const files = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) files.push(...routeFiles(path));
    else if (entry === "route.ts") files.push(path);
  }
  return files;
}

test("every admin API route enforces a server-side immutable-role admin guard", () => {
  const routes = routeFiles("src/app/api/admin");
  assert.ok(routes.length > 0, "expected admin API routes");

  for (const route of routes) {
    const source = readFileSync(route, "utf8");
    const canonicalGuard = /getAdminUser\s*\(/.test(source);
    const explicitImmutableRoleGuard =
      /auth\.getUser\s*\(/.test(source) &&
      /\.from\(["']user_roles["']\)/.test(source) &&
      /admin/.test(source);

    assert.ok(
      canonicalGuard || explicitImmutableRoleGuard,
      route + " must enforce admin authorization from the authenticated user and immutable user_roles",
    );
  }
});

test("browser-facing Supabase clients use only publishable credentials", () => {
  for (const file of ["src/lib/supabase/client.ts", "src/lib/supabase/proxy.ts"]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
    assert.doesNotMatch(source, /SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY/);
  }
});
