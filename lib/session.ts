/**
 * Session Management Utilities
 * Server-side session handling with NextAuth
 */

import { User } from "@/types";
import { auth } from "@/auth";

export interface SessionData {
  user: User;
  accessToken: string;
  client: string;
  uid: string;
}

/**
 * Get session data from NextAuth
 */
export async function getSession(): Promise<SessionData | null> {
  const nextAuthSession = await auth();

  if (!nextAuthSession?.user) {
    return null;
  }

  // Return the session data in our SessionData format
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

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
