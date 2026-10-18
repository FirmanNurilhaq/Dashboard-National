import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Abaikan static files, Next.js internals, favicon, dan API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("telecom_auth");

  // Jika belum login dan mencoba mengakses halaman dashboard, arahkan langsung ke /login
  if (pathname !== "/login" && (!authCookie || authCookie.value !== "1")) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mengakses /login, arahkan langsung ke dashboard /
  if (pathname === "/login" && authCookie && authCookie.value === "1") {
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
