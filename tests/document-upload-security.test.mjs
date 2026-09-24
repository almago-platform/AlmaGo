import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  hasSafeDocumentSignature,
  isSafeDocumentFile,
} from "../src/lib/documents.ts";

const uploadRoute = readFileSync("src/app/api/student/documents/upload/route.ts", "utf8");
const deleteRoute = readFileSync("src/app/api/student/documents/[id]/route.ts", "utf8");

function file(bytes, name, type) {
  return new File([Uint8Array.from(bytes)], name, { type });
}

test("document upload accepts matching PDF, JPEG and PNG signatures", async () => {
  const pdf = file([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31], "doc.pdf", "application/pdf");
  const jpeg = file([0xff, 0xd8, 0xff, 0xe0], "photo.jpg", "image/jpeg");
  const png = file([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "scan.png", "image/png");

  for (const candidate of [pdf, jpeg, png]) {
    assert.equal(isSafeDocumentFile(candidate), true);
    assert.equal(await hasSafeDocumentSignature(candidate), true);
  }
});

test("document upload rejects spoofed content despite a trusted extension and MIME", async () => {
  const fakePdf = file(
    [0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e],
    "fake.pdf",
    "application/pdf",
  );

  assert.equal(isSafeDocumentFile(fakePdf), true);
  assert.equal(await hasSafeDocumentSignature(fakePdf), false);

  assert.match(uploadRoute, /await hasSafeDocumentSignature\(file\)/);
  assert.match(uploadRoute, /Le contenu du fichier ne correspond pas/);
});

test("document deletion removes storage before the database row", () => {
  const storageIndex = deleteRoute.indexOf('.storage.from("student-documents").remove');
  const rowDeleteIndex = deleteRoute.indexOf('.from("documents").delete');

  assert.ok(storageIndex >= 0);
  assert.ok(rowDeleteIndex > storageIndex);
  assert.match(deleteRoute, /removableDocumentStatuses\.includes/);
});

test("document upload writes only after metadata and content validation", () => {
  const metadataIndex = uploadRoute.indexOf("isSafeDocumentFile(file)");
  const signatureIndex = uploadRoute.indexOf("hasSafeDocumentSignature(file)");
  const insertIndex = uploadRoute.indexOf('.from("documents").insert');
  const uploadIndex = uploadRoute.indexOf('.storage.from("student-documents").upload');

  assert.ok(metadataIndex >= 0);
  assert.ok(signatureIndex > metadataIndex);
  assert.ok(insertIndex > signatureIndex);
  assert.ok(uploadIndex > insertIndex);
});
