// app/api/zoho/callback/route.ts
import { NextResponse } from "next/server";

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID!;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET!;
const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com";

/**
 * This endpoint receives the `code` from Zoho after the user authorises the app.
 * It exchanges the code for an access‑token + refresh‑token and prints the refresh token.
 * In a real app you would store the refresh token securely (e.g. in a DB or secret manager).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // optional, you can verify it if you set one

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  // Exchange the code for tokens
  const tokenUrl = `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: url.origin + "/api/zoho/callback", // must match the registered URI
    code,
  });

  try {
    const resp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!resp.ok) {
      const err = await resp.text();
      return NextResponse.json(
        { error: "Token exchange failed", details: err },
        { status: 500 }
      );
    }

    const data = await resp.json();

    if (data.error) {
      return NextResponse.json({
        error: "Zoho OAuth error payload",
        details: data
      }, { status: 400 });
    }

    return NextResponse.json({
      message: "Zoho OAuth successful – store the refresh token securely",
      refresh_token: data.refresh_token,
      access_token: data.access_token,
      expires_in: data.expires_in,
      full_response: data
    });
  } catch (e) {
    console.error("Zoho callback error:", e);
    return NextResponse.json(
      { error: "Unexpected error during token exchange" },
      { status: 500 }
    );
  }
}