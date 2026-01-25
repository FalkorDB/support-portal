/**
 * Authentication API Route - Logout
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST() {
  try {
    // Clear session cookie
    await clearSession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
