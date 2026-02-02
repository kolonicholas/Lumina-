import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRoutes = {
  "/admin": "ADMIN",
  "/instructor": "INSTRUCTOR",
  "/student": "STUDENT",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get("role")?.value;

  for (const [prefix, role] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(prefix)) {
      if (!roleCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (roleCookie !== role) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*", "/student/:path*"],
};
