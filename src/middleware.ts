import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { postLoginPath } from "@/lib/post-login-path";
import { isHerbalIndexEnabled } from "@/lib/herbal-index-flag";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if ((pathname === "/herbal-index" || pathname.startsWith("/herbal-index/")) && !isHerbalIndexEnabled()) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

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
    if (req.auth?.user?.role !== "admin") {
      return NextResponse.redirect(new URL(postLoginPath(req.auth), req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/:path*", "/herbal-index", "/herbal-index/:path*"],
};
