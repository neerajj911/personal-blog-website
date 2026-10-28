import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminGithubId } from "@/lib/admin/allowlist";

/**
 * Optimistic gate for /admin: sends visitors without an admin session to the login page and
 * keeps admin responses out of caches and search indexes. It is NOT the security boundary.
 * Server actions arrive as POSTs to the page they live on, and a refactor can move them out of
 * this matcher, so every page and action calls requireAdmin() itself.
 */
export default auth((request) => {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  const isAdmin = isAdminGithubId(request.auth?.githubId);

  const response =
    isAdmin || isLogin
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login", request.nextUrl));

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
});

export const config = { matcher: ["/admin/:path*"] };
