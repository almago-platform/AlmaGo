import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const discovery = readFileSync("src/lib/orientation-engine/discovery/service.ts", "utf8");
const verification = readFileSync("src/lib/orientation-engine/verification/service.ts", "utf8");
const writer = readFileSync("src/lib/orientation-engine/writer/service.ts", "utf8");

test("Orientation V4 emits only redacted provider execution evidence", () => {
  for (const source of [discovery, verification, writer]) {
    assert.match(source, /orientation_v4_provider/);
    assert.doesNotMatch(
      source,
      /apiKey|OPENAI_API_KEY|GEMINI_API_KEY|profile|email|phone|passport/i,
    );
  }

  assert.match(discovery, /stage: "discovery"/);
  assert.match(discovery, /requests: research\.usage\.requests/);
  assert.match(discovery, /webSearchCalls: research\.usage\.webSearchCalls/);

  assert.match(verification, /stage: "verification"/);
  assert.match(verification, /requests: result\.usage\.requests/);

  assert.match(writer, /stage: "writer"/);
  assert.match(writer, /requests: result\.usage\.requests/);
});
