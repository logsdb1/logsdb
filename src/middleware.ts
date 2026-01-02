import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Set to true to enable maintenance mode
const MAINTENANCE_MODE = false;

// Paths that should still be accessible during maintenance
const ALLOWED_PATHS = [
  "/maintenance",
  "/_next",
  "/favicon.ico",
  "/icon.svg",
  "/api",
];

// Simple in-memory store for rate limiting (Edge Runtime compatible)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries periodically
let lastCleanup = Date.now();
function cleanupRateLimitStore() {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // Only cleanup every minute
  lastCleanup = now;
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => rateLimitStore.delete(key));
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(
  key: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupRateLimitStore();
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const method = request.method;

  // Skip middleware for log file downloads (GET requests to /api/logs-upload/filename)
  if (pathname.startsWith("/api/logs-upload/") && method === "GET" && pathname !== "/api/logs-upload/") {
    return NextResponse.next();
  }

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    let config = { windowMs: 60000, maxRequests: 100 }; // Default: 100/min

    // Stricter limits for specific endpoints
    if (pathname.startsWith("/api/logs-upload") && method === "POST") {
      config = { windowMs: 3600000, maxRequests: 10 }; // 10/hour for anonymous uploads
    } else if (pathname.startsWith("/api/contribute")) {
      config = { windowMs: 3600000, maxRequests: 20 }; // 20/hour for contributions
    } else if (pathname.startsWith("/api/auth")) {
      config = { windowMs: 900000, maxRequests: 10 }; // 10/15min for auth
    } else if (pathname.startsWith("/api/upload") && method === "POST") {
      config = { windowMs: 3600000, maxRequests: 50 }; // 50/hour for authenticated uploads
    } else if (pathname.includes("/search")) {
      config = { windowMs: 60000, maxRequests: 30 }; // 30/min for search
    }

    const rateKey = `${ip}:${pathname.split("/").slice(0, 4).join("/")}:${method}`;
    const { allowed, remaining, resetAt } = checkRateLimit(
      rateKey,
      config.windowMs,
      config.maxRequests
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(remaining));

    // Maintenance mode check for non-API routes happens below
    if (!MAINTENANCE_MODE) {
      return response;
    }
  }

  // Maintenance mode handling
  if (MAINTENANCE_MODE) {
    if (!ALLOWED_PATHS.some((path) => pathname.startsWith(path))) {
      const maintenanceUrl = new URL("/maintenance", request.url);
      return NextResponse.rewrite(maintenanceUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
