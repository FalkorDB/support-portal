/**
 * Authentication API Route - Logout
 * POST /api/auth/logout
 */

import { signOut } from "@/auth";
import { clearSession } from "@/lib/session";

export async function POST() {
  try {
    // Clear NextAuth session
    await signOut({ redirect: false });

    // Also clear legacy session cookie if it exists
    await clearSession();

    return Response.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Failed to logout" }, { status: 500 });
  }
}
