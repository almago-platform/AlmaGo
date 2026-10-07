import type { NextConfig } from "next";

function supabaseConnectSources() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];

  try {
    const url = new URL(raw);
    const websocket = new URL(url.origin);
    websocket.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return [url.origin, websocket.origin];
  } catch {
    return [];
  }
}

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.pexels.com https://images.unsplash.com",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseConnectSources().join(" ")}`.trim(),
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "report-uri /api/security/csp-report",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicyReportOnly },
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
