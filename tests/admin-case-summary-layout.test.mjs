import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const paths = [
  "src/app/admin/prospects/page.tsx",
  "src/components/admin/AdminIntakePanel.tsx",
  "src/app/admin/accompagnement/page.tsx",
];
const sources = paths.map((path) => readFileSync(path, "utf8"));
const dashboard = readFileSync("src/app/admin/page.tsx", "utf8");

test("three candidate lists have flex-aligned, keyboard accessible expandable case rows", () => {
  for (let index = 0; index < paths.length; index++) {
    const source = sources[index];
    assert.match(source, /<details key=/, paths[index]);
    assert.match(source, /<summary className="flex cursor-pointer list-none flex-wrap items-center/, paths[index]);
    assert.match(source, /\[&::-webkit-details-marker\]:hidden/, paths[index]);
    assert.match(source, /focus-visible:outline-2/, paths[index]);
    assert.match(source, /group-open:rotate-90/, paths[index]);
    assert.match(source, /group-open:hidden/, paths[index]);
    assert.doesNotMatch(source, /<summary className="grid cursor-pointer list-item/, paths[index]);
    assert.match(source, /<\/details>/, paths[index]);
  }
});

test("intake keeps operational safeguards and payment counter legible", () => {
  const intake = sources[1];
  assert.match(intake, /Paiement<\/p>/);
  assert.match(intake, /whitespace-nowrap text-\[11px\] font-semibold text-emerald-800/);
  assert.match(intake, /const academicReady =/);
  assert.match(intake, /const canPropose =/);
  assert.match(intake, /commercialLocked/);
  assert.match(intake, /preBacRouteAllowed/);
  assert.match(intake, /Ouvrir le dossier 360°/);
});

test("dashboard retains alerts and source checks behind discoverable progressive disclosure", () => {
  for (const heading of [
    "Suivi des échéances",
    "Files spécialisées",
    "Révalidations du catalogue",
  ]) {
    assert.ok(dashboard.includes(heading), heading);
  }
  assert.match(dashboard, /\{overdueCases\} en retard/);
  assert.match(dashboard, /\{pendingOrientationReviews\} revue\(s\)/);
  assert.match(dashboard, /\{staleCatalogue\} expirée\(s\)/);
  assert.match(dashboard, /applicationOfficialDeadlineUrgency/);
  assert.match(dashboard, /CatalogHealthRow/);
  assert.match(dashboard, /AdminQueueRow/);
  assert.match(dashboard, /Mes prochaines actions/);
  assert.match(dashboard, /href="\/admin\/intake"/);
});
