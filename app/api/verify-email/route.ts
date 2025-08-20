import { withTransaction } from "../../../lib/db";
import { redirect } from "next/navigation";

// Suggestions
// 1. Input validation: Consider adding more robust input validation for the token parameter to prevent potential security vulnerabilities.
// 2. Token expiration: You might want to consider adding a buffer period (e.g., 1-2 minutes) before deleting expired tokens to account for potential clock skew or other timing issues.
// 3. Redirect handling: You're correctly re-throwing the redirect error to let Next.js handle it. However, you might want to consider adding a more explicit comment to explain this behavior.
// 4. Error messages: Your error messages are informative, but you might want to consider making them more user-friendly and less technical.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  console.log("--- Email Verification Process Started ---");
  console.log("Received verification token:", token);

  // Handle no token provided BEFORE the main try-catch for clarity
  if (!token) {
    console.log("LOG: No token provided. Redirecting to error page.");
    redirect("/auth/error?message=No verification token provided.");
  }

  await withTransaction(async (client) => {
    try {
      console.log("LOG: Attempting to find token in DB.");
      const tokenResult = await client.query(
        'SELECT "user_id", expires, token FROM verification_tokens WHERE token = $1 AND type = $2',
        [token, "email_verification"]
      );
      const verificationToken = tokenResult[0];

      if (!verificationToken.token) {
        console.log(
          "LOG: Invalid verification token found. Redirecting to error page."
        );
        redirect("/auth/error?message=Invalid verification token.");
      }

      console.log("LOG: Token found. Checking expiry.");
      const now = new Date();
      if (new Date(verificationToken.expires) < now) {
        console.log(
          "LOG: Verification token expired. Deleting token and redirecting."
        );
        await client.query("DELETE FROM verification_tokens WHERE token = $1", [
          token,
        ]);
        redirect(
          "/auth/error?message=Verification token has expired. Please sign up again."
        );
      }

      console.log(
        "LOG: Token valid and not expired. Attempting to mark user email as verified."
      );
      // Make sure your email_verified column is BOOLEAN. If it's TIMESTAMP, use `now` instead of `true`.
      await client.query(
        'UPDATE users SET "email_verified" = $1 WHERE user_id = $2',
        [true, verificationToken.user_id] // Assuming 'email_verified' is BOOLEAN based on our previous discussion
      );
      console.log(
        `LOG: User ${verificationToken.user_id}'s email marked as verified.`
      );

      console.log("LOG: Attempting to delete used token from DB.");
      await client.query("DELETE FROM verification_tokens WHERE token = $1", [
        token,
      ]);
      console.log("LOG: Used verification token deleted from DB.");

      console.log(
        "LOG: Email verified successfully. Initiating redirect to login page."
      );
      redirect("/auth/login?verified=true"); // Redirect to your actual login page
      // Execution will stop here internally and this redirect will be sent.
    } catch (error: any) {
      // Check if the error is the internal NEXT_REDIRECT signal
      if (
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT")
      ) {
        // Re-throw the redirect error to let Next.js handle it
        throw error;
      }

      // This 'catch' block will now only execute for actual, unexpected errors
      console.error(
        "LOG: !!! An ACTUAL unexpected error occurred during verification !!!"
      );
      console.error("LOG: Error details:", error); // Log the actual error for debugging
      redirect(
        "/auth/error?message=An unexpected error occurred during verification. Please try again or contact support."
      );
    } finally {
      console.log("--- Email Verification Process Finished ---");
    }
  });
}
