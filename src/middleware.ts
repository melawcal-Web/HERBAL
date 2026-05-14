import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const url = new URL("/auth/signin", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const url = new URL("/auth/signin", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*"],
};
