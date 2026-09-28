import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import {
  aggregateHomepageLighthouseFinding,
  buildPrelaunchPerformancePlan,
  buildStablePrelaunchPerformancePlan,
  homepageLighthouseFinding,
  PERFORMANCE_WRITABLE_PATHS,
} from "./prelaunch-performance-core.mjs";

const require = createRequire(import.meta.url);
const lighthouseConfig = require("../lighthouserc.cjs");
const stablePerformanceConfig = require("../lighthouserc.prelaunch-performance.cjs");

function report({
  url = "http://127.0.0.1:3000/",
  performance = 0.71,
  accessibility = 1,
  seo = 1,
  bestPractices = 1,
} = {}) {
  return {
    finalUrl: url,
    categories: {
      performance: { score: performance },
      accessibility: { score: accessibility },
      seo: { score: seo },
      "best-practices": { score: bestPractices },
    },
    audits: {
      "largest-contentful-paint": { numericValue: 4100, displayValue: "4.1 s", score: 0.48 },
      "total-blocking-time": { numericValue: 640, displayValue: "640 ms", score: 0.47 },
      "max-potential-fid": { numericValue: 440, displayValue: "440 ms", score: 0.13 },
      "uses-responsive-images": {
        details: { items: [{ wastedBytes: 53000 }, { wastedBytes: 40000 }] },
      },
      "unused-javascript": {
        details: { items: [{ wastedBytes: 94000 }] },
      },
    },
  };
}

test("homepage below budget becomes a bounded performance candidate", () => {
  const finding = homepageLighthouseFinding(report());
  assert.equal(finding.eligible, true);
  assert.equal(finding.reason, "homepage_performance_below_budget");
  assert.equal(finding.scores.performance, 0.71);
  assert.equal(finding.opportunityBytes.responsiveImages, 93000);
});

test("healthy homepage creates no performance task", () => {
  const finding = homepageLighthouseFinding(report({ performance: 0.84 }));
  assert.equal(finding.eligible, false);
  assert.equal(finding.reason, "homepage_performance_within_budget");
});

test("login report and malformed report cannot drive homepage changes", () => {
  assert.equal(homepageLighthouseFinding(report({ url: "http://127.0.0.1:3000/login" })).reason, "not_homepage_report");
  assert.equal(homepageLighthouseFinding({}).eligible, false);
});

test("accessibility SEO or best-practice regression fails closed", () => {
  assert.equal(
    homepageLighthouseFinding(report({ accessibility: 0.9 })).reason,
    "quality_regression_requires_separate_triage",
  );
  assert.equal(
    homepageLighthouseFinding(report({ seo: 0.8 })).reason,
    "quality_regression_requires_separate_triage",
  );
});

test("performance plan is exact-path single-task and never authorizes merge", () => {
  const result = buildPrelaunchPerformancePlan({
    report: report(),
    mainSha: "0123456789abcdef0123456789abcdef01234567",
  });
  assert.equal(result.eligible, true);
  assert.equal(result.plan.maxConcurrentTasks, 1);
  assert.equal(result.plan.maxRevisionAttempts, 2);
  assert.equal(result.plan.noAutomaticMerge, true);
  assert.deepEqual(result.plan.blocks[0].writable_paths, [...PERFORMANCE_WRITABLE_PATHS]);
  assert.equal(result.plan.blocks[0].merge_class, "AUTONOMOUS_SAFE");
  assert.match(result.plan.blocks[0].block_id, /^PRELAUNCH-PERF-0123456789AB$/);
  assert.match(result.plan.blocks[0].prompt, /Preserve current public content/);
  assert.match(result.plan.blocks[0].prompt, /Never merge or deploy/);
});

test("performance plan contains observed metrics instead of generic optimization language", () => {
  const result = buildPrelaunchPerformancePlan({
    report: report(),
    mainSha: "abcdefabcdefabcdefabcdefabcdefabcdefabcd",
  });
  const prompt = result.plan.blocks[0].prompt;
  assert.match(prompt, /0\.71/);
  assert.match(prompt, /4\.1 s/);
  assert.match(prompt, /640 ms/);
  assert.match(prompt, /Responsive-image potential savings: 91 KiB/);
  assert.match(prompt, /Unused-JavaScript potential savings: 92 KiB/);
});


test("Lighthouse budgets distinguish public homepage SEO from deliberate login noindex", () => {
  const matrix = lighthouseConfig.ci.assert.assertMatrix;
  assert.equal(Array.isArray(matrix), true);
  const home = matrix.find((entry) => entry.matchingUrlPattern.includes("3000/?$"));
  const login = matrix.find((entry) => entry.matchingUrlPattern.includes("login"));
  assert.deepEqual(home.assertions["categories:performance"], ["warn", { minScore: 0.8 }]);
  assert.deepEqual(home.assertions["categories:seo"], ["warn", { minScore: 0.95 }]);
  assert.equal(Object.hasOwn(login.assertions, "categories:seo"), false);
});


test("stable performance signal requires three complete homepage runs", () => {
  const result = aggregateHomepageLighthouseFinding([
    report({ performance: 0.71 }),
    report({ performance: 0.86 }),
  ]);
  assert.equal(result.eligible, false);
  assert.equal(result.reason, "insufficient_homepage_runs");
  assert.equal(result.runCount, 2);
  assert.equal(result.requiredRuns, 3);
});

test("median performance ignores a single noisy low outlier", () => {
  const result = aggregateHomepageLighthouseFinding([
    report({ performance: 0.71 }),
    report({ performance: 0.84 }),
    report({ performance: 0.86 }),
  ]);
  assert.equal(result.eligible, false);
  assert.equal(result.reason, "homepage_median_performance_within_budget");
  assert.equal(result.scores.performance, 0.84);
  assert.deepEqual(result.performanceRange, [0.71, 0.86]);
});

test("median performance below budget creates one measured plan", () => {
  const result = buildStablePrelaunchPerformancePlan({
    reports: [
      report({ performance: 0.72 }),
      report({ performance: 0.76 }),
      report({ performance: 0.86 }),
    ],
    mainSha: "abcdefabcdefabcdefabcdefabcdefabcdefabcd",
  });
  assert.equal(result.eligible, true);
  assert.equal(result.runCount, 3);
  assert.equal(result.scores.performance, 0.76);
  assert.deepEqual(result.performanceRange, [0.72, 0.86]);
  assert.match(result.plan.blocks[0].prompt, /Across 3 production-build Lighthouse runs/);
  assert.match(result.plan.blocks[0].prompt, /median homepage performance score is 0\.76/);
  assert.match(result.plan.blocks[0].prompt, /range 0\.72–0\.86/);
});

test("quality regression in any stable run blocks performance optimization", () => {
  const result = aggregateHomepageLighthouseFinding([
    report({ performance: 0.72 }),
    report({ performance: 0.74, accessibility: 0.9 }),
    report({ performance: 0.76 }),
  ]);
  assert.equal(result.eligible, false);
  assert.equal(result.reason, "quality_regression_requires_separate_triage");
  assert.equal(result.scores.accessibility, 0.9);
});

test("dedicated performance profile measures homepage three times without slowing login checks", () => {
  assert.deepEqual(stablePerformanceConfig.ci.collect.url, ["http://127.0.0.1:3000/"]);
  assert.equal(stablePerformanceConfig.ci.collect.numberOfRuns, 3);
  assert.deepEqual(
    stablePerformanceConfig.ci.assert.assertions["categories:performance"],
    ["warn", { minScore: 0.8 }],
  );
});
