/**
 * NextAuth Configuration
 * Handles Zendesk OAuth and session management
 */

import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    {
      id: "zendesk",
      name: "Zendesk",
      type: "oauth",
      clientId: process.env.ZENDESK_OAUTH_CLIENT_ID!,
      clientSecret: process.env.ZENDESK_OAUTH_CLIENT_SECRET!,
      authorization: {
        url: `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/oauth/authorizations/new`,
        params: {
          response_type: "code",
          scope: "read write",
          prompt: "login",
        },
      },
      token: `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/oauth/tokens`,
      userinfo: `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/users/me.json`,
      profile(profile: {
        user: {
          id: number;
          name: string;
          email: string;
          photo?: { content_url: string };
          role: string;
        };
      }) {
        return {
          id: profile.user.id,
          name: profile.user.name,
          email: profile.user.email,
          image: profile.user.photo?.content_url || null,
          role: profile.user.role,
          type:
            profile.user.role === "agent" || profile.user.role === "admin"
              ? "agent"
              : "end-user",
        };
      },
    },
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ account }) {
      // With Zendesk OAuth, users are already authenticated with their Zendesk account
      // The profile data from OAuth already contains all user information
      // No need to create users - they already exist in Zendesk

      if (account?.provider === "zendesk") {
        return true;
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

      if (token.id != null) {
        extendedUser.id = token.id as number;
      }
      if (token.role != null) {
        extendedUser.role = token.role as string;
      }
      if (token.type != null) {
        extendedUser.type = token.type as string;
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
