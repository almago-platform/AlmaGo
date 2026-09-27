import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const documents = readFileSync("src/lib/documents.ts", "utf8");
const upload = readFileSync("src/app/api/student/documents/upload/route.ts", "utf8");

test("document validation checks declared type, extension, size and binary signature", () => {
  assert.match(documents, /allowedMimeTypes/);
  assert.match(documents, /maxDocumentBytes/);
  assert.match(documents, /export function isSafeDocumentFile/);
  assert.match(documents, /export async function hasAllowedDocumentSignature/);
  assert.match(documents, /file\.slice\(0, 8\)\.arrayBuffer\(\)/);
});

test("PDF JPEG and PNG signatures are explicitly recognized", () => {
  assert.match(documents, /0x25, 0x50, 0x44, 0x46, 0x2d/);
  assert.match(documents, /0xff && bytes\[1\] === 0xd8 && bytes\[2\] === 0xff/);
  assert.match(documents, /0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a/);
});

test("upload route rejects spoofed content before database and storage writes", () => {
  const signatureCheck = upload.indexOf("await hasAllowedDocumentSignature(file)");
  const databaseInsert = upload.indexOf('.from("documents").insert');
  const storageUpload = upload.indexOf('.from("student-documents").upload');

  assert.ok(signatureCheck >= 0);
  assert.ok(databaseInsert > signatureCheck);
  assert.ok(storageUpload > signatureCheck);
  assert.match(upload, /Le contenu du fichier ne correspond pas au format déclaré/);
});
