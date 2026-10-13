/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

const { PHASE_PRODUCTION_BUILD } = require("next/constants");

// Netlify builds inline NEXT_PUBLIC_API_BASE_URL into the browser bundle, so an
// http/localhost value there would silently break every API call. Next 15 no
// longer fails the build when src/lib/config.ts throws during static
// generation, so the same check runs here, in the main build process. It is
// limited to the production-build phase on Netlify so it can never affect a
// running site or local builds.
function assertNetlifyApiBase() {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be a valid absolute URL for Netlify builds.");
  }
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" || isLocal) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must be an https:// backend origin (not localhost) for Netlify builds."
    );
  }
}

module.exports = (phase) => {
  if (phase === PHASE_PRODUCTION_BUILD && process.env.NETLIFY === "true") {
    assertNetlifyApiBase();
  }
  return nextConfig;
};
