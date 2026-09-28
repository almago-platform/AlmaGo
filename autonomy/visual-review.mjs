import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT = "artifacts/visual-review.md";
const JSON_OUTPUT = "artifacts/visual-review.json";
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const AREAS = new Set(["hierarchy", "readability", "consistency", "spacing", "responsive", "trust", "cta", "accessibility"]);
const SEVERITIES = new Set(["low", "moderate", "high"]);

export function selectScreenshots(dir, maxImages = 2) {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir)
    .filter(name => name.toLowerCase().endsWith(".png"))
    .sort();

  const preferred = [
    ...files.filter(name => /^home-/i.test(name)),
    ...files.filter(name => !/^home-/i.test(name)),
  ];
  return [...new Set(preferred)].slice(0, Math.max(1, Math.min(4, maxImages)));
}

function bounded(value, max) {
  const text = String(value || "").trim();
  if (!text || text.length > max) throw new Error("Invalid visual-review text field.");
  return text;
}

export function validateVisualReview(review) {
  if (!review || typeof review !== "object") throw new Error("Visual review is required.");
  if (!["PASS", "REVISE"].includes(review.verdict)) throw new Error("Invalid visual-review verdict.");
  if (!["low", "medium", "high"].includes(review.confidence)) throw new Error("Invalid visual-review confidence.");
  if (!Array.isArray(review.findings) || review.findings.length > 6) throw new Error("Invalid visual-review findings.");
  if (!Array.isArray(review.actions) || review.actions.length > 4) throw new Error("Invalid visual-review actions.");

  for (const finding of review.findings) {
    if (!finding || typeof finding !== "object") throw new Error("Invalid visual-review finding.");
    if (!SEVERITIES.has(finding.severity)) throw new Error("Invalid visual-review finding severity.");
    if (!AREAS.has(finding.area)) throw new Error("Invalid visual-review finding area.");
    bounded(finding.summary, 500);
  }
  for (const action of review.actions) bounded(action, 500);

  if (review.verdict === "PASS" && review.actions.length) {
    throw new Error("PASS visual review must not request actions.");
  }
  if (review.verdict === "REVISE" && !review.findings.length) {
    throw new Error("REVISE visual review requires at least one finding.");
  }
  return true;
}

export function markdownForReview(review) {
  validateVisualReview(review);
  const lines = [
    "VERDICT: " + review.verdict,
    "CONFIDENCE: " + review.confidence,
    "",
    "## Findings",
  ];
  if (!review.findings.length) lines.push("- None.");
  else review.findings.forEach((finding) => {
    lines.push("- [" + finding.severity.toUpperCase() + "][" + finding.area + "] " + finding.summary);
  });
  lines.push("", "## Prioritized actions");
  if (!review.actions.length) lines.push("- None.");
  else review.actions.forEach((action, index) => lines.push((index + 1) + ". " + action));
  return lines.join("\n");
}

function writeTextReport(text) {
  mkdirSync("artifacts", { recursive: true });
  writeFileSync(OUTPUT, text.trim() + "\n");
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, "\n## AlmaGo visual review\n\n" + text.trim() + "\n");
  }
}

function writeStructuredReport(review) {
  validateVisualReview(review);
  mkdirSync("artifacts", { recursive: true });
  writeFileSync(JSON_OUTPUT, JSON.stringify(review, null, 2) + "\n");
  writeTextReport(markdownForReview(review));
}

function responseSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      verdict: { type: "string", enum: ["PASS", "REVISE"] },
      confidence: { type: "string", enum: ["low", "medium", "high"] },
      findings: {
        type: "array",
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            severity: { type: "string", enum: ["low", "moderate", "high"] },
            area: { type: "string", enum: [...AREAS] },
            summary: { type: "string" },
          },
          required: ["severity", "area", "summary"],
        },
      },
      actions: {
        type: "array",
        maxItems: 4,
        items: { type: "string" },
      },
    },
    required: ["verdict", "confidence", "findings", "actions"],
  };
}

async function reviewScreenshots(dir) {
  const maxImages = Number.parseInt(process.env.ALMAGO_VISUAL_REVIEW_MAX_IMAGES || "2", 10);
  const files = selectScreenshots(dir, Number.isFinite(maxImages) ? maxImages : 2);
  if (!files.length) {
    writeTextReport("SKIPPED — no screenshots were available for visual review.");
    return;
  }
  if (!process.env.GEMINI_API_KEY) {
    writeTextReport("SKIPPED — GEMINI_API_KEY is not configured.");
    return;
  }

  const parts = [{
    text: [
      "You are the visual QA reviewer for AlmaGo, a professional student portal for studies in Germany.",
      "Review only the supplied screenshots. Do not invent product features or facts.",
      "Evaluate visual hierarchy, readability, consistency, spacing, responsive behavior, trust/professional tone, focus/CTA clarity and obvious accessibility issues.",
      "The desired direction is sober, professional and credible, preserving the existing AlmaGo brand language.",
      "Return REVISE only for concrete visible issues that materially reduce professional quality or usability.",
      "Do not request Auth, RLS, Supabase, permissions, backend, business-rule, legal, content-strategy or new-feature changes.",
      "Actions must be implementation-oriented but must not contain code.",
    ].join("\n")
  }];

  let total = 0;
  for (const file of files) {
    const path = join(dir, file);
    const bytes = readFileSync(path);
    total += bytes.length;
    if (total > MAX_TOTAL_BYTES) {
      writeTextReport("SKIPPED — screenshot payload exceeded the 4 MiB visual-review safety limit.");
      return;
    }
    parts.push({ text: "SCREENSHOT: " + basename(file) });
    parts.push({ inlineData: { mimeType: "image/png", data: bytes.toString("base64") } });
  }

  const model = process.env.ALMAGO_GEMINI_MODEL || "gemini-3.8-flash";
  if (!/^[A-Za-z0-9_.-]+$/.test(model)) throw new Error("Invalid Gemini model identifier.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            maxOutputTokens: 1800,
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: responseSchema(),
          },
        }),
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      writeTextReport("SKIPPED — Gemini visual review unavailable (HTTP " + response.status + ").");
      return;
    }
    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    if (!raw) {
      writeTextReport("SKIPPED — Gemini returned no visual-review text.");
      return;
    }
    writeStructuredReport(JSON.parse(raw));
  } finally {
    clearTimeout(timer);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  reviewScreenshots(process.argv[2] || "artifacts/screenshots").catch(error => {
    writeTextReport("SKIPPED — visual review failed safely: " + error.message);
  });
}
