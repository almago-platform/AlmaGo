import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const migrationDir = join(root, "supabase", "migrations");
const migrationFiles = readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort();
const migrations = migrationFiles.map((name) => readFileSync(join(migrationDir, name), "utf8")).join("\n");

test("admin and student areas keep server-side authentication guards", () => {
  const adminLayout = read("src/app/admin/layout.tsx");
  const studentLayout = read("src/app/student/layout.tsx");

  assert.match(adminLayout, /auth\.getUser\(\)/);
  assert.match(adminLayout, /from\("user_roles"\)/);
  assert.match(adminLayout, /role\?\.role !== "admin"/);
  assert.match(adminLayout, /redirect\("\/unauthorized"\)/);

  assert.match(studentLayout, /auth\.getUser\(\)/);
  assert.match(studentLayout, /if \(!user\) redirect\("\/login"\)/);
});

test("browser and server Supabase clients never use a service-role secret", () => {
  const clientFiles = [
    "src/lib/supabase/client.ts",
    "src/lib/supabase/server.ts",
    "src/lib/supabase/proxy.ts",
  ];

  for (const path of clientFiles) {
    const source = read(path);
    assert.match(source, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/, path);
    assert.doesNotMatch(source, /SERVICE_ROLE|service_role|SUPABASE_SECRET/i, path);
  }
});

test("RLS remains enabled for every sensitive application table", () => {
  assert.match(migrations, /enable row level security/i);
  for (const table of [
    "profiles",
    "user_roles",
    "program_recommendations",
    "student_checklist_items",
    "documents",
    "applications",
    "application_events",
    "notifications",
    "consents",
    "admin_notes",
    "technical_logs",
  ]) {
    assert.match(migrations, new RegExp(`['"]${table}['"]`), table);
  }

  for (const policy of [
    "profiles own read",
    "roles own read or admin",
    "recommendations student active or admin read",
    "checklist student or admin",
    "documents student or admin read",
    "applications student or admin read",
    "visible application events",
    "admin notes admin only",
  ]) {
    assert.match(migrations, new RegExp(`create\\s+policy\\s+["']${policy}["']`, "i"), policy);
  }

  assert.doesNotMatch(migrations, /create\s+policy[^;]+on\s+public\.technical_logs/i);
});

test("student document storage stays private and ownership-scoped", () => {
  assert.match(
    migrations,
    /values\s*\(\s*'student-documents'\s*,\s*'student-documents'\s*,\s*false\s*,\s*10485760/i,
  );
  assert.match(migrations, /document objects own folder/i);
  assert.match(migrations, /storage\.foldername\(name\)\)\[1\]\s*=\s*auth\.uid\(\)::text/i);
  assert.match(migrations, /document objects own upload/i);
  assert.match(migrations, /document objects admin read/i);
});

test("privileged database functions keep explicit admin checks and hardened execution", () => {
  assert.match(migrations, /alter function public\.admin_review_document\([^;]+\) security invoker/i);
  assert.match(
    migrations,
    /create or replace function public\.admin_update_application[\s\S]+?security invoker[\s\S]+?if not public\.is_admin\(\) then/i,
  );
  assert.match(migrations, /revoke execute on function public\.handle_new_user\(\) from public, anon, authenticated/i);
  assert.match(migrations, /create or replace function private\.is_admin\(\)[\s\S]+?security definer/i);
  assert.match(migrations, /create or replace function public\.is_admin\(\)[\s\S]+?security invoker/i);
});

test("authenticated users cannot write their own role assignment", () => {
  const grants = read("supabase/migrations/0003_phase2_authenticated_grants.sql");
  assert.match(grants, /grant select on table public\.user_roles to authenticated/i);
  assert.doesNotMatch(grants, /grant[^;]*(?:insert|update|delete)[^;]*public\.user_roles/i);
});
