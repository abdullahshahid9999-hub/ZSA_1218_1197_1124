/** @type {import("next").NextConfig} */

// Supabase project origin the app talks to (REST, Storage, Auth, Realtime).
const SUPABASE_ORIGIN = "https://dvtkcuqwvkakycsseydh.supabase.co";

// Content-Security-Policy.
// NOTE: 'unsafe-inline' is required for styles (the UI is built with inline
// styles + inline <style> blocks) and for Next.js App Router's hydration
// inline scripts. There is no user-controlled HTML rendering in the app
// (no dangerouslySetInnerHTML), so stored-XSS exposure is low. A nonce-based
// script policy is part of the planned server-side refactor.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${SUPABASE_ORIGIN} https://*.supabase.co wss://*.supabase.co`,
  `frame-src 'self' ${SUPABASE_ORIGIN} https://*.supabase.co blob:`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js"
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
