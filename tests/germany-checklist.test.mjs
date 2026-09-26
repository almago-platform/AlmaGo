import assert from "node:assert/strict";
import test from "node:test";
import { buildGermanyChecklist } from "../src/lib/germany-checklist.ts";

function decision(route, status="candidate", reason_code="study_place_search_candidate") {
  return { route, status, reason_code, used_facts: [], missing_facts: [], student_explanation: "" };
}

const base = {
  project_path: "university_search",
  decision: decision("STUDIENPLATZSUCHE"),
  accepted_definitive_admission: false,
  accepted_preparatory_basis: false,
  has_publishable_study_preparation_course: false,
  has_publishable_standalone_language_course: false,
  has_pending_academic_review: false,
  has_replacement_required: false,
};

test("unknown project blocks downstream steps deterministically", () => {
  const items = buildGermanyChecklist({ ...base, project_path: null, decision: decision(null, "blocked", "project_path_missing_or_unknown") });
  assert.deepEqual(items.map(item => item.key), ["define_project"]);
  assert.equal(items[0].owner, "student");
  assert.equal(items[0].status, "todo");
});

test("replacement and pending evidence stay blockers and never become completed proof", () => {
  const replacement = buildGermanyChecklist({ ...base, has_replacement_required: true });
  assert.deepEqual(replacement.map(item => item.key), ["project_defined", "replace_academic_evidence"]);
  assert.equal(replacement[1].status, "todo");

  const pending = buildGermanyChecklist({ ...base, has_pending_academic_review: true });
  assert.deepEqual(pending.map(item => item.key), ["project_defined", "academic_evidence_review"]);
  assert.equal(pending[1].owner, "almago");
  assert.equal(pending[1].status, "waiting_almago");
});

test("accepted definitive admission produces completed academic basis without visa promise", () => {
  const items = buildGermanyChecklist({
    ...base,
    decision: decision("STUDIUM", "confirmed_basis", "definitive_admission_accepted"),
    accepted_definitive_admission: true,
  });
  assert.deepEqual(items.map(item => item.key), ["project_defined", "definitive_admission_basis"]);
  assert.equal(items[1].status, "completed");
  assert.match(items[1].explanation, /ne constitue pas une décision de visa/);
});

test("preparatory basis requires an explicit verified selected course", () => {
  const missing = buildGermanyChecklist({
    ...base,
    project_path: "german_preparation_and_studies",
    decision: decision(null, "blocked", "preparatory_course_missing"),
    accepted_preparatory_basis: true,
  });
  assert.equal(missing.at(-1).key, "select_study_preparation_course");
  assert.equal(missing.at(-1).status, "todo");

  const confirmed = buildGermanyChecklist({
    ...base,
    project_path: "german_preparation_and_studies",
    decision: decision("STUDIENVORBEREITUNG", "confirmed_basis", "preparatory_basis_and_course_confirmed"),
    accepted_preparatory_basis: true,
    has_publishable_study_preparation_course: true,
  });
  assert.equal(confirmed.at(-1).key, "study_preparation_course_selected");
  assert.equal(confirmed.at(-1).status, "completed");
});

test("language-only path never auto-converts a preparation course", () => {
  const missing = buildGermanyChecklist({
    ...base,
    project_path: "language_only",
    decision: decision("SPRACHKURS", "candidate", "language_only_project"),
    has_publishable_study_preparation_course: true,
    has_publishable_standalone_language_course: false,
  });
  assert.equal(missing.at(-1).key, "select_standalone_language_course");
});

test("study-place search remains factual and output has unique ordered keys", () => {
  const items = buildGermanyChecklist(base);
  assert.deepEqual(items.map(item => item.key), ["project_defined", "continue_academic_search"]);
  assert.equal(new Set(items.map(item => item.key)).size, items.length);
  const text = JSON.stringify(items);
  assert.doesNotMatch(text, /visa garanti|éligible au visa|probabilit[ée]|chance d.admission/i);
});
