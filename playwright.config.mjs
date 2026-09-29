import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: "artifacts/playwright",
  use: {
    baseURL: process.env.ALMAGO_BASE_URL || "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "wide-chromium", use: { browserName: "chromium", viewport: { width: 1920, height: 1080 } } },
    { name: "desktop-chromium", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "tablet-landscape-chromium", use: { browserName: "chromium", viewport: { width: 1024, height: 768 } } },
    { name: "tablet-chromium", use: { browserName: "chromium", viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: "mobile-compact-chromium", use: { browserName: "chromium", viewport: { width: 320, height: 720 }, isMobile: true, hasTouch: true } },
    { name: "mobile-375-chromium", use: { browserName: "chromium", viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: "mobile-430-chromium", use: { browserName: "chromium", viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true } },
    { name: "mobile-chromium", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
