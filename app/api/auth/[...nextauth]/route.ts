import NextAuth from "next-auth";
import {authOptions} from "../../../../lib/auth-options"; 



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
      name?: string | null;
      email: string;
      image?: string | null;
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


// Additionally, for server-side `auth` utility (e.g., in layout.tsx)
// and client-side `signIn`, `signOut` (e.g., in components)
// the recommended approach in NextAuth.js v5 (Auth.js) is to import them
// directly from `next-auth` or `next-auth/react`.

// So, ensure your app/layout.tsx (and other server components) use:
// import { auth } from "next-auth";

// And your client components use:
// import { signIn, signOut } from "next-auth/react";
// import { useSession } from "next-auth/react";
