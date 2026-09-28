export const SIGNAL_CATEGORIES = new Set(["regression", "typecheck", "lint", "security"]);
export const SIGNAL_SEVERITIES = new Set(["low", "moderate", "high", "critical"]);

export function signalMarker(key) {
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(String(key || ""))) {
    throw new Error("Invalid continuous-improvement signal key.");
  }
  return "<!-- almago-improvement-signal:" + key + " -->";
}

export function validateSignal(signal) {
  if (!signal || typeof signal !== "object") throw new Error("Signal is required.");
  signalMarker(signal.key);
  if (!SIGNAL_CATEGORIES.has(signal.category)) throw new Error("Invalid signal category.");
  if (!SIGNAL_SEVERITIES.has(signal.severity)) throw new Error("Invalid signal severity.");
  if (!String(signal.title || "").trim() || !String(signal.summary || "").trim()) {
    throw new Error("Signal title and summary are required.");
  }
  return true;
}

export function labelsForSignal(signal) {
  validateSignal(signal);
  const labels = ["almago-improvement-candidate"];
  if (signal.category === "security" || signal.severity === "critical") {
    labels.push("almago-human-required");
  } else {
    labels.push("almago-codex-required");
  }
  return labels;
}

export function issueBodyForSignal(signal) {
  validateSignal(signal);
  const lines = [
    signalMarker(signal.key),
    "# AlmaGo continuous-improvement signal",
    "",
    "Category: " + signal.category,
    "Severity: " + signal.severity,
    "Source: deterministic post-launch sensor",
    "",
    "## Finding",
    signal.summary,
    "",
    "## Evidence",
    String(signal.evidence || "No additional evidence supplied.").slice(0, 6000),
    "",
    "## Safety",
    "- This issue is a discovery signal, not authorization to edit code.",
    "- A bounded writable-file contract is required before any agent implementation.",
    "- Auth/RLS, migrations, secrets, billing, production data, and destructive changes remain human-gated.",
    "- Do not merge from this signal alone.",
  ];
  return lines.join("\n");
}

function auditSeverity(vulnerabilities = {}) {
  if (Number(vulnerabilities.critical || 0) > 0) return "critical";
  if (Number(vulnerabilities.high || 0) > 0) return "high";
  if (Number(vulnerabilities.moderate || 0) > 0) return "moderate";
  if (Number(vulnerabilities.low || 0) > 0) return "low";
  return null;
}

export function buildSignals({
  testOutcome = "success",
  typecheckOutcome = "success",
  lintOutcome = "success",
  audit = {},
  testEvidence = "",
  typecheckEvidence = "",
  lintEvidence = "",
} = {}) {
  const signals = [];
  if (testOutcome !== "success") {
    signals.push({
      key: "main-tests",
      category: "regression",
      severity: "high",
      title: "[CONTINUOUS] Main test suite regression",
      summary: "The scheduled post-launch sensor detected a failing full test suite on the default branch.",
      evidence: ("Sensor outcome: npm test = " + testOutcome + ".\n" + String(testEvidence || "")).slice(0, 6000),
    });
  }
  if (typecheckOutcome !== "success") {
    signals.push({
      key: "main-typecheck",
      category: "typecheck",
      severity: "high",
      title: "[CONTINUOUS] Main TypeScript regression",
      summary: "The scheduled post-launch sensor detected a TypeScript typecheck failure on the default branch.",
      evidence: ("Sensor outcome: npx tsc --noEmit = " + typecheckOutcome + ".\n" + String(typecheckEvidence || "")).slice(0, 6000),
    });
  }
  if (lintOutcome !== "success") {
    signals.push({
      key: "main-lint",
      category: "lint",
      severity: "moderate",
      title: "[CONTINUOUS] Main lint regression",
      summary: "The scheduled post-launch sensor detected a lint failure on the default branch.",
      evidence: ("Sensor outcome: npm run lint = " + lintOutcome + ".\n" + String(lintEvidence || "")).slice(0, 6000),
    });
  }

  const vulnerabilities = audit?.metadata?.vulnerabilities || {};
  const severity = auditSeverity(vulnerabilities);
  if (severity) {
    signals.push({
      key: "production-audit",
      category: "security",
      severity,
      title: "[CONTINUOUS] Production dependency vulnerability signal",
      summary: "The scheduled production dependency audit reports one or more vulnerabilities.",
      evidence: [
        "critical=" + Number(vulnerabilities.critical || 0),
        "high=" + Number(vulnerabilities.high || 0),
        "moderate=" + Number(vulnerabilities.moderate || 0),
        "low=" + Number(vulnerabilities.low || 0),
      ].join(", "),
    });
  }
  signals.forEach(validateSignal);
  return signals;
}

export function signalKeyFromIssue(issue) {
  const match = String(issue?.body || "").match(/<!--\s*almago-improvement-signal:([a-z0-9][a-z0-9-]{1,63})\s*-->/);
  return match?.[1] || null;
}
