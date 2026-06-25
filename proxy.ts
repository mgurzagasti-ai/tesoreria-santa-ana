import { NextResponse, type NextRequest } from "next/server";

const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "tesoreria_session";
const protectedPaths = ["/dashboard", "/empleados", "/movimientos", "/saldos", "/haberes"];

export function proxy(request: NextRequest) {
  const session = request.cookies.get(sessionCookieName)?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const target = session ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (protectedPaths.some((path) => pathname.startsWith(path)) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/empleados/:path*",
    "/movimientos/:path*",
    "/saldos/:path*",
    "/haberes/:path*",
  ],
};
