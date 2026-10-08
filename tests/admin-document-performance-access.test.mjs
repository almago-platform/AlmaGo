import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const adminView = read("src/app/api/admin/documents/[id]/view/route.ts");
const studentView = read("src/app/api/documents/[id]/view/route.ts");
const queue = read("src/components/admin/AdminDocumentsPanel.tsx");
const requirements = read("src/components/admin/AdminDocumentRequirementsPanel.tsx");
const adminPage = read("src/app/admin/documents/page.tsx");

test("admin document view requires authenticated admin with MFA; student entitlement is unchanged", () => {
  assert.match(adminView, /getAdminUser\(\)/);
  assert.match(adminView, /if \(!user\)[^\n]*status: 401/);
  assert.match(adminView, /if \(!isAdmin\)[^\n]*status: 403/);
  assert.match(adminView, /from\("documents"\)/);
  assert.match(adminView, /storage\.from\("student-documents"\)|\.from\("student-documents"\)/);
  assert.match(adminView, /createSignedUrl\(document\.storage_path, 60\)/);
  assert.match(adminView, /Cache-Control", "private, no-store"/);
  assert.match(adminView, /Server-Timing/);
  assert.doesNotMatch(adminView, /createPrivilegedSupabaseClient|SUPABASE_SECRET|service.role|service_role/);
  assert.match(studentView, /getStudentUser\(\)/);
  assert.match(studentView, /if \(!isStudent\)/);
});

test("admin document links no longer use student-only view URL", () => {
  assert.match(queue, /href=\{`\/api\/admin\/documents\/\$\{document\.id\}\/view`\}/);
  assert.match(requirements, /href=\{`\/api\/admin\/documents\/\$\{linked\.id\}\/view`\}/);
  assert.doesNotMatch(queue, /href=\{`\/api\/documents\//);
  assert.doesNotMatch(requirements, /href=\{`\/api\/documents\//);
});

test("admin document queue paginates mounted cards while maintaining full-queue counts", () => {
  assert.match(queue, /const pageSize = 25/);
  assert.match(queue, /documents\.slice\(/);
  assert.match(queue, /visibleDocuments\.map\(/);
  assert.match(queue, /documents\.filter\(/);
  assert.match(queue, /aria-label="Pagination des documents"/);
  assert.match(queue, /Documents .* sur \{documents\.length\}/);
});

test("admin document performance logs are opt-in and redact identifying values", () => {
  assert.match(adminPage, /ALMAGO_ADMIN_DOCUMENT_PERF_LOG_ENABLED/);
  assert.match(adminPage, /logAdminDocumentPerformance\(startedAt, queryMs, documents\.length/);
  assert.match(adminPage, /documentStatusById\.get\(/);
  assert.doesNotMatch(adminPage, /console\.info\([^;]*(?:original_filename|student_id|storage_path|signedUrl)/);
});
