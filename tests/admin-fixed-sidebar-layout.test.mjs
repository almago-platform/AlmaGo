import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const adminCss = readFileSync("src/app/admin-v3.css", "utf8");

test("admin desktop sidebar stays fixed and does not push main content below it", () => {
  assert.match(shell, /admin-shell-sidebar hidden lg:fixed lg:inset-y-0/);
  const adminSidebarBlock = adminCss.match(/\.admin-shell \.admin-shell-sidebar \{([\s\S]*?)\n\}/)?.[1] || "";
  assert.doesNotMatch(adminSidebarBlock, /position:\s*relative/);
});

test("admin content remains offset horizontally beside the fixed sidebar", () => {
  assert.match(shell, /role === "student" \? "lg:ps-\[15\.5rem\]" : "lg:pl-\[15\.5rem\]"/);
});
