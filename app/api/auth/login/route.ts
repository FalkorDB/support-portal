/**
 * Authentication API Route - Login
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/zendesk";
import { setSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Authenticate with Chatwoot
    const authResponse = await authenticateUser(email, password);

    if (!authResponse.access_token) {
      return NextResponse.json(
        { error: "Authentication failed - no access token received" },
        { status: 401 },
      );
    }

    // Set session cookie
    await setSession({
      user: authResponse.data,
      accessToken: authResponse.access_token,
      client: email, // Using email as client identifier
      uid: email,
    });

    return NextResponse.json({
      success: true,
      user: authResponse.data,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 401 },
    );
  }
}
