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

test("every admin API route enforces the canonical server-side admin guard", () => {
  const routes = routeFiles("src/app/api/admin");
  assert.ok(routes.length > 0, "expected admin API routes");

  for (const route of routes) {
    const source = readFileSync(route, "utf8");
    assert.match(
      source,
      /getAdminUser\s*\(/,
      route + " must call getAdminUser() before serving admin operations",
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
