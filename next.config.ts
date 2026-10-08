import { execFileSync } from "node:child_process";
import type { NextConfig } from "next";

// Embed the exact checked-out Git revision in the build. Works on VPS and CI,
// including when the deployment checkout has a detached HEAD.
function gitBuildValue(...args: string[]): string {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      timeout: 2000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const gitCommit = gitBuildValue("rev-parse", "--verify", "HEAD");
const gitBranch = gitBuildValue("symbolic-ref", "--quiet", "--short", "HEAD");


const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const orientationFreshnessHeaders = [
  { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0" },
  { key: "Surrogate-Control", value: "no-store" },
  { key: "Pragma", value: "no-cache" },
  { key: "Expires", value: "0" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Public, non-sensitive build provenance; the release gate fails closed if absent.
  env: {
    ALMAGO_BUILD_COMMIT: /^[0-9a-f]{40}$/.test(gitCommit) ? gitCommit : "",
    ALMAGO_BUILD_BRANCH: gitBranch,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/orientation",
        headers: orientationFreshnessHeaders,
      },
      {
        source: "/orientation/:path*",
        headers: orientationFreshnessHeaders,
      },
    ];
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;
