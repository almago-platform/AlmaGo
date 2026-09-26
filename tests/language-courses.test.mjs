import assert from "node:assert/strict";
import test from "node:test";
import {
  isPublishableLanguageCourse,
  languageCoursePurposes,
  parseLanguageCourseFilters,
  parseLanguageCoursePayload,
  publishableLanguageCoursesQuery,
} from "../src/lib/language-courses.ts";

const valid = {
  title: "Deutsch intensiv",
  provider_name: "Sprachzentrum",
  city: "Berlin",
  language: "Deutsch",
  purpose: "study_preparation",
  level_from: "B1",
  level_to: "C1",
  hours_per_week: 20,
  starts_on: "2027-02-01",
  ends_on: "2027-04-25",
  price_cents: 120000,
  currency: "eur",
  source_url: "https://example.org/official",
  application_url: "https://example.org/apply",
  verified_at: "2026-09-20T10:00:00Z",
  is_active: true,
};

test("language-course purpose stays explicit and separated", () => {
  assert.deepEqual([...languageCoursePurposes], ["study_preparation", "standalone_language"]);
  for (const purpose of languageCoursePurposes) {
    const parsed = parseLanguageCoursePayload({ ...valid, purpose });
    assert.equal(parsed.ok, true, purpose);
  }
  assert.equal(parseLanguageCoursePayload({ ...valid, purpose: "intensive" }).ok, false);
});

test("unknown optional facts remain null instead of being invented", () => {
  const parsed = parseLanguageCoursePayload({
    ...valid,
    level_from: null,
    level_to: null,
    hours_per_week: null,
    starts_on: null,
    ends_on: null,
    price_cents: null,
    currency: null,
    application_url: null,
    is_active: false,
    verified_at: null,
    source_url: null,
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.level_from, null);
  assert.equal(parsed.value.level_to, null);
  assert.equal(parsed.value.hours_per_week, null);
  assert.equal(parsed.value.starts_on, null);
  assert.equal(parsed.value.ends_on, null);
  assert.equal(parsed.value.price_cents, null);
  assert.equal(parsed.value.currency, null);
});

test("active publication fails closed without valid official verification", () => {
  const now = new Date("2026-09-26T10:00:00Z");
  assert.equal(isPublishableLanguageCourse(valid, now), true);
  assert.equal(isPublishableLanguageCourse({ ...valid, is_active: false }, now), false);
  assert.equal(isPublishableLanguageCourse({ ...valid, verified_at: null }, now), false);
  assert.equal(isPublishableLanguageCourse({ ...valid, verified_at: "2026-09-27T10:00:00Z" }, now), false);
  assert.equal(isPublishableLanguageCourse({ ...valid, source_url: "javascript:alert(1)" }, now), false);

  assert.equal(parseLanguageCoursePayload({ ...valid, source_url: "javascript:alert(1)" }).ok, false);
  assert.equal(parseLanguageCoursePayload({ ...valid, verified_at: null }).ok, false);
  assert.equal(parseLanguageCoursePayload({ ...valid, verified_at: "2999-01-01T00:00:00Z" }).ok, false);
});

test("payload validates date, level, price/currency and URL contracts", () => {
  assert.equal(parseLanguageCoursePayload({ ...valid, level_from: "C1", level_to: "B2" }).ok, false);
  assert.equal(parseLanguageCoursePayload({ ...valid, starts_on: "2027-04-01", ends_on: "2027-03-01" }).ok, false);
  assert.equal(parseLanguageCoursePayload({ ...valid, price_cents: 1000, currency: null }).ok, false);
  assert.equal(parseLanguageCoursePayload({ ...valid, application_url: "file:///tmp/apply" }).ok, false);
  assert.equal(parseLanguageCoursePayload({ ...valid, extra: "field" }).ok, false);
});

test("catalogue filters are bounded to purpose, city, language and level fields", () => {
  assert.equal(parseLanguageCourseFilters({
    purpose: "study_preparation",
    city: "Berlin",
    language: "Deutsch",
    level_from: "B1",
    level_to: "C1",
  }).ok, true);

  for (const filters of [
    { purpose: "other" },
    { city: "x".repeat(181) },
    { language: "" },
    { level_from: "B3" },
    { unknown: "value" },
  ]) {
    assert.equal(parseLanguageCourseFilters(filters).ok, false, JSON.stringify(filters));
  }
});

test("publishable query applies only factual catalogue filters", () => {
  const calls = [];
  const query = {
    eq(column, value) { calls.push(["eq", column, value]); return this; },
    ilike(column, value) { calls.push(["ilike", column, value]); return this; },
    lte(column, value) { calls.push(["lte", column, value]); return this; },
    order(column, options) { calls.push(["order", column, options]); return this; },
  };

  const now = new Date("2026-09-26T10:00:00Z");
  const result = publishableLanguageCoursesQuery(query, {
    purpose: "study_preparation",
    city: "Berlin",
    language: "Deutsch",
    level_from: "B1",
    level_to: "C1",
  }, now);

  assert.equal(result, query);
  assert.deepEqual(calls, [
    ["eq", "is_active", true],
    ["lte", "verified_at", now.toISOString()],
    ["eq", "purpose", "study_preparation"],
    ["ilike", "city", "Berlin"],
    ["ilike", "language", "Deutsch"],
    ["eq", "level_from", "B1"],
    ["eq", "level_to", "C1"],
    ["order", "title", { ascending: true }],
  ]);
});
