import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const header = readFileSync("src/components/admin/AdminPageHeader.tsx", "utf8");
const dashboard = readFileSync("src/app/admin/page.tsx", "utf8");
const styles = readFileSync("src/app/admin-v3.css", "utf8");

test("each admin route remains present in exactly one navigation group", () => {
  const definitions = [...shell.matchAll(/\{ label: "[^"]+", href: "(\/admin[^"]+)"/g)]
    .map((match) => match[1]);
  const groups = shell.split("  const adminGroups = [")[1]?.split("  const items = role ===")[0] ?? "";
  const grouped = [...groups.matchAll(/"(\/admin(?:\/[^"]*)?)"/g)].map((match) => match[1]);
  assert.equal(definitions.length, 17);
  assert.equal(new Set(grouped).size, grouped.length);
  assert.deepEqual(grouped.slice().sort(), definitions.slice().sort());
});

test("daily admin areas are visible and expert modules expand on active route", () => {
  for (const label of ["Mon bureau", "Personnes et dossiers", "À traiter", "Services et paiements", "Catalogue Allemagne", "Administration avancée"]) {
    assert.ok(shell.includes('label: "' + label + '"'), label);
  }
  assert.match(shell, /group\.secondary \? \(group\.items\.some/);
  assert.match(shell, /aria-current=\{active \? "page"/);
  assert.match(shell, /role === "admin" \? "ltr"/);
});

test("admin page headings and sidebar helpers stay readable", () => {
  assert.match(header, /bg-white/);
  assert.match(header, /text-slate-950/);
  assert.match(header, /text-slate-700/);
  assert.doesNotMatch(header, /text-white\/64/);
  assert.match(styles, /admin-shell-sidebar nav summary:focus-visible/);
  assert.match(shell, /text-\[11px\] leading-4 text-white\/80/);
});

test("the admin homepage keeps search and a short direct-action path", () => {
  assert.match(dashboard, /Retrouver une personne/);
  assert.match(dashboard, /Voir les tâches à traiter/);
  assert.match(dashboard, /<section aria-label="Accès rapides"/);
  assert.match(dashboard, /Mes prochaines actions/);
});
