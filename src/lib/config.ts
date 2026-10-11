// Required at build time. Next inlines NEXT_PUBLIC_* into the browser bundle,
// so a missing value must fail the build instead of calling a previous host.
const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
if (!rawApiBase) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is required. Set it to the backend origin with no trailing slash."
  );
}
export const API_BASE = rawApiBase.replace(/\/$/, "");
