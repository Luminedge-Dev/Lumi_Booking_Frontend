import { signOut } from "next-auth/react";
import Cookies from 'js-cookie';

export const logout = async () => {
  // Clear everything from local storage
  localStorage.clear();

  // Clear cookies using js-cookie
  Cookies.remove('accessToken');

  // Stay on whatever host is serving this deployment.
  await signOut({ callbackUrl: "/login" });
};
