// Shared logout for the custom backend-JWT session used by every active
// sidebar (student, admin, teacher, BDM).
//
// The redirect target is deliberately a same-origin *relative* path so it
// resolves against whichever host serves the frontend (localhost:3000,
// staging, production) and can never resolve against the backend API origin.
//
// Previously this helper finished with NextAuth's
// `signOut({ callbackUrl: "/login" })`. That is a different session system from
// the custom JWT login (`POST /api/v1/login` + `accessToken`), and NextAuth
// resolves its callback against `NEXTAUTH_URL` — configured to the API origin —
// which dropped the user on `<backend>/login` ("Not found").
import { clearAuth } from "@/app/helpers/jwt";

// Single, origin-independent destination for every role.
export const LOGIN_PATH = "/login";

// NextAuth v4 session cookies (`__Secure-` prefix when served over HTTPS).
// The custom JWT flow never writes these; they only exist for an OAuth session.
const NEXTAUTH_SESSION_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// True only when a real NextAuth/OAuth session cookie is present. Used so a
// JWT-only user never triggers a NextAuth round-trip.
const hasNextAuthSession = (): boolean => {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((part) => part.split("=")[0].trim())
    .some((name) => NEXTAUTH_SESSION_COOKIES.includes(name));
};

export const logout = async (): Promise<void> => {
  // Nothing to clear (and no navigation to perform) outside the browser.
  if (typeof window === "undefined") return;

  // 1. Remove the backend JWT from both stores the app reads: localStorage for
  //    the client helpers, the `accessToken` cookie for the edge middleware.
  clearAuth();

  // 2. Preserve the previous behaviour of wiping the remaining client state
  //    (adminName/adminEmail caches, cached TRF drafts in sessionStorage) so a
  //    shared device leaves no residue behind. Storage can be unavailable in
  //    private mode; the token is already gone at this point either way.
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    /* ignore unavailable storage */
  }

  // 3. End a genuine OAuth session, but only when one exists. `redirect: false`
  //    stops NextAuth from navigating to its own NEXTAUTH_URL-based callback
  //    and stranding the user on the wrong origin.
  if (hasNextAuthSession()) {
    try {
      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: false });
    } catch {
      // A failed OAuth teardown must not trap the user inside the app; the
      // JWT session is already cleared and the redirect below still runs.
    }
  }

  // 4. Same-origin navigation to the frontend login page.
  window.location.replace(LOGIN_PATH);
};
