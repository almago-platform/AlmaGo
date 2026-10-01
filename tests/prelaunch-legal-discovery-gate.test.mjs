import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const robots = readFileSync("src/app/robots.ts", "utf8");
const sitemap = readFileSync("src/app/sitemap.ts", "utf8");
const legal = readFileSync("src/content/legal-content.ts", "utf8");

test("A38 legal discovery stays closed until the existing readiness gate passes", () => {
  assert.match(legal, /export const a38ReviewReady: boolean = false/);
  assert.match(robots, /if \(!isLegalPublicationReady\(\)\)/);
  assert.match(robots, /disallow\.push\("\/legal\/"\)/);
  assert.match(sitemap, /if \(isLegalPublicationReady\(\)\)/);
  assert.match(sitemap, /Object\.keys\(legalDocuments\)/);
  assert.match(sitemap, /new URL\(\`\/legal\/\$\{key\}\`, publicOrigin\)/);
});

test("public launch sitemap includes contact while keeping private routes out", () => {
  assert.match(sitemap, /new URL\("\/contact", publicOrigin\)/);
  for (const privatePath of ["/admin/", "/student/", "/prospect", "/orientation/report/", "/login", "/signup", "/api/"]) {
    assert.doesNotMatch(sitemap, new RegExp(privatePath.replaceAll("/", "\\/")));
  }
});

test("robots always blocks authenticated prospect and private report routes", () => {
  assert.match(robots, /"\/prospect"/);
  assert.match(robots, /"\/orientation\/report\/"/);
});
