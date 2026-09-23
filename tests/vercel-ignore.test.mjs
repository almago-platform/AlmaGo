import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const { ignoreCommand } = JSON.parse(readFileSync("vercel.json", "utf8"));

function sh(cwd, command, expectStatus) {
  const result = spawnSync("bash", ["-lc", command], { cwd, encoding: "utf8" });
  assert.equal(
    result.status,
    expectStatus,
    `unexpected exit for ${command}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
  );
}

function commit(cwd, message) {
  execFileSync("git", ["add", "-A"], { cwd });
  execFileSync("git", ["commit", "-m", message], { cwd, stdio: "ignore" });
}

test("Vercel skips non-app-only commits but builds app/config changes", () => {
  const dir = mkdtempSync(join(tmpdir(), "almago-vercel-ignore-"));
  mkdirSync(join(dir, "src", "app"), { recursive: true });
  mkdirSync(join(dir, "docs"), { recursive: true });
  writeFileSync(join(dir, "src", "app", "page.tsx"), "export default function Page(){return null}\n");
  writeFileSync(join(dir, "docs", "note.md"), "base\n");
  writeFileSync(join(dir, "package.json"), "{}\n");
  writeFileSync(join(dir, "package-lock.json"), "{}\n");
  writeFileSync(join(dir, "tsconfig.json"), "{}\n");
  writeFileSync(join(dir, "vercel.json"), JSON.stringify({ ignoreCommand }) + "\n");

  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "ci@almago.invalid"], { cwd: dir });
  execFileSync("git", ["config", "user.name", "AlmaGo CI"], { cwd: dir });
  commit(dir, "base");

  writeFileSync(join(dir, "docs", "note.md"), "docs-only\n");
  commit(dir, "docs");
  sh(dir, ignoreCommand, 0);

  writeFileSync(join(dir, "src", "app", "page.tsx"), "export default function Page(){return <main/>}\n");
  commit(dir, "app");
  sh(dir, ignoreCommand, 1);

  writeFileSync(join(dir, "package.json"), "{\"name\":\"almago-test\"}\n");
  commit(dir, "config");
  sh(dir, ignoreCommand, 1);
});
