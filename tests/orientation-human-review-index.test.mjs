import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261002215000_orientation_human_review_reviewed_by_index.sql",
  "utf8",
);

test("F covers the counselor review foreign key with a partial index", () => {
  assert.match(
    migration,
    /create index orientation_human_reviews_reviewed_by_idx[\s\S]*on public\.orientation_human_reviews \(reviewed_by\)[\s\S]*where reviewed_by is not null/,
  );
  assert.doesNotMatch(migration, /grant|policy|program_recommendations/i);
});
