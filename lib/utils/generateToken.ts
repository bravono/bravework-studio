import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { queryDatabase } from "lib/db";

const SECRET_KEY = process.env.STACK_SECRET_SERVER_KEY;

/**
 * Generates a secure token with expiration, tied to offerId and action
 * @param offerId - Unique identifier of the offer
 * @param action - Action associated with the token ('accept' | 'reject')
 * @param expiresInMinutes - Time until expiration (default 60 minutes)
 * @returns Base64-encoded token string
 */

export async function generateSecureToken(
  offerId: string | number,
  action: "accept" | "reject",
  expiresInMinutes: number = 60
): Promise<string> {
  const expiration = Date.now() + expiresInMinutes * 60 * 1000;
  const id = uuidv4();
  const payload = `${id}:${offerId}:${action}:${expiration}`;
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("hex");
  const token = Buffer.from(`${payload}:${signature}`).toString("base64");

  const newTimeStamp = new Date(expiration).toISOString(); // db

  await queryDatabase(
    "INSERT INTO secure_tokens (id, token, offer_id, action, expires_at, used) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, token, offerId, action, newTimeStamp, false]
  );

  return token;
}

/**
 * Verifies a secure token's integrity and expiration
 * @param token - Base64-encoded token to verify
 * @returns Result with validity, offerId, action, and expiration status
 */
export function verifySecureToken(token: string): {
  valid: boolean;
  expired: boolean;
  offerId?: string;
  action?: string;
} {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [offerId, action, expirationStr, signature] = decoded.split(":");
    const expiration = Number(expirationStr);

    if (Date.now() > expiration) {
      return { valid: false, expired: true };
    }

    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${offerId}:${action}:${expiration}`)
      .digest("hex");

    const valid = expectedSignature === signature;
    return { valid, expired: false, offerId, action };
  } catch (error) {
    return { valid: false, expired: true };
  }
}
