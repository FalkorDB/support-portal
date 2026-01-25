/**
 * NextAuth Configuration
 * Handles Google OAuth and session management
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // When a user signs in with Google, we need to:
      // 1. Check if they exist in Zendesk
      // 2. If not, create them as an end-user
      // 3. Store their Zendesk user ID in the session

      if (account?.provider === "google" && user.email) {
        try {
          // Import dynamically to avoid circular dependencies
          const { findOrCreateZendeskUser } = await import("@/lib/zendesk");
          const zendeskUser = await findOrCreateZendeskUser(
            user.name || user.email,
            user.email,
          );

          // Attach Zendesk user data to the NextAuth user object
          user.id = zendeskUser.id;
          user.role = zendeskUser.role;
          user.type = zendeskUser.type;

          return true;
        } catch (error) {
          console.error("Error creating/finding Zendesk user:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = Number(user.id);
        token.role = user.role;
        token.type = user.type;
      }

      // Store access token if available
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session - using type assertion to work around NextAuth type limitations
      const extendedSession = session as typeof session & {
        user: typeof session.user & {
          id: number;
          role?: string;
          type: string;
        };
        accessToken?: string;
      };

      if (token.id !== undefined) {
        extendedSession.user.id = token.id;
      }
      if (token.role !== undefined) {
        extendedSession.user.role = token.role;
      }
      if (token.type !== undefined) {
        extendedSession.user.type = token.type;
      }

      if (token.accessToken) {
        extendedSession.accessToken = token.accessToken as string;
      }

      return extendedSession;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.AUTH_SECRET || process.env.SESSION_SECRET,
});
