import { NextApiRequest, NextApiResponse } from "next";
import { verifySecureToken } from "../lib/utils/generateToken";
import { queryDatabase } from "lib/db";

export async function verifyTokenMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const token = req.query.token as string;

  if (!token) return res.status(400).json({ error: "Token missing" });

  const verification = verifySecureToken(token);
  if (!verification.valid || verification.expired) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const { rows } = await queryDatabase(
    "SELECT * FROM secure_tokens WHERE token = $1",
    [token]
  );
  const dbToken = rows[0];

  if (!dbToken || dbToken.used) {
    return res.status(401).json({ error: "Token already used or not found" });
  }

  // Mark as used
  await queryDatabase("UPDATE secure_tokens SET used = true WHERE token = $1", [
    token,
  ]);

  // Attach to request object
  (req as any).verifiedToken = {
    offerId: dbToken.offer_id,
    action: dbToken.action,
  };

  next();
}
