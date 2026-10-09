import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/admin/dossiers/[studentId]/page.tsx", "utf8");
const nav = readFileSync("src/components/admin/AdminDossierNavigation.tsx", "utf8");
const brief = readFileSync("src/components/admin/AdminCounselorBrief.tsx", "utf8");
const docs = readFileSync("src/components/admin/AdminDocumentRequirementsPanel.tsx", "utf8");
const disclosure = readFileSync("src/components/admin/AdminDossierDisclosure.tsx", "utf8");

test("all detailed dossier modules remain available at full content width", () => {
  assert.match(page, /className="min-w-0 space-y-6"/);
  assert.doesNotMatch(page, /xl:grid-cols-\[minmax\(0,1\.35fr\)_minmax\(19rem,0\.65fr\)\]/);
  for (const key of ["AdminCounselorBrief", "AdminDossierQuickHandoff", "AdminDossierBlockersPanel",
    "AdminDossierActionsPanel", "AdminStudentProjectPanel", "AdminDocumentRequirementsPanel",
    "AdminCaseOwnerPanel", "AdminDossierHistory", "AdminAdmissionPdfForm", "DossierMessageThread"]) {
    assert.ok(page.includes("<" + key), key);
  }
  assert.equal((page.match(/<AdminDossierDisclosure/g) || []).length, 4);
});

test("summary and progress have separate functional anchors", () => {
  assert.match(page, /id="overview" className="min-w-0 scroll-mt-28"/);
  assert.match(page, /id="followup" className="min-w-0 scroll-mt-28"/);
  assert.match(page, /id="progress" className="scroll-mt-28/);
  assert.ok(page.indexOf('id="overview"') < page.indexOf("<AdminCounselorBrief"));
  assert.match(nav, /href: "#followup", label: "Admission et suivi"/);
  assert.match(nav, /href: "#progress", label: "Parcours"/);
  for (const anchor of ["#overview", "#actions", "#messages", "#documents", "#applications", "#history"]) {
    assert.ok(nav.includes(anchor), anchor);
  }
});

test("large-screen navigation is compact, mobile navigation never obscures content", () => {
  assert.match(nav, /xl:sticky xl:top-0/);
  assert.doesNotMatch(nav, /sticky top-\[4\.25rem\]/);
  assert.match(nav, /xl:flex-row xl:items-center/);
  assert.match(nav, /xl:absolute xl:end-0 xl:top-full/);
  assert.match(nav, /closeOnOutsideClick/);
  assert.match(nav, /closeOnEscape/);
  assert.match(nav, /aria-current=\{activeHash === href \? "location"/);
  assert.match(disclosure, /document\.addEventListener\("click", revealOnClick\)/);
});

test("documents counters can wrap within narrower widths without hiding the facts", () => {
  assert.match(docs, /grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4/);
  assert.match(docs, /className="min-w-0 rounded-\[var\(--radius-control\)\]/);
  assert.match(docs, /break-words text-xs font-bold leading-4/);
  assert.match(page, /className="break-all text-sm font-semibold text-slate-900"/);
  assert.match(page, /intake\?\.proposal_reason/);
  assert.match(page, /<bdi dir="auto"/);
  assert.match(brief, /items-start gap-3 lg:grid-cols/);
  assert.match(brief, /leadBlocker\.reason/);
});

test("visual changes do not invent actions or bypass evidence and commercial gates", () => {
  for (const source of [nav, brief, disclosure]) {
    assert.doesNotMatch(source, /\.insert\(|\.update\(|supabase|service_role/);
  }
  assert.match(page, /document_status: item\.document_id \? documentStatusById\.get/);
  assert.match(page, /applicationDateIsTrusted\(application\)/);
  assert.match(page, /available: !linkedEvidenceResult\.error/);
  assert.match(page, /purchaseStatusLabel\(purchase\?\.status\)/);
});
