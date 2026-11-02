// A recording stand-in for `next-auth/react`.
//
// The logout helper is only allowed to reach NextAuth when a real OAuth session
// cookie exists, and it must never allow NextAuth to perform the navigation.
// The test installs `globalThis.__nextAuthStub` to observe calls.
export const signOut = async (options) => {
  const state = (globalThis.__nextAuthStub ??= { signOutCalls: [] });
  state.signOutCalls.push(options);
  return { url: "stubbed" };
};

export const signIn = async () => {
  throw new Error("logout must never call NextAuth signIn");
};

export const useSession = () => {
  throw new Error("logout must never mount a NextAuth session hook");
};
