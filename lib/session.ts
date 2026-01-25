/**
 * Session Management Utilities
 * Server-side session handling with secure cookies
 */

import { cookies } from "next/headers";
import { User } from "@/types";

const SESSION_COOKIE_NAME = "support_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  user: User;
  accessToken: string;
  client: string;
  uid: string;
}

/**
 * Set session cookie with user data
 */
export async function setSession(sessionData: SessionData) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

/**
 * Get session data from cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Clear session cookie
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
