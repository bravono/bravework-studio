// app/api/zoho/prod-callback/route.ts
import { NextResponse } from "next/server";

/**
 * Production‑only callback for Zoho OAuth.
 *
 * 1️⃣ Exchanges the `code` for tokens.
 * 2️⃣ Stores the refresh token securely (demo: logs it – replace with your secret‑store logic).
 * 3️⃣ Returns a generic success message – **no tokens are sent back to the client**.
 *
 * IMPORTANT:
 *   • Do NOT commit any secret‑store implementation that writes to .env files.
 *   • In a real production deployment replace the `storeRefreshToken` stub with
 *     a call to your secret manager (Vercel env vars, AWS Secrets Manager,
 *     Azure Key Vault, etc.) or a DB encrypted column.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  // -------------------------------------------------------------------------
  // 1️⃣ Exchange the code for tokens
  // -------------------------------------------------------------------------
  const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID!;
  const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET!;
  const ZOHO_ACCOUNTS_URL =
    process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com";

  const tokenUrl = `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: url.origin + "/api/zoho/prod-callback", // must match the URI you registered
    code,
  });

  let tokenData: any;
  try {
    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error("Zoho token exchange failed:", err);
      return NextResponse.json(
        { error: "Token exchange failed", details: err },
        { status: 500 }
      );
    }

    tokenData = await resp.json(); // contains access_token, refresh_token, expires_in, etc.
  } catch (e) {
    console.error("Zoho callback error:", e);
    return NextResponse.json(
      { error: "Unexpected error during token exchange" },
      { status: 500 }
    );
  }

  // -------------------------------------------------------------------------
  // 2️⃣ Persist the refresh token (replace this stub with real secret storage)
  // -------------------------------------------------------------------------
  const refreshToken = tokenData.refresh_token;
  if (!refreshToken) {
    console.warn("Zoho did not return a refresh token.");
  } else {
    await storeRefreshToken(refreshToken);
  }

  // -------------------------------------------------------------------------
  // 3️⃣ Return a minimal success response (no tokens!)
  // -------------------------------------------------------------------------
  return NextResponse.json({
    message: "Zoho integration configured successfully.",
  });
}

/**
 * Stub for persisting the refresh token.
 *
 * Replace the body of this function with your production secret‑store logic,
 * e.g.:
 *   - Vercel Environment Variables API
 *   - AWS Secrets Manager (`@aws-sdk/client-secrets-manager`)
 *   - Azure Key Vault (`@azure/keyvault-secrets`)
 *   - Prisma DB call (encrypted column)
 *
 * The function returns a Promise so the callback can `await` it.
 */
async function storeRefreshToken(token: string): Promise<void> {
  const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

  if (!VERCEL_ACCESS_TOKEN || !VERCEL_PROJECT_ID) {
    console.error(
      "Missing VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID. Cannot persist token to Vercel automatically."
    );
    console.log("⚠️ Refresh Token (save this manually to Vercel Env Vars):", token);
    return;
  }

  const headers = {
    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    // 1. Check if the env var already exists
    const getRes = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env?key=ZOHO_REFRESH_TOKEN&target=production`,
      { headers }
    );

    if (!getRes.ok) {
      console.error("Failed to check existing env vars:", await getRes.text());
      return;
    }

    const getData = await getRes.json();
    // The API returns { envs: [...] }
    const existingEnv = getData.envs?.find(
      (e: any) => e.key === "ZOHO_REFRESH_TOKEN"
    );

    if (existingEnv) {
      // 2. Update (PATCH) if it exists
      console.log(`Updating existing env var ${existingEnv.id}...`);
      const patchRes = await fetch(
        `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env/${existingEnv.id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ value: token }),
        }
      );

      if (!patchRes.ok) {
        throw new Error(`Failed to update env var: ${await patchRes.text()}`);
      }
      console.log("✅ Successfully updated ZOHO_REFRESH_TOKEN in Vercel.");
    } else {
      // 3. Create (POST) if it doesn't exist
      console.log("Creating new env var...");
      const postRes = await fetch(
        `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            key: "ZOHO_REFRESH_TOKEN",
            value: token,
            type: "encrypted",
            target: ["production"],
          }),
        }
      );

      if (!postRes.ok) {
        throw new Error(`Failed to create env var: ${await postRes.text()}`);
      }
      console.log("✅ Successfully created ZOHO_REFRESH_TOKEN in Vercel.");
    }
  } catch (error) {
    console.error("❌ Error saving token to Vercel:", error);
    console.log("⚠️ Refresh Token (save this manually):", token);
  }
}