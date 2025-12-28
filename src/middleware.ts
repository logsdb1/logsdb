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

export function middleware(request: NextRequest) {
  if (!MAINTENANCE_MODE) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow certain paths
  if (ALLOWED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Redirect all other paths to maintenance page
  const maintenanceUrl = new URL("/maintenance", request.url);
  return NextResponse.rewrite(maintenanceUrl);
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
