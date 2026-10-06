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

test("admin and student areas keep server-side authentication and role guards", () => {
  const adminLayout = read("src/app/admin/layout.tsx");
  const studentLayout = read("src/app/student/layout.tsx");
  const authAccess = read("src/lib/auth/access.ts");
  const phase2Access = read("src/lib/phase2/access.ts");

  assert.match(adminLayout, /auth\.getUser\(\)/);
  assert.match(adminLayout, /from\("user_roles"\)/);
  assert.match(adminLayout, /role\?\.role !== "admin"/);
  assert.match(adminLayout, /redirect\("\/unauthorized"\)/);

  assert.match(authAccess, /auth\.getUser\(\)/);
  assert.match(authAccess, /export async function getTechnicalStudentUser/);
  assert.match(authAccess, /from\("user_roles"\)/);
  assert.match(authAccess, /role\?\.role === "student"/);
  assert.match(phase2Access, /getTechnicalStudentUser/);
  assert.match(studentLayout, /getPhase2StudentAccess/);
  assert.match(studentLayout, /if \(!user\) redirect\("\/login"\)/);
  assert.match(studentLayout, /from\("user_roles"\)/);
  assert.match(studentLayout, /role\?\.role === "admin"/);
  assert.match(studentLayout, /redirect\("\/admin"\)/);
  assert.match(studentLayout, /if \(!access\.isStudent\)/);
  assert.match(studentLayout, /redirect\("\/unauthorized"\)/);
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
    "student projects own or admin read",
    "regulatory sources admin write",
  ]) {
    assert.match(migrations, new RegExp(`create\\s+policy\\s+["']${policy}["']`, "i"), policy);
  }

  assert.match(migrations, /create table public\.student_projects/i);
  assert.match(migrations, /create table public\.regulatory_sources/i);
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


test("advisor service-only tables stay closed to anon and authenticated clients", () => {
  const serviceOnlyTables = [
    "orientation_discovery_run_candidates",
    "orientation_discovery_runs",
    "orientation_programme_verifications",
    "orientation_research_programs",
    "orientation_verification_runs",
    "payment_provider_events",
    "technical_logs",
  ];

  for (const table of serviceOnlyTables) {
    if (table === "technical_logs") {
      assert.match(
        migrations,
        /array\[[^\]]*'technical_logs'[^\]]*\][\s\S]*execute format\('alter table public\.%I enable row level security'/i,
        "technical_logs must remain in the original RLS-enable loop",
      );
    } else {
      assert.match(
        migrations,
        new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, "i"),
        `${table} must keep RLS enabled`,
      );
    }
    assert.doesNotMatch(
      migrations,
      new RegExp(
        `grant[^;]+on\\s+(?:table\\s+)?public\\.${table}[^;]+to\\s+[^;]*(?:anon|authenticated)`,
        "i",
      ),
      `${table} must not gain anon/authenticated table grants`,
    );
    assert.doesNotMatch(
      migrations,
      new RegExp(`create\\s+policy[^;]+on\\s+(?:table\\s+)?public\\.${table}`, "i"),
      `${table} must remain service-only without client RLS policies`,
    );
  }
});
