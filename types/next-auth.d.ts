/**
 * NextAuth Type Extensions
 */

import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      email: string;
      name: string;
      role?: string;
      type: string;
    };
    accessToken?: string;
  }

  interface User {
    id: number;
    email?: string | null;
    name?: string | null;
    role?: string;
    type: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: number;
    role?: string;
    type?: string;
    accessToken?: string;
  }
}
