import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/parcours-allemagne/page.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const footer = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const help = readFileSync("src/app/aide/page.tsx", "utf8");
const sitemap = readFileSync("src/app/sitemap.ts", "utf8");

test("Germany path keeps academic solution before visa", () => {
  const academic = page.indexOf("D’abord : votre solution académique");
  const stay = page.indexOf("Ensuite : la bonne voie de séjour");

  assert.ok(academic >= 0);
  assert.ok(stay > academic);
  assert.match(page, /Commencez par la solution académique\. Le visa vient ensuite\./);
});

test("Germany path separates study, preparation, study-place search and isolated language routes", () => {
  assert.match(page, /§16b/);
  assert.match(page, /§17\(2\)/);
  assert.match(page, /§16f/);
  assert.match(page, /Cours de langue ≠ toujours même visa/);
});

test("Tunisia study preparation uses the verified embassy requirements", () => {
  assert.match(page, /Bewerberbestätigung/);
  assert.match(page, /au moins 20 heures par semaine/);
  assert.match(page, /Au moins A2/);
  assert.match(page, /ALTE/);
  assert.match(page, /tunis\.diplo\.de\/tn-fr\/service\/05-visaeinreise\/2573166-2573166/);
});

test("Germany path never presents admission as a visa guarantee", () => {
  assert.match(page, /Une admission universitaire ne garantit jamais l’obtention d’un visa/);
  assert.doesNotMatch(page, /admission garantit le visa/i);
});

test("Germany path is discoverable from public navigation and sitemap", () => {
  for (const source of [header, footer, help, sitemap]) {
    assert.match(source, /\/parcours-allemagne/);
  }
});

test("Germany path uses official source families only", () => {
  assert.match(page, /make-it-in-germany\.com/);
  assert.match(page, /tunis\.diplo\.de/);
  assert.match(page, /uni-assist\.de/);
  assert.match(page, /daad\.de/);
  assert.doesNotMatch(page, /tlscontact\.com/);
});
