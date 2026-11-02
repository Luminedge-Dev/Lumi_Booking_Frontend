// Logout redirect regression suite.
//
// These are behaviour tests: the real `src/app/utils/actions/logout.ts` is
// loaded (Node's built-in TypeScript type stripping) with the `@/` alias
// resolved by tests/support/logout-loader.mjs, `next-auth/react` swapped for a
// recording stub, and a minimal in-memory browser (location, localStorage,
// sessionStorage, document.cookie) standing in for the page. Nothing here
// asserts on copy-pasted source text unless the behaviour genuinely lives in a
// React component that cannot be mounted in this harness (T06, T11, T12).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

// Assertions about what the code *does* must not trip over prose: drop comments
// (including JSX `{/* ... */}` blocks) before matching.
const codeOnly = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const FRONTEND_ORIGIN = "http://localhost:3000";
const BACKEND_ORIGIN = "http://localhost:5000";
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.synthetic-payload.synthetic-signature";

// ---------------------------------------------------------------- browser double
const createStorage = (seed = {}) => {
  const map = new Map(Object.entries(seed));
  const calls = [];
  return {
    calls,
    has: (key) => map.has(key),
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      calls.push(["setItem", key]);
      map.set(key, String(value));
    },
    removeItem: (key) => {
      calls.push(["removeItem", key]);
      map.delete(key);
    },
    clear: () => {
      calls.push(["clear"]);
      map.clear();
    },
    keys: () => [...map.keys()],
  };
};

const createCookieJar = () => {
  const jar = new Map();

  const load = (header) => {
    jar.clear();
    for (const pair of String(header).split(";")) {
      const trimmed = pair.trim();
      if (!trimmed) continue;
      const [name, ...rest] = trimmed.split("=");
      jar.set(name.trim(), rest.join("="));
    }
  };

  return {
    load,
    read: (name) => jar.get(name),
    names: () => [...jar.keys()],
    serialize: () => [...jar].map(([name, value]) => `${name}=${value}`).join("; "),
    // Mirrors a browser writing a Set-Cookie style string: an empty value or an
    // expiry in the past deletes the entry.
    write: (raw) => {
      const [pair, ...attributes] = String(raw).split(";");
      const [name, ...rest] = pair.split("=");
      const value = rest.join("=");
      const expired = attributes.some((attribute) => {
        const [attributeName, attributeValue] = attribute.split("=");
        if (attributeName.trim().toLowerCase() !== "expires") return false;
        const when = Date.parse(attributeValue);
        return Number.isFinite(when) && when <= Date.now();
      });
      if (!value || expired) jar.delete(name.trim());
      else jar.set(name.trim(), value);
    },
  };
};

const navigations = [];
const jar = createCookieJar();
const locationDouble = {
  _href: `${FRONTEND_ORIGIN}/dashboard`,
  get href() {
    return this._href;
  },
  set href(value) {
    this._href = String(value);
    navigations.push(String(value));
  },
  get origin() {
    return FRONTEND_ORIGIN;
  },
  get pathname() {
    return new URL(this._href).pathname;
  },
  replace(value) {
    navigations.push(String(value));
  },
  assign(value) {
    navigations.push(String(value));
  },
};

globalThis.document = {
  get cookie() {
    return jar.serialize();
  },
  set cookie(value) {
    jar.write(value);
  },
};
globalThis.window = { location: locationDouble };
globalThis.localStorage = createStorage();
globalThis.sessionStorage = createStorage();

const resetBrowser = ({ cookies = "", storage = {}, session = {} } = {}) => {
  navigations.length = 0;
  jar.load(cookies);
  for (const store of [globalThis.localStorage, globalThis.sessionStorage]) {
    store.calls.length = 0;
    store.clear();
    store.calls.length = 0;
  }
  for (const [key, value] of Object.entries(storage)) globalThis.localStorage.setItem(key, value);
  for (const [key, value] of Object.entries(session)) globalThis.sessionStorage.setItem(key, value);
  globalThis.localStorage.calls.length = 0;
  globalThis.sessionStorage.calls.length = 0;
  globalThis.__nextAuthStub = { signOutCalls: [] };
  locationDouble._href = `${FRONTEND_ORIGIN}/dashboard`;
  return {
    navigations,
    jar,
    storage: globalThis.localStorage,
    session: globalThis.sessionStorage,
    nextAuth: globalThis.__nextAuthStub,
  };
};

// Load the production module under test.
register(new URL("./support/logout-loader.mjs", import.meta.url).href);
const { logout, LOGIN_PATH } = await import(
  pathToFileURL(path.join(root, "src/app/utils/actions/logout.ts")).href
);

