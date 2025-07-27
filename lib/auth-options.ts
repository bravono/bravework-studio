import CredentialsProvider from "next-auth/providers/credentials";
import { queryDatabase } from "./db"; // Assuming this is your pg query utility
import type { User as NextAuthUser } from "next-auth";
// Dynamic import for bcryptjs, as it's a server-only module
import { default as bcrypt } from "bcryptjs";

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

        // Find the user by email in PostgreSQL
        // Assuming queryDatabase returns an array of rows, and you take the first one
        const result = await queryDatabase(
          "SELECT user_id, first_name, last_name, email, password, email_verified FROM users WHERE email = $1", // Added email_verified to select
          [credentials.email]
        );
        const user = result[0]; // Assuming result is an array of objects

        if (!user) {
          throw new Error("No user found with that email.");
        }

        // Check email verification status
        if (!user.email_verified) {
          // Use user.email_verified from DB
          throw new Error("Please verify your email first.");
        }

        // Verify password (use bcryptjs for hashing and comparing)
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        // Return user object. NextAuth.js will serialize this into the JWT.
        return {
          id: user.user_id, // Ensure this matches your User.id type (number)
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          // image: user.image, // Include if you have an image column
        };
      },
    }),
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
        token.id = user.id; // User.id is number, so token.id should be number
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    // This callback is called whenever a session is checked
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as number; // <--- Changed to number
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Custom sign-in page path
    error: "/auth/error", // Custom error page
  },
  secret: process.env.AUTH_SECRET,
};