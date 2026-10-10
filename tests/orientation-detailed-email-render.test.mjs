import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const imageBytes = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDBooor2jyD/9k=", "base64");
const source = readFileSync("src/lib/orientation/pdf-attachments.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function builder(withPhoto) {
  const exports = {};
  const stats = { curate: 0, fetch: 0 };
  const curated = {
    coverImageUrl: "https://upload.wikimedia.org/wikipedia/commons/example.jpg",
    coverImageSourceUrl: "https://commons.wikimedia.org/wiki/File:example.jpg",
    coverImageAttribution: "Fixture photographer",
    coverImageLicense: "CC BY-SA 4.0",
  };
  const sandbox = {
    Buffer, URL, AbortSignal, Response, exports, setTimeout, clearTimeout,
    fetch: async () => {
      stats.fetch += 1;
      if (!withPhoto) throw new Error("offline fixture");
      let readOnce = false;
      return {
        ok: true,
        headers: { get: (name) => name === "content-type" ? "image/jpeg" : null },
        body: { getReader: () => ({
          read: async () => {
            if (readOnce) return { done: true };
            readOnce = true;
            return { done: false, value: imageBytes };
          },
          cancel: async () => {},
        }) },
      };
    },
    require: (name) => {
      if (name === "server-only") return {};
      if (name.includes("orientation-diagnostic-copy")) return { orientationDiagnosticCopy: {} };
      if (name.includes("writer/candidate-priority")) return {
        orientationCandidatePriority: () => ({
          title: "Préparez sereinement votre Bac 2027", text: "Votre Bac est votre priorité.",
          yourStep: "Préparer le Bac.",
        }),
      };
      if (name.includes("curated-university-media")) return {
        findCuratedUniversityMedia: (institution) => {
          stats.curate += 1;
          return institution === "University of Bamberg" ? curated : null;
        },
      };
      throw new Error("Unexpected import: " + name);
    },
  };
  vm.runInNewContext(compiled, sandbox, { filename: "pdf-attachments.ts", timeout: 3000 });
  const renderer = sandbox.exports.buildDetailedOrientationEmailPdfAttachment;
  renderer.stats = stats;
  return renderer;
}

function input() {
  return {
    locale: "fr", email: "candidate@example.test",
    generatedAt: new Date("2026-10-10T12:00:00Z"),
    identity: { firstName: "Candidate", lastName: "Example" },
    answers: {
      targetDegree: "Bachelor", targetField: "Lettres/Langues", germanLevel: "B2",
      preferredCities: ["Erlangen"], bacStatus: "preparing",
    },
    personalized: {
      selected: [{
        optionId: "o1", position: 1, institution: "University of Bamberg",
        programme: "Bachelor German Studies", city: "Bamberg",
        overallStatus: "needs_review", facts: [],
      }],
      content: {
        opening: "Bienvenue", projectStatus: "Votre projet prend forme.",
        mainPriority: { title: "Bac 2027", text: "Continuez votre préparation.", nextStep: "Préparer votre Bac" },
        campusValue: "Nous vérifions les programmes.", reassurance: "Nous vous accompagnons.",
        studyOptions: [{ optionId: "o1", whyItFits: "Une formation en lettres." }],
        roadmap: [{ id: "r1", label: "Votre étape", text: "Préparer votre Bac" }],
      },
    },
    supplemental: [
      { institution: "FAU Erlangen", programme: "Germanistik", city: "Erlangen", officialUrl: "https://www.fau.de" },
      { institution: "University of Regensburg", programme: "English Linguistics", city: "Regensburg", officialUrl: "https://www.uni-regensburg.de" },
    ],
  };
}

test("detailed email attachment is a valid multipage binary PDF with no network image", async () => {
  const pdf = await builder(false)(input());
  assert.equal(pdf.contentType, "application/pdf");
  assert.equal(pdf.filename, "dossier-detaille-campus-allemagne.pdf");
  const bytes = Buffer.from(pdf.contentBase64, "base64");
  assert.match(bytes.toString("ascii", 0, 10), /^%PDF-1\.4/);
  assert.match(bytes.toString("latin1"), /\/Type \/Pages \/Count 4 /);
  assert.match(bytes.toString("latin1"), /%%EOF/);
});

test("licensed Wikimedia image is embedded using JPEG DCT without blocking output", async () => {
  const renderer = builder(true);
  const pdf = await renderer(input());
  assert.ok(renderer.stats.curate > 0, "curated calls = " + renderer.stats.curate);
  assert.equal(renderer.stats.fetch, 1, "photo requests = " + renderer.stats.fetch);
  const bytes = Buffer.from(pdf.contentBase64, "base64");
  assert.match(bytes.toString("latin1"), /\/Subtype \/Image \/Width 8 \/Height 8/);
  assert.match(bytes.toString("latin1"), /\/Filter \/DCTDecode/);
  assert.ok(bytes.includes(imageBytes));
});