const activeSidebars = [
  "src/components/shared/Sidebar.tsx",
  "src/components/shared/SidebarAdmin.tsx",
  "src/components/shared/SidebarTeacher.tsx",
  "src/components/shared/SidebarBDM.tsx",
];

// ------------------------------------------------------------------------ tests
test("T01 — logout clears the backend JWT from localStorage", async () => {
  const env = resetBrowser({
    storage: { accessToken: TOKEN, adminName: "Synthetic Admin" },
  });

  await logout();

  assert.equal(env.storage.has("accessToken"), false, "accessToken still present");
  assert.ok(
    env.storage.calls.some(([method, key]) => method === "removeItem" && key === "accessToken"),
    "logout did not remove accessToken through the shared auth cleanup"
  );
});

test("T02 — logout removes the accessToken cookie and leaves unrelated cookies alone", async () => {
  const env = resetBrowser({
    cookies: `accessToken=${TOKEN}; theme=dark`,
  });

  await logout();

  assert.equal(env.jar.read("accessToken"), undefined, "accessToken cookie survived logout");
  assert.equal(env.jar.read("theme"), "dark", "unrelated cookie was cleared");
});

test("T03 — logout navigates to /login on the frontend origin", async () => {
  const env = resetBrowser({ cookies: `accessToken=${TOKEN}` });

  await logout();

  assert.deepEqual(env.navigations, ["/login"]);
  assert.equal(new URL(env.navigations[0], FRONTEND_ORIGIN).href, `${FRONTEND_ORIGIN}/login`);
});

test("T04 — logout never navigates to the backend API origin", async () => {
  const env = resetBrowser({ cookies: `accessToken=${TOKEN}` });

  await logout();

  assert.equal(env.navigations.length, 1);
  const target = env.navigations[0];
  assert.ok(!target.startsWith(BACKEND_ORIGIN), `redirect used the backend origin: ${target}`);
  assert.ok(!target.includes(":5000"), `redirect points at the backend port: ${target}`);
  assert.ok(target.startsWith("/") && !target.startsWith("//"), `not a same-origin path: ${target}`);
});

test("T05 — a JWT-only logout never touches NextAuth", async () => {
  const env = resetBrowser({ cookies: `accessToken=${TOKEN}` });

  await logout();

  assert.deepEqual(env.nextAuth.signOutCalls, [], "NextAuth signOut was called without an OAuth session");
  assert.deepEqual(env.navigations, ["/login"]);
});

