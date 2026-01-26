/**
 * NextAuth Configuration
 * Handles Google OAuth and session management
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
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

          // Store Zendesk user data by mutating the user object
          // NextAuth will pass this to the JWT callback
          Object.assign(user, {
            id: zendeskUser.id,
            role: zendeskUser.role,
            type: zendeskUser.type,
          });

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
        // Safely convert user.id to number with validation
        const userId =
          typeof user.id === "number" ? user.id : parseInt(String(user.id), 10);
        if (isNaN(userId)) {
          console.error("Invalid user ID:", user.id);
          throw new Error("Invalid user ID in JWT callback");
        }

        token.id = userId;
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
      // Add custom fields to session
      // Create a properly typed extended user object to avoid repetitive type assertions
      const extendedUser = session.user as {
        id?: number;
        role?: string;
        type?: string;
      };

      if (token.id !== undefined) {
        extendedUser.id = token.id;
      }
      if (token.role !== undefined) {
        extendedUser.role = token.role;
      }
      if (token.type !== undefined) {
        extendedUser.type = token.type;
      }

      if (token.accessToken) {
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.AUTH_SECRET || process.env.SESSION_SECRET,
});
