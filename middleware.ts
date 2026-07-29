import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const authRoutes = [
    "/login",
    "/forgot-password",
    "/otp-verification",
    "/reset-password",
  ];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/chat-assets") ||
    pathname.startsWith("/chat-management") ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/events-requests") ||
    pathname.startsWith("/governing-bodies") ||
    pathname.startsWith("/professions") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/therapists");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/forgot-password",
    "/otp-verification",
    "/reset-password",
    "/chat-assets/:path*",
    "/chat-management/:path*",
    "/events/:path*",
    "/events-requests/:path*",
    "/governing-bodies/:path*",
    "/professions/:path*",
    "/profile/:path*",
    "/reports/:path*",
    "/therapists/:path*",
  ],
};
