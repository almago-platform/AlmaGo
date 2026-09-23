import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const OUTPUT = "artifacts/visual-review.md";
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

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

function writeReport(text) {
  mkdirSync("artifacts", { recursive: true });
  writeFileSync(OUTPUT, text.trim() + "\n");
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, "\n## AlmaGo visual review\n\n" + text.trim() + "\n");
  }
}

async function reviewScreenshots(dir) {
  const maxImages = Number.parseInt(process.env.ALMAGO_VISUAL_REVIEW_MAX_IMAGES || "2", 10);
  const files = selectScreenshots(dir, Number.isFinite(maxImages) ? maxImages : 2);
  if (!files.length) {
    writeReport("SKIPPED — no screenshots were available for visual review.");
    return;
  }
  if (!process.env.GEMINI_API_KEY) {
    writeReport("SKIPPED — GEMINI_API_KEY is not configured.");
    return;
  }

  const parts = [{
    text: [
      "You are the visual QA reviewer for AlmaGo, a professional student portal for studies in Germany.",
      "Review only the supplied screenshots. Do not invent product features or facts.",
      "Evaluate visual hierarchy, readability, consistency, spacing, responsive behavior, trust/professional tone, focus/CTA clarity and obvious accessibility issues.",
      "The desired direction is sober and professional, with the AlmaGo indigo/orange system already present in the screenshots.",
      "Return Markdown with: VERDICT: PASS or REVISE; then at most 6 concise findings; then at most 4 prioritized actions.",
      "Do not output code. Do not request changes to Auth, RLS, Supabase, permissions or business rules."
    ].join("\n")
  }];

  let total = 0;
  for (const file of files) {
    const path = join(dir, file);
    const bytes = readFileSync(path);
    total += bytes.length;
    if (total > MAX_TOTAL_BYTES) {
      writeReport("SKIPPED — screenshot payload exceeded the 4 MiB visual-review safety limit.");
      return;
    }
    parts.push({ text: "SCREENSHOT: " + basename(file) });
    parts.push({ inlineData: { mimeType: "image/png", data: bytes.toString("base64") } });
  }

  const model = process.env.ALMAGO_GEMINI_MODEL || "gemini-2.5-flash";
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
          generationConfig: { maxOutputTokens: 1600, temperature: 0.1 },
        }),
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      writeReport("SKIPPED — Gemini visual review unavailable (HTTP " + response.status + ").");
      return;
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    writeReport(text || "SKIPPED — Gemini returned no visual-review text.");
  } finally {
    clearTimeout(timer);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  reviewScreenshots(process.argv[2] || "artifacts/screenshots").catch(error => {
    writeReport("SKIPPED — visual review failed safely: " + error.message);
  });
}
