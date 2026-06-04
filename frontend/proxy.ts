import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseUserCookie } from "@/lib/auth-session";

const MEMBER_PREFIXES = [
  "/explore",
  "/profile",
  "/myskill",
  "/settings",
  "/export",
  "/skill",
  "/assessment",
];

const AUTH_PAGES = ["/signin", "/signup", "/verify-otp", "/forgot-password"];

function isValidToken(token: string | undefined): boolean {
  return Boolean(token && token !== "undefined" && token !== "null");
}

function isMemberRoute(pathname: string) {
  return MEMBER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const user = parseUserCookie(request.cookies.get("user")?.value);
  const { pathname } = request.nextUrl;
  const hasToken = isValidToken(token);

  if (!hasToken && (isMemberRoute(pathname) || pathname.startsWith("/admin"))) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("from", pathname);
    return NextResponse.redirect(signIn);
  }

  if (pathname.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/explore", request.url));
  }

  if (
    hasToken &&
    AUTH_PAGES.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`)
    )
  ) {
    return NextResponse.redirect(
      new URL(user?.role === "admin" ? "/admin" : "/explore", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/explore/:path*",
    "/profile/:path*",
    "/myskill/:path*",
    "/settings/:path*",
    "/export/:path*",
    "/skill/:path*",
    "/assessment/:path*",
    "/admin/:path*",
    "/signin",
    "/signup",
    "/verify-otp",
    "/verify-otp/:path*",
    "/forgot-password",
    "/forgot-password/:path*",
  ],
};
