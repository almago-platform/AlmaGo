import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/api/admin/academic-evidence/route.ts", "utf8");

test("Admin academic-evidence API keeps authentication and role gates explicit", () => {
  assert.match(route, /getAdminUser/);
  assert.match(route, /if \(!user\)[\s\S]*status: 401/);
  assert.match(route, /if \(!isAdmin\)[\s\S]*status: 403/);
  assert.doesNotMatch(route, /service_role|SUPABASE_SERVICE_ROLE/i);
});

test("API accepts only canonical LOT 4 enums and rejects unknown body fields", () => {
  assert.match(route, /academicEvidenceTypes\.includes/);
  assert.match(route, /academicEvidenceOrigins\.includes/);
  assert.match(route, /academicEvidenceVerificationStatuses\.includes/);
  assert.match(route, /allowedKeys/);
  assert.match(route, /champ non autorisé/);
});

test("linked document is verified against the same student before every write", () => {
  assert.match(route, /from\("documents"\)/);
  assert.match(route, /\.eq\("id", documentId\)/);
  assert.match(route, /\.eq\("student_id", studentId\)/);
  assert.match(route, /n’appartient pas à cet étudiant/);
});

test("accepted pathway evidence is preflighted and bound to the connected Admin identity", () => {
  assert.match(route, /verification_status === "accepted_for_pathway"/);
  assert.match(route, /assessAcademicEvidence/);
  assert.match(route, /verified_by: accepted \? userId : null/);
  assert.match(route, /verified_at: verifiedAt/);
  assert.doesNotMatch(route, /input\.verified_by|body\.verified_by/);
});

test("PATCH cannot move an existing evidence record to another student", () => {
  assert.match(route, /select\("id,student_id"\)/);
  assert.match(route, /current\.student_id !== parsed\.value\.student_id/);
  assert.match(route, /ne peut pas être modifié/);
  assert.match(route, /\.eq\("student_id", parsed\.value\.student_id\)/);
});

test("database contract failures map to bounded 4xx responses without raw DB leakage", () => {
  for (const token of [
    "academic_evidence_acceptance_prerequisites_missing",
    "academic_evidence_document_not_approved",
    "academic_evidence_date_invalid",
    "academic_evidence_verification_time_invalid",
    "academic_evidence_admin_verifier_required",
  ]) assert.match(route, new RegExp(token));
  assert.doesNotMatch(route, /NextResponse\.json\(\{ error: error\.message/);
});
