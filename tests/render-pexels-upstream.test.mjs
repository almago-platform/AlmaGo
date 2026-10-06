import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sources = [
  "src/components/public/HomeHero.tsx",
  "src/components/public/HomePhotoBand.tsx",
  "src/components/public/HomeJourneySection.tsx",
  "src/components/auth/AuthStoryPanel.tsx",
  "src/components/student/OnboardingForm.tsx",
  "src/lib/prospect/media.ts",
].map((path) => readFileSync(path, "utf8"));

const config = readFileSync("next.config.ts", "utf8");
const pexelsUrls = sources.flatMap((source) =>
  [...source.matchAll(/https:\/\/images\.pexels\.com\/[^"']+/g)].map((match) => match[0]),
);

test("all application Pexels sources are bounded before Next image optimization", () => {
  assert.equal(pexelsUrls.length, 17);
  for (const url of pexelsUrls) {
    assert.match(url, /\?auto=compress&cs=tinysrgb&w=(1200|1920)$/);
  }
});

test("hero keeps a larger bounded source while cards and auth stay at 1200px", () => {
  assert.equal(pexelsUrls.filter((url) => /w=1920$/.test(url)).length, 1);
  assert.equal(pexelsUrls.filter((url) => /w=1200$/.test(url)).length, 16);
});

test("AlmaGo keeps Next image proxying instead of sending browsers directly to Pexels", () => {
  assert.match(config, /hostname:\s*"images\.pexels\.com"/);
  assert.doesNotMatch(config, /unoptimized:\s*true/);
});
