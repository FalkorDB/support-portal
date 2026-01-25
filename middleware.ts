/**
 * Middleware for route protection
 * Protects authenticated routes and redirects to login if not authenticated
 * Supports both NextAuth sessions and legacy cookie-based sessions
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/cases"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Check for NextAuth session
  const nextAuthSession = req.auth;
  
  // Check for legacy session cookie
  const sessionCookie = req.cookies.get("support_session");
  
  // User is authenticated if either session exists
  const isAuthenticated = !!(nextAuthSession || sessionCookie?.value);

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if trying to access auth route while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
