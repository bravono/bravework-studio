import { NextResponse } from "next/server";

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";
const ZOHO_API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.com";

interface ZohoTokenResponse {
  access_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

export async function getZohoAccessToken(): Promise<string | null> {
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    console.error("Missing Zoho CRM credentials");
    return null;
  }

  try {
    const url = `${ZOHO_ACCOUNTS_URL}/oauth/v2/token?refresh_token=${ZOHO_REFRESH_TOKEN}&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`;
    
    const response = await fetch(url, {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to refresh Zoho token:", error);
      return null;
    }

    const data: ZohoTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Zoho token:", error);
    return null;
  }
}

export async function createZohoLead(leadData: any) {
  const accessToken = await getZohoAccessToken();
  
  if (!accessToken) {
    throw new Error("Failed to get access token");
  }

  try {
    const response = await fetch(`${ZOHO_API_URL}/crm/v2/Leads`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [leadData] }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Zoho CRM API Error:", data);
      throw new Error(JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error("Error creating Zoho lead:", error);
    throw error;
  }
}