test("T06 — every active role sidebar uses the shared logout helper", () => {
  for (const file of activeSidebars) {
    const component = source(file);
    assert.match(
      component,
      /import\s*\{\s*logout\s*\}\s*from\s*["']@\/app\/utils\/actions\/logout["']/,
      `${file} does not import the shared logout helper`
    );
    assert.match(component, /logout\(\)/, `${file} never calls logout()`);
    assert.doesNotMatch(
      component,
      /next-auth\/react/,
      `${file} imports NextAuth directly instead of the shared helper`
    );
    assert.doesNotMatch(component, /\bsignOut\s*\(/, `${file} calls NextAuth signOut directly`);
  }
});

test("T07 — logout preserves the existing client-state cleanup", async () => {
  const env = resetBrowser({
    storage: { accessToken: TOKEN, adminName: "Synthetic Admin", adminEmail: "admin@example.test" },
    session: { "trf-cache:synthetic": "draft" },
  });

  await logout();

  assert.deepEqual(env.storage.keys(), [], "localStorage still holds session state");
  assert.deepEqual(env.session.keys(), [], "sessionStorage still holds session state");
});

test("T08 — logout performs no backend logout request", async () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("logout must not perform network calls");
  };
  try {
    resetBrowser({ cookies: `accessToken=${TOKEN}` });
    await logout();
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(fetchCalls, 0, "logout issued a network request");
  const implementation = codeOnly(source("src/app/utils/actions/logout.ts"));
  assert.doesNotMatch(implementation, /\bfetch\s*\(|axios|API_BASE|api\/v1/, "logout contains a backend call");
});

test("T09 — an active OAuth session is really terminated, without NextAuth navigating", async () => {
  const env = resetBrowser({
    cookies: `accessToken=${TOKEN}; next-auth.session-token=oauth-session`,
  });

  await logout();

  assert.equal(env.nextAuth.signOutCalls.length, 1, "OAuth session was left active");
  assert.deepEqual(
    env.nextAuth.signOutCalls[0],
    { redirect: false },
    "NextAuth was allowed to perform the navigation"
  );
  assert.deepEqual(env.navigations, ["/login"], "navigation must stay same-origin and singular");
});

test("T10 — the redirect works without hardcoded development or production hosts", async () => {
  const env = resetBrowser({ cookies: `accessToken=${TOKEN}` });

  await logout();

  assert.deepEqual(env.navigations, ["/login"]);
  assert.equal(LOGIN_PATH, "/login");
  const implementation = codeOnly(source("src/app/utils/actions/logout.ts"));
  assert.doesNotMatch(
    implementation,
    /localhost|127\.0\.0\.1|:3000|:5000|https?:\/\//,
    "logout hardcodes a host or origin"
  );
  assert.doesNotMatch(implementation, /NEXTAUTH_URL|NEXT_PUBLIC_API_BASE_URL/, "logout reads an origin from config");
});

test("T11 — a logged-out browser has no token left for the route guards to accept", async () => {
  const env = resetBrowser({ cookies: `accessToken=${TOKEN}`, storage: { accessToken: TOKEN } });

  await logout();

  assert.equal(env.jar.read("accessToken"), undefined);
  assert.equal(env.storage.has("accessToken"), false);

  // The guards that consume those two stores must deny access without them.
  const middleware = source("src/middleware.ts");
  assert.match(middleware, /req\.cookies\.get\("accessToken"\)/);
  assert.match(middleware, /PROTECTED_ROUTES\s*=\s*\[[^\]]*"\/dashboard"/);
  assert.match(middleware, /if \(!payload && isProtectedRoute\) \{\s*return redirect\("\/login"\)/);

  const guard = source("src/components/AuthGuard.tsx");
  assert.match(guard, /if \(!isLoggedIn\(\)\) \{\s*router\.push\("\/login"\)/);
});

test("T12 — login and valid-session behaviour are unchanged", () => {
  const loginPage = source("src/app/login/page.tsx");
  assert.match(loginPage, /localStorage\.setItem\("accessToken", response\.accessToken\)/);
  assert.match(loginPage, /Cookies\.set\("accessToken", response\.accessToken/);
  assert.match(loginPage, /const response = await loginUser\(data\)/);

  const loginAction = source("src/app/utils/actions/loginUser.ts");
  assert.match(loginAction, /\$\{API_BASE\}\/api\/v1\/login/);

  // Google sign-in is still commented out, so NextAuth remains an unreachable
  // login path: no active signIn import and no live signIn() invocation.
  const loginCode = codeOnly(loginPage);
  assert.doesNotMatch(
    loginCode,
    /import\s*\{[^}]*\bsignIn\b[^}]*\}\s*from\s*["']next-auth\/react["']/,
    "the login page imports NextAuth signIn"
  );
  assert.doesNotMatch(
    loginCode,
    /onClick=\{\(\)\s*=>\s*signIn\(/,
    "the login page has an active NextAuth signIn handler"
  );
  assert.match(loginPage, /signIn\("google", \{ callbackUrl: "\/dashboard" \}\)/);
});

test("T13 — logout is safe when there is no browser window (SSR / prerender)", async () => {
  resetBrowser({ cookies: `accessToken=${TOKEN}` });
  const savedWindow = globalThis.window;
  try {
    delete globalThis.window;
    await assert.doesNotReject(() => logout());
  } finally {
    globalThis.window = savedWindow;
  }
  assert.deepEqual(navigations, [], "SSR logout attempted a navigation");
});

test("T14 — there is one shared logout implementation and no reachable duplicate", () => {
  const files = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
  };
  walk(path.join(root, "src"));

  // Only the shared helper navigates to the frontend login page.
  const navigators = files.filter((file) =>
    /window\.location\.(replace|assign)\(\s*(?:["']\/login["']|LOGIN_PATH)\s*\)/.test(
      fs.readFileSync(file, "utf8")
    )
  );
  assert.deepEqual(
    navigators.map((file) => path.relative(root, file).replace(/\\/g, "/")),
    ["src/app/utils/actions/logout.ts"]
  );

  // Navbar.tsx carries a legacy NextAuth-only handler (`signOut` to "/"). It is
  // audited as unreachable: nothing imports it, so it cannot be a second logout
  // path. If it is ever wired up, this fails and it must use the shared helper.
  const importers = files.filter((file) =>
    /from\s+["'][^"']*components\/shared\/Navbar["']/.test(fs.readFileSync(file, "utf8"))
  );
  assert.deepEqual(importers, [], "the legacy NextAuth-only Navbar became reachable");
});
