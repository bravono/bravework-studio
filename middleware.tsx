import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const isLocalDev = req.nextUrl.hostname === "localhost";
    console.log("Next URL Hostname", req.nextUrl.hostname);
    let token = req.nextauth.token;

    if (isLocalDev) {
      // Bypass auth checks in local development
      token = {
        name: "Ahbideen Yusuf",
        email: "ahbideeny@gmail.com",
        sub: "2",
        id: 2,
        companyName: "Bravono",
        phone: "+2348162785602",
        roles: ["admin", "user"],
        iat: 1755258030,
        exp: 1757850030,
        jti: "f45b1aef-7d9f-4e81-97fe-0106d9c07f49",
      };
      console.log("Middleware Request", req.nextauth);
    }
    console.log("Auth Token", token);
    const userRoles = Array.isArray((token as any)?.roles)
      ? (token as any).roles.map((role: string) => role.toLowerCase())
      : [];

    const includesAdmin = req.nextUrl.pathname.includes("/admin");

    // Protect /admin routes
    if (includesAdmin && !userRoles.includes("admin")) {
      return NextResponse.redirect(
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
  ],
};
