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
  assert.match(studentLayout, /from\("user_roles"\)/);
  assert.match(studentLayout, /role\?\.role !== "student"/);
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

test("committed E2E journeys never mutate the production catalogue", () => {
  const e2eDir = join(root, "tests", "e2e");
  const e2eFiles = readdirSync(e2eDir).filter((name) => name.endsWith(".mjs")).sort();

  for (const name of e2eFiles) {
    const source = read(`tests/e2e/${name}`);

    assert.doesNotMatch(source, /\/api\/admin\/(?:programs|universities)(?:\/|["'`])/i, name);
    assert.doesNotMatch(
      source,
      /\.from\(["'](?:programs|universities)["']\)\.(?:insert|upsert|update|delete)\b/i,
      name,
    );
  }
});

test("authenticated users cannot write their own role assignment", () => {
  const grants = read("supabase/migrations/0003_phase2_authenticated_grants.sql");
  assert.match(grants, /grant select on table public\.user_roles to authenticated/i);
  assert.doesNotMatch(grants, /grant[^;]*(?:insert|update|delete)[^;]*public\.user_roles/i);
});


test("student notifications do not send unused metadata to the browser", () => {
  const page = read("src/app/student/notifications/page.tsx");
  const panel = read("src/components/student/StudentNotificationsPanel.tsx");

  assert.match(page, /select\("id,type,title,body,read_at,created_at"\)/);
  assert.doesNotMatch(page, /body,metadata,read_at/);
  assert.doesNotMatch(panel, /metadata:\s*unknown/);
});


test("document review route rejects missing, malformed and non-reviewable targets", () => {
  const route = read("src/app/api/admin/documents/[id]/review/route.ts");

  assert.match(route, /select\("status"\)/);
  assert.match(route, /currentDocumentError\?\.code === "22P02"/);
  assert.match(route, /Identifiant de document invalide/);
  assert.match(route, /Document introuvable/);
  assert.match(route, /\["pending", "replace_required"\]\.includes\(currentDocument\.status\)/);
  assert.match(route, /Ce document n’est plus dans la file de revue active/);
  assert.match(route, /status: 409/);
});


test("login routing sends each authenticated role to its own space", () => {
  const authForm = read("src/components/auth/AuthForm.tsx");

  assert.match(authForm, /from\("user_roles"\)/);
  assert.match(authForm, /role\.role === "admin"/);
  assert.match(authForm, /router\.push\("\/admin"\)/);
  assert.match(authForm, /role\.role === "student"/);
  assert.match(authForm, /router\.push\("\/student"\)/);
  assert.match(authForm, /supabase\.auth\.signOut\(\)/);
});


test("every student API enforces the student role", () => {
  const studentRoutes = [
    "src/app/api/student/applications/route.ts",
    "src/app/api/student/documents/[id]/route.ts",
    "src/app/api/student/documents/upload/route.ts",
    "src/app/api/student/notifications/[id]/route.ts",
    "src/app/api/student/notifications/read-all/route.ts",
    "src/app/api/student/onboarding/route.ts",
    "src/app/api/student/profile/route.ts",
  ];

  const access = read("src/lib/auth/access.ts");
  assert.match(access, /export async function getStudentUser/);
  assert.match(access, /role\?\.role === "student"/);

  for (const path of studentRoutes) {
    const source = read(path);
    assert.match(source, /getStudentUser/);
    assert.match(source, /if \(!isStudent\)/);
    assert.match(source, /Accès réservé aux étudiants/);
    assert.match(source, /status: 403/);
  }
});


test("auth callback only accepts internal relative next paths", () => {
  const callback = read("src/app/auth/callback/route.ts");

  assert.match(callback, /requestedNext\?\.startsWith\("\/"\)/);
  assert.match(callback, /!requestedNext\.startsWith\("\/\/"\)/);
  assert.match(callback, /: "\/student"/);
  assert.doesNotMatch(callback, /next\.startsWith\("\/"\) \? next/);
});
