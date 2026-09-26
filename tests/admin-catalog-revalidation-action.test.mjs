import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const financePanel = readFileSync("src/components/admin/AdminFinanceInsurancePanel.tsx", "utf8");
const languagePanel = readFileSync("src/components/admin/AdminLanguageCoursesPanel.tsx", "utf8");

test("catalogue revalidation requires an explicit human source check", () => {
  for (const source of [financePanel, languagePanel]) {
    assert.match(source, /window\.confirm/);
    assert.match(source, /ouvert la source officielle/);
    assert.match(source, /Source vérifiée aujourd’hui/);
    assert.match(source, /new Date\(\)\.toISOString\(\)/);
  }
});

test("revalidation preserves the full factual record and only refreshes verification time", () => {
  for (const field of [
    "provider_name",
    "official_source_url",
    "verified_at",
    "is_active",
  ]) {
    assert.match(financePanel, new RegExp(field));
  }
  for (const field of [
    "title",
    "provider_name",
    "purpose",
    "source_url",
    "verified_at",
    "is_active",
  ]) {
    assert.match(languagePanel, new RegExp(field));
  }
});

test("official source is directly reachable before revalidation", () => {
  assert.match(financePanel, /href=\{option\.official_source_url\}/);
  assert.match(languagePanel, /href=\{course\.source_url\}/);
});
