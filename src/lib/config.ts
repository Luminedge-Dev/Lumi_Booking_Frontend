// Required at build time. Next inlines NEXT_PUBLIC_* into the browser bundle,
// so a missing value must fail the build instead of calling a previous host.
const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
if (!rawApiBase) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is required. Set it to the backend origin with no trailing slash."
  );
}
export const API_BASE = rawApiBase.replace(/\/$/, "");

// Netlify builds ship this value to the browser, so a localhost or plain-http
// origin there would silently break every API call. Local production builds
// (NETLIFY unset) are left alone so `npm run build` still works against a
// local backend.
if (process.env.NETLIFY === "true") {
  let parsed: URL;
  try {
    parsed = new URL(API_BASE);
  } catch {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be a valid absolute URL.");
  }
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" || isLocal) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must be an https:// backend origin (not localhost) for Netlify builds."
    );
  }
}
