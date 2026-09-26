import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(
  "src/app/api/student/language-courses/route.ts",
  "utf8",
);

test("Student language-course API requires authenticated server Supabase access", () => {
  assert.match(route, /createClient\(\)/);
  assert.match(route, /supabase\.auth\.getUser\(\)/);
  assert.match(route, /status:\s*401/);
  assert.doesNotMatch(route, /service[_-]?role/i);
});

test("Student language-course surface is GET-only and exposes no write handler", () => {
  assert.match(route, /export async function GET\(/);
  assert.doesNotMatch(route, /export async function (?:POST|PUT|PATCH|DELETE)\(/);
  assert.match(route, /from\("language_courses"\)/);
});

test("Student API selects only the bounded publishable catalogue fields", () => {
  const fields = route.match(/const studentCourseFields = \[([\s\S]*?)\]\.join\(","\)/)?.[1] || "";
  for (const field of [
    "id",
    "title",
    "provider_name",
    "city",
    "language",
    "purpose",
    "level_from",
    "level_to",
    "hours_per_week",
    "starts_on",
    "ends_on",
    "price_cents",
    "currency",
    "source_url",
    "application_url",
    "verified_at",
  ]) {
    assert.match(fields, new RegExp(`"${field}"`), field);
  }

  assert.doesNotMatch(fields, /is_active|created_at|updated_at|admin|notes/i);
});

test("existing publishable query/filter contract remains the API gate", () => {
  assert.match(route, /publishableLanguageCoursesQuery/);
  assert.match(route, /Object\.fromEntries\(url\.searchParams\.entries\(\)\)/);
  assert.match(route, /if \(!scopedQuery\)[\s\S]*status:\s*400/);
});

test("Student read API makes no suitability or regulatory decision", () => {
  assert.doesNotMatch(
    route,
    /recommended for you|recommand[ée] pour vous|visa garanti|éligible au visa|STUDIUM|STUDIENVORBEREITUNG|STUDIENPLATZSUCHE|SPRACHKURS/i,
  );
});

test("RLS remains the final authority because the route uses the signed-in client directly", () => {
  assert.match(route, /const supabase = await createClient\(\)/);
  assert.match(route, /supabase\s*\.from\("language_courses"\)/);
  assert.doesNotMatch(route, /createAdminClient|service[_-]?role|SUPABASE_SERVICE_ROLE_KEY/i);
});
