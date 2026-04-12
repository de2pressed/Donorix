import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes = ["/profile", "/notifications", "/settings", "/posts/new"];
const adminPrefixes = ["/admin"];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !request.cookies.get("sb-access-token")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (adminPrefixes.some((prefix) => pathname.startsWith(prefix)) && !request.cookies.get("sb-access-token")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
