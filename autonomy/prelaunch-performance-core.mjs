import { validateAutopilotPlan } from "./copilot-autopilot-core.mjs";

export const PRELAUNCH_PERFORMANCE_THRESHOLD = 0.8;
export const PERFORMANCE_WRITABLE_PATHS = Object.freeze([
  "src/components/public/HomeHeader.tsx",
  "src/components/public/HomeHero.tsx",
  "src/components/public/HomeJourneySection.tsx",
]);

function auditMetric(report, id) {
  const audit = report?.audits?.[id];
  if (!audit) return null;
  return {
    id,
    score: typeof audit.score === "number" ? audit.score : null,
    numericValue: typeof audit.numericValue === "number" ? audit.numericValue : null,
    displayValue: audit.displayValue || null,
  };
}

function opportunitySavings(report, id) {
  const audit = report?.audits?.[id];
  const items = Array.isArray(audit?.details?.items) ? audit.details.items : [];
  return items.reduce((sum, item) => sum + Number(item?.wastedBytes || 0), 0);
}

function reportPathname(report) {
  try {
    return new URL(String(report?.finalUrl || report?.requestedUrl || "")).pathname;
  } catch {
    return null;
  }
}

function median(values = []) {
  const sorted = values.filter((value) => typeof value === "number").sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function aggregateHomepageLighthouseFinding(reports = [], {
  threshold = PRELAUNCH_PERFORMANCE_THRESHOLD,
  minRuns = 3,
} = {}) {
  const homepageReports = reports.filter((report) => reportPathname(report) === "/");
  if (homepageReports.length < minRuns) {
    return {
      eligible: false,
      reason: "insufficient_homepage_runs",
      runCount: homepageReports.length,
      requiredRuns: minRuns,
    };
  }

  const complete = homepageReports.filter((report) => {
    const categories = report?.categories || {};
    return [
      categories.performance?.score,
      categories.accessibility?.score,
      categories.seo?.score,
      categories["best-practices"]?.score,
    ].every((score) => typeof score === "number");
  });
  if (complete.length < minRuns) {
    return {
      eligible: false,
      reason: "insufficient_complete_homepage_runs",
      runCount: complete.length,
      requiredRuns: minRuns,
    };
  }

  const performanceScores = complete.map((report) => report.categories.performance.score);
  const accessibility = Math.min(...complete.map((report) => report.categories.accessibility.score));
  const seo = Math.min(...complete.map((report) => report.categories.seo.score));
  const bestPractices = Math.min(...complete.map((report) => report.categories["best-practices"].score));
  const medianPerformance = median(performanceScores);

  if (accessibility < 0.95 || seo < 0.9 || bestPractices < 0.9) {
    return {
      eligible: false,
      reason: "quality_regression_requires_separate_triage",
      runCount: complete.length,
      scores: {
        performance: medianPerformance,
        accessibility,
        seo,
        bestPractices,
      },
      performanceRange: [Math.min(...performanceScores), Math.max(...performanceScores)],
    };
  }

  const sortedByPerformance = [...complete].sort(
    (a, b) => a.categories.performance.score - b.categories.performance.score
  );
  const representative = sortedByPerformance[Math.floor(sortedByPerformance.length / 2)];
  const representativeFinding = homepageLighthouseFinding(representative, { threshold });

  return {
    ...representativeFinding,
    eligible: medianPerformance < threshold,
    reason: medianPerformance < threshold
      ? "homepage_median_performance_below_budget"
      : "homepage_median_performance_within_budget",
    runCount: complete.length,
    scores: {
      ...representativeFinding.scores,
      performance: medianPerformance,
      accessibility,
      seo,
      bestPractices,
    },
    performanceRange: [Math.min(...performanceScores), Math.max(...performanceScores)],
  };
}

export function homepageLighthouseFinding(report, {
  threshold = PRELAUNCH_PERFORMANCE_THRESHOLD,
} = {}) {
  if (!report || typeof report !== "object") return { eligible: false, reason: "missing_report" };
  let url;
  try {
    url = new URL(String(report.finalUrl || report.requestedUrl || ""));
  } catch {
    return { eligible: false, reason: "invalid_report_url" };
  }
  if (url.pathname !== "/") return { eligible: false, reason: "not_homepage_report" };

  const performance = report.categories?.performance?.score;
  const accessibility = report.categories?.accessibility?.score;
  const seo = report.categories?.seo?.score;
  const bestPractices = report.categories?.["best-practices"]?.score;
  if (![performance, accessibility, seo, bestPractices].every((score) => typeof score === "number")) {
    return { eligible: false, reason: "missing_category_scores" };
  }

  if (accessibility < 0.95 || seo < 0.9 || bestPractices < 0.9) {
    return {
      eligible: false,
      reason: "quality_regression_requires_separate_triage",
      scores: { performance, accessibility, seo, bestPractices },
    };
  }

  const evidence = {
    scores: { performance, accessibility, seo, bestPractices },
    metrics: {
      lcp: auditMetric(report, "largest-contentful-paint"),
      tbt: auditMetric(report, "total-blocking-time"),
      maxPotentialFid: auditMetric(report, "max-potential-fid"),
    },
    opportunityBytes: {
      responsiveImages: opportunitySavings(report, "uses-responsive-images"),
      unusedJavaScript: opportunitySavings(report, "unused-javascript"),
    },
  };

  if (performance >= threshold) {
    return { eligible: false, reason: "homepage_performance_within_budget", ...evidence };
  }

  return { eligible: true, reason: "homepage_performance_below_budget", ...evidence };
}

function metricText(metric) {
  return metric?.displayValue || (metric?.numericValue != null ? String(Math.round(metric.numericValue)) + " ms" : "n/a");
}

function buildPlanFromFinding(finding, {
  mainSha = "",
} = {}) {
  if (!finding.eligible) return finding;

  const shaSuffix = String(mainSha || "unknown")
    .slice(0, 12)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "") || "UNKNOWN";

  const block = {
    block_id: "PRELAUNCH-PERF-" + shaSuffix,
    lot: "PRELAUNCH-PERFORMANCE",
    title: "Improve measured homepage performance without changing product scope",
    enabled: true,
    depends_on: [],
    agent: "codex",
    model: "gpt-5.3-codex",
    custom_agent: null,
    base_ref: "main",
    writable_paths: [...PERFORMANCE_WRITABLE_PATHS],
    forbidden_paths: [
      ".github/**",
      "supabase/**",
      "tests/**",
      "src/app/api/**",
      "src/app/auth/**",
      "src/components/auth/**",
      "src/lib/supabase/**",
      "package.json",
      "package-lock.json",
      "next.config.*",
    ],
    risk_class: "moderate",
    merge_class: "AUTONOMOUS_SAFE",
    stop_condition: "Open one bounded performance PR and reach MERGE_READY; never merge automatically.",
    prompt: [
      "PRE-LAUNCH HOMEPAGE PERFORMANCE IMPROVEMENT.",
      (finding.runCount
        ? "Across " + finding.runCount + " production-build Lighthouse runs, the median homepage performance score is " +
          finding.scores.performance.toFixed(2) +
          " (range " + finding.performanceRange[0].toFixed(2) + "–" + finding.performanceRange[1].toFixed(2) + ")"
        : "The current production-build Lighthouse homepage performance score is " + finding.scores.performance.toFixed(2)) +
        " with accessibility " + finding.scores.accessibility.toFixed(2) +
        ", SEO " + finding.scores.seo.toFixed(2) +
        ", and best-practices " + finding.scores.bestPractices.toFixed(2) + ".",
      "Measured LCP: " + metricText(finding.metrics.lcp) + ".",
      "Measured Total Blocking Time: " + metricText(finding.metrics.tbt) + ".",
      "Measured Max Potential FID: " + metricText(finding.metrics.maxPotentialFid) + ".",
      "Responsive-image potential savings: " + Math.round(finding.opportunityBytes.responsiveImages / 1024) + " KiB.",
      "Unused-JavaScript potential savings: " + Math.round(finding.opportunityBytes.unusedJavaScript / 1024) + " KiB.",
      "Improve performance only inside the exact writable files.",
      "Preserve current public content, hierarchy, responsive behavior, accessibility, keyboard behavior, SEO, legal wording and visual direction.",
      "Prefer evidence-backed reductions in image transfer/render cost and unnecessary client-side work.",
      "Do not remove meaningful content or interactions merely to improve a synthetic score.",
      "Do not edit tests, workflows, dependencies, configuration, Auth/RLS/Supabase, migrations, secrets, billing, production data or release gates.",
      "Run relevant tests, typecheck, lint and build. Never merge or deploy.",
    ].join(" "),
  };

  const plan = {
    schemaVersion: 1,
    maxConcurrentTasks: 1,
    maxRevisionAttempts: 2,
    noAutomaticMerge: true,
    blocks: [block],
  };
  validateAutopilotPlan(plan);
  return { ...finding, plan };
}

export function buildPrelaunchPerformancePlan({
  report,
  mainSha = "",
  threshold = PRELAUNCH_PERFORMANCE_THRESHOLD,
} = {}) {
  return buildPlanFromFinding(homepageLighthouseFinding(report, { threshold }), { mainSha });
}

export function buildStablePrelaunchPerformancePlan({
  reports = [],
  mainSha = "",
  threshold = PRELAUNCH_PERFORMANCE_THRESHOLD,
  minRuns = 3,
} = {}) {
  return buildPlanFromFinding(
    aggregateHomepageLighthouseFinding(reports, { threshold, minRuns }),
    { mainSha },
  );
}
