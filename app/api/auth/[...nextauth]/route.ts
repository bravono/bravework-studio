import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { queryDatabase } from "../../../../lib/db";
import type { User as NextAuthUser } from "next-auth"; // Import NextAuth's User type

// Dynamic import for bcryptjs, as it's a server-only module
import { default as bcrypt } from "bcryptjs";

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
    }
  }
}

// Extend JWT token to include user ID
declare module "next-auth" {
  interface JWT {
    id?: string;
  }
}


export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials) {
          return null;
        }

        // 1. Find the user by email in PostgreSQL
        const result = await queryDatabase('SELECT user_id, first_name, last_name, email, password FROM users WHERE email = $1', [credentials.email]);
        const user = result.rows[0];

        if (!user) {
          throw new Error("No user found with that email.");
        }

        // 2. Verify password (use bcryptjs for hashing and comparing)
        const isValid = await bcrypt.compare(credentials.password as string, user.password as string);

        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        // 3. Return user object. NextAuth.js will serialize this into the JWT.
        return {
          id: user.user_id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          // image: user.image, // Include if you have an image column
        };
      },
    }),
    // Add other providers like GoogleProvider, GitHubProvider here if needed
  ],
  session: {
    strategy: "jwt" as const, // Use JWT for stateless sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // This callback is called whenever a JWT is created or updated
    async jwt({ token, user }) {
      if (user) {
        // user object is available on first sign in (when authorize returns a user)
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    // This callback is called whenever a session is checked
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Custom sign-in page path
    error: "/auth/error",   // Custom error page
  },
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);