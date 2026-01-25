/**
 * Session Management Utilities
 * Server-side session handling with secure cookies
 * Supports both legacy cookie sessions and NextAuth sessions
 */

import { cookies } from "next/headers";
import { User } from "@/types";
import { auth } from "@/auth";

const SESSION_COOKIE_NAME = "support_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  user: User;
  accessToken: string;
  client: string;
  uid: string;
}

/**
 * Set session cookie with user data (for legacy authentication)
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
 * Get session data from cookie or NextAuth
 * Checks both NextAuth session and legacy cookie session
 */
export async function getSession(): Promise<SessionData | null> {
  // First, check for NextAuth session
  const nextAuthSession = await auth();
  
  if (nextAuthSession?.user) {
    // Convert NextAuth session to our SessionData format
    // Note: For OAuth users, we use a placeholder token since they don't need
    // direct Zendesk API access - all API calls go through our backend
    return {
      user: {
        id: nextAuthSession.user.id,
        email: nextAuthSession.user.email || "",
        name: nextAuthSession.user.name || "",
        role: nextAuthSession.user.role,
        type: nextAuthSession.user.type,
      },
      accessToken: nextAuthSession.accessToken || "oauth_user_token",
      client: nextAuthSession.user.email || "",
      uid: nextAuthSession.user.email || "",
    };
  }

  // Fall back to legacy cookie session
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
 * Clear session cookie (for legacy authentication)
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if user is authenticated
 * Checks both NextAuth session and legacy cookie session
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
