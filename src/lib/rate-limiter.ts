/**
 * In-memory rate limiter for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Clean up expired entries every minute
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.store.forEach((entry, key) => {
      if (entry.resetAt < now) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.store.delete(key));
  }

  check(
    key: string,
    config: RateLimiterConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt < now) {
      // New window
      const newEntry = {
        count: 1,
        resetAt: now + config.windowMs,
      };
      this.store.set(key, newEntry);
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: newEntry.resetAt,
      };
    }

    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

// Singleton instance
export const rateLimiter = new InMemoryRateLimiter();

// Preset configurations for different endpoints
export const RATE_LIMITS = {
  // Anonymous log uploads: 10 per hour per IP
  logsUpload: { windowMs: 60 * 60 * 1000, maxRequests: 10 },

  // Authenticated uploads: 50 per hour
  authenticatedUpload: { windowMs: 60 * 60 * 1000, maxRequests: 50 },

  // Contribute endpoints: 20 per hour
  contribute: { windowMs: 60 * 60 * 1000, maxRequests: 20 },

  // API general: 100 per minute
  api: { windowMs: 60 * 1000, maxRequests: 100 },

  // Auth attempts: 10 per 15 minutes
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },

  // Search: 30 per minute
  search: { windowMs: 60 * 1000, maxRequests: 30 },
};

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * Create rate limit response with appropriate headers
 */
export function createRateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
