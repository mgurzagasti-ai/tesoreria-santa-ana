import { NextResponse, type NextRequest } from "next/server";

const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "tesoreria_session";
const protectedPaths = ["/dashboard", "/empleados", "/movimientos", "/saldos", "/haberes", "/conceptos"];

export function proxy(request: NextRequest) {
  const session = request.cookies.get(sessionCookieName)?.value;
  const { pathname } = request.nextUrl;

  if (protectedPaths.some((path) => pathname.startsWith(path)) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/empleados/:path*",
    "/movimientos/:path*",
    "/saldos/:path*",
    "/haberes/:path*",
    "/conceptos/:path*",
  ],
};
