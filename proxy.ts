import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const xForwardedProto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host");

  // If in production and the request is made over HTTP, redirect to HTTPS
  if (
    process.env.NODE_ENV === "production" &&
    xForwardedProto === "http" &&
    host
  ) {
    const secureUrl = new URL(request.url);
    secureUrl.protocol = "https:";
    secureUrl.host = host;
    return NextResponse.redirect(secureUrl.toString(), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - shishir.png, CV.pdf (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|shishir.png|CV.pdf).*)",
  ],
};
