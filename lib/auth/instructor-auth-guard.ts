// instructor-auth-guard.ts (MODIFIED)

import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db"; // << NEW: Need DB access here
import { AuthSession } from "../../app/types/auth";

// --- UPDATED TYPES (Same as before, but the source of instructorId changes) ---
export type InstructorAuthSession = AuthSession & {
  instructorId: string;
  email: string; // Including email for clarity
};

export type AuthGuardResponse =
  | {
      error: NextResponse;
      session?: never;
    }
  | {
      error?: never;
      session: InstructorAuthSession;
    };
// --------------------------------------------------------------------------

export async function verifyInstructor(
  req: Request
): Promise<AuthGuardResponse> {
  const session = (await getServerSession(authOptions)) as AuthSession;

  // 1. Check for valid session and email
  if (!session?.user?.email) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const userEmail = session.user.email;

  // 2. Check for "instructor" role
  const userRoles = session.user.roles.map((role) => role.toLowerCase());
  if (!userRoles.includes("instructor")) {
    return {
      error: NextResponse.json(
        { message: "Forbidden: Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  // 3. Retrieve instructor_id from the database using the email
  try {
    const result = await queryDatabase(
      `SELECT instructor_id FROM instructors WHERE email = $1`,
      [userEmail]
    );

    console.log("Instructor Result", result);
    const instructorId = result[0]?.instructor_id;

    console.log("Auth Instructor Id", instructorId);
    if (!instructorId) {
      // The user is authenticated and has the 'instructor' role, but no matching ID in DB.
      return {
        error: NextResponse.json(
          { message: "Forbidden: Instructor profile not linked or found." },
          { status: 403 }
        ),
      };
    }

    // 4. Success: Return the session data with the retrieved instructorId
    return {
      session: {
        ...session,
        instructorId,
        email: userEmail,
      } as InstructorAuthSession,
    };
  } catch (e) {
    console.error("Database lookup error during instructor verification:", e);
    return {
      error: NextResponse.json(
        { error: "Internal Server Error during verification" },
        { status: 500 }
      ),
    };
  }
}
