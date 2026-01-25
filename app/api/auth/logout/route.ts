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

    // Use the standard Web Response API (instead of NextResponse.json)
    // to keep this route handler framework-agnostic and consistent with
    // NextAuth which also uses Response.json()
    return Response.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Failed to logout" }, { status: 500 });
  }
}
