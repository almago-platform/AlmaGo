import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const svgFile = fileURLToPath(new URL("../public/.well-known/bimi/campus-allemagne-bimi.svg", import.meta.url));

test("Campus Allemagne BIMI logo is a portable, self-contained square SVG Tiny PS candidate", () => {
  const svg = readFileSync(svgFile, "utf8");
  assert.ok(statSync(svgFile).size < 32 * 1024, "SVG must be smaller than 32 KB");
  assert.match(svg, /<svg\b[^>]*\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /<svg\b[^>]*\bbaseProfile="tiny-ps"/);
  assert.match(svg, /<svg\b[^>]*\bversion="1\.2"/);
  assert.match(svg, /<svg\b[^>]*\bwidth="1024"[^>]*\bheight="1024"/);
  assert.match(svg, /<svg\b[^>]*\bviewBox="0 0 1024 1024"/);
  assert.match(svg, /<title>Campus Allemagne<\/title>/);
  assert.match(svg, /<desc>.+<\/desc>/);
  assert.match(svg, /<rect\b[^>]*fill="#FFFFFF"/);
  assert.match(svg, /<path\b[^>]*fill="#0C1C2D"/);
  assert.match(svg, /<path\b[^>]*fill="#FF002E"/);
  assert.match(svg, /<path\b[^>]*fill="#FFB320"/);
  assert.doesNotMatch(svg, /<(?:script|image|foreignObject|animate|animateTransform|set|style|use)\b/i);
  assert.doesNotMatch(svg, /\b(?:href|xlink:href|onload|onclick|onerror)=/i);
  assert.doesNotMatch(svg, /url\(|@import|<\?xml-stylesheet/i);
});
