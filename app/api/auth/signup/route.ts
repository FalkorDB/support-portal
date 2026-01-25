/**
 * User Signup API Route
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/zendesk';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, passwordConfirmation } = body;

    // Validate input
    if (!name || !email || !password || !passwordConfirmation) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== passwordConfirmation) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Register with Zendesk
    const authResponse = await registerUser(name, email, password);

    // Check if email confirmation is required
    if (authResponse.requiresConfirmation) {
      return NextResponse.json({
        success: true,
        requiresConfirmation: true,
        message: 'Account created! Please check your email to confirm your account.',
        user: authResponse.data,
      });
    }

    if (!authResponse.access_token) {
      return NextResponse.json(
        { error: 'Registration succeeded but no access token received. Please try logging in.' },
        { status: 500 }
      );
    }

    // Set session cookie (only if access token is present)
    await setSession({
      user: authResponse.data,
      accessToken: authResponse.access_token,
      client: email,
      uid: email,
    });

    return NextResponse.json({
      success: true,
      requiresConfirmation: false,
      user: authResponse.data,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
