import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// Explicitly set the runtime for this Route Handler to Node.js
// This ensures that Node.js-specific modules like 'pg' can be used.
export const runtime = "nodejs";

// Extend NextAuth's User type to include 'id'
declare module "next-auth" {
  interface User {
    id: number; // Ensure the ID is a number, matching your PG serial type
    name?: string | null;
    email: string;
    image?: string | null;
  }
  interface Session {
    user: {
      id: number; // Add id to session.user
      name?: string;
      email: string;
      roles?: string[]; // Optional role field
      companyName?: string; // Optional company name field
      phone?: string;
    };
  }
}

// Extend JWT token to include user ID
// Note: If 'id' in User is number, 'id' in JWT should typically also be number or a string if converted
declare module "next-auth" {
  interface JWT {
    id?: number;
  }
}

// Get the handler object returned by NextAuth
const handler = NextAuth(authOptions);

// Export the GET and POST methods from the handler for the App Router
export { handler as GET, handler as POST };


