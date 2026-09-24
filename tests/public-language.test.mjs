import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const publicRoots = [
  "src/components/public",
  "src/app/aide",
  "src/app/accessibilite",
  "src/app/a-propos",
  "src/app/confiance",
  "src/app/comprendre-les-demarches",
  "src/app/selon-votre-pays",
];

const forbiddenPublicPatterns = [
  /\bintelligence artificielle\b/i,
  /\bai[- ]powered\b/i,
  /\bia[- ]powered\b/i,
  /\bdashboard\b/i,
  /\bworkflow\b/i,
  /\bknowledge base\b/i,
  /\bdictionnaire\b/i,
  /\balgorithme\b/i,
  /\bchatbot\b/i,
  /\bsaas\b/i,
  /\bscore de compatibilit[eé]\b/i,
  /\b100\s*%\b/i,
  /\br[eé]volutionnaire\b/i,
];

function filesUnder(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(tsx|ts)$/.test(entry.name))
    .map(entry => join(entry.parentPath || root, entry.name));
}

test("public AlmaGo copy avoids product and AI jargon", () => {
  const files = publicRoots.flatMap(filesUnder);

  assert.ok(files.length > 0, "expected public-facing source files");

  for (const file of files) {
    const source = readFileSync(file, "utf8");

    for (const pattern of forbiddenPublicPatterns) {
      assert.equal(
        pattern.test(source),
        false,
        `public language regression in ${file}: ${pattern}`,
      );
    }
  }
});

test("V3 public trust boundaries remain explicit", () => {
  const role = readFileSync("src/components/public/HomeRoleSection.tsx", "utf8");
  const help = readFileSync("src/app/aide/page.tsx", "utf8");
  const about = readFileSync("src/app/a-propos/page.tsx", "utf8");
  const country = readFileSync("src/app/selon-votre-pays/page.tsx", "utf8");
  const trustPage = readFileSync("src/app/confiance/page.tsx", "utf8");
  const guidance = readFileSync("src/app/comprendre-les-demarches/page.tsx", "utf8");

  assert.match(role, /organismes comp[eé]tents/i);
  assert.match(role, /source officielle/i);

  assert.match(help, /Centre d’aide/i);
  assert.match(help, /d[eé]cisions officielles/i);

  assert.match(about, /À propos d’AlmaGo/i);
  assert.match(about, /organismes compétents/i);
  assert.match(about, /sources officielles/i);

  assert.match(country, /pays de dipl[oô]me/i);
  assert.match(country, /ne remplace\s+pas l’évaluation/i);

  assert.match(guidance, /Comprendre les démarches/i);
  assert.match(guidance, /Source officielle/i);

  assert.match(trustPage, /Confiance et transparence/i);
  assert.match(trustPage, /organismes compétents/i);
  assert.match(trustPage, /source officielle/i);
});
