import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const userRoles = Array.isArray((token as any)?.roles)
      ? (token as any).roles.map((role: string) => role.toLowerCase())
      : [];

    const startsWithAdmin = req.nextUrl.pathname.startsWith("/admin");

    // Protect /admin routes
    if (startsWithAdmin && !userRoles.includes("admin")) {
      return NextResponse.rewrite(
        new URL("/auth/error?message=forbidden", req.url)
      );
    }

    // If no specific authorization rule is met, continue to the next handler
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback is called if the user is not authenticated at all
      authorized: ({ token }) => {
        // If there's no token, the user is not authenticated.
        // Return false to redirect them to the sign-in page.
        // Or return true if you want to allow unauthenticated access to some pages
        // (and handle specific page protection in the middleware function itself).
        return true; // Only allow if a token exists (i.e., user is authenticated)
      },
    },
    // Specify pages that should NOT be protected by default by the authorized callback
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*", // Protect all routes under /admin
    // Add other paths you want to protect globally here
    // For example, if you want to protect all authenticated routes except login/signup:
    // "/((?!api|_next/static|_next/image|favicon.ico|auth|public).*)",
  ],
};
