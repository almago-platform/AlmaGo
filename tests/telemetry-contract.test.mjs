import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contract = JSON.parse(readFileSync("config/telemetry-events.json", "utf8"));
const observabilityDoc = readFileSync("docs/observability.md", "utf8");

test("telemetry stays disabled by default and allow-list only", () => {
  assert.equal(contract.schemaVersion, 1);
  assert.equal(contract.defaultMode, "disabled");
  assert.equal(contract.policy, "allowlist-only");
});

test("telemetry event names and properties are bounded and non-sensitive", () => {
  assert.ok(Array.isArray(contract.events) && contract.events.length > 0);
  assert.ok(contract.events.length <= 10);

  const names = new Set();
  const forbidden = (contract.forbiddenPropertyPatterns || []).map(value => String(value).toLowerCase());

  for (const event of contract.events) {
    assert.match(event.name, /^[a-z][a-z0-9_]{2,63}$/);
    assert.equal(names.has(event.name), false, "duplicate telemetry event: " + event.name);
    names.add(event.name);

    assert.ok(Array.isArray(event.properties));
    assert.ok(event.properties.length <= 8);

    for (const property of event.properties) {
      assert.match(property, /^[a-z][a-z0-9_]{1,63}$/);
      const lower = property.toLowerCase();
      assert.equal(
        forbidden.some(pattern => lower.includes(pattern)),
        false,
        "sensitive telemetry property is forbidden: " + property,
      );
    }
  }
});


test("observability documentation lists every canonical telemetry event", () => {
  for (const event of contract.events) {
    assert.match(
      observabilityDoc,
      new RegExp(`\\`${event.name}\\``),
      "missing telemetry event in observability docs: " + event.name,
    );
  }
});
