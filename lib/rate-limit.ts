/**
 * Rate Limiting Middleware
 * Simple in-memory rate limiter for API routes
 */

type RateLimitStore = {
  count: number;
  resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitStore>();

// Track last cleanup time for lazy cleanup
let lastCleanupTime = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Lazy cleanup of expired entries
 * Only runs if CLEANUP_INTERVAL has passed since last cleanup
 */
function cleanupExpiredEntries(now: number): void {
  if (now - lastCleanupTime < CLEANUP_INTERVAL) {
    return; // Skip if we cleaned up recently
  }

  lastCleanupTime = now;
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Check if a request should be rate limited
 * Returns null if allowed, or remaining time in ms if limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  scope: string = "default",
): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();

  // Perform lazy cleanup of expired entries
  cleanupExpiredEntries(now);

  const key = `ratelimit:${scope}:${identifier}`;
  const limit = rateLimitMap.get(key);

  if (!limit || limit.resetTime < now) {
    // First request or expired window - reset
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true };
  }

  if (limit.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remainingTime: limit.resetTime - now,
    };
  }

  // Increment count
  limit.count++;
  return { allowed: true };
}

/**
 * Get rate limit identifier from request
 * Uses IP address or user ID
 */
export function getRateLimitIdentifier(
  request: Request,
  userId?: number,
): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] ?? realIp ?? "unknown";

  return `ip:${ip}`;
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  // Ticket creation - moderate limits
  createTicket: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 tickets per minute
  },
  // Message sending - moderate limits
  sendMessage: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 messages per minute
  },
  // General API - generous limits
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
} as const;
