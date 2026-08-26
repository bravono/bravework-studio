import { NextResponse } from "next/server";

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ACCOUNTS_URL =
  process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";
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

export async function createZohoContact(contactData: any) {
  const accessToken = await getZohoAccessToken();

  if (!accessToken) {
    throw new Error("Failed to get access token");
  }

  try {
    const response = await fetch(`${ZOHO_API_URL}/crm/v2/Contacts`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [contactData] }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Zoho CRM API Error:", data);
      throw new Error(JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error("Error creating Zoho contact:", error);
    throw error;
  }
}

export async function getOrCreateZohoInvoiceContact(email: string, name: string): Promise<string> {
  const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;
  const ZOHO_API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.com";

  if (!ZOHO_ORGANIZATION_ID) {
    throw new Error("Missing ZOHO_ORGANIZATION_ID");
  }

  const accessToken = await getZohoAccessToken();
  if (!accessToken) {
    throw new Error("Failed to get Zoho access token");
  }

  try {
    // 1. Search for existing contact by email
    const searchUrl = `${ZOHO_API_URL}/invoice/v3/contacts?organization_id=${ZOHO_ORGANIZATION_ID}&email=${encodeURIComponent(
      email
    )}`;

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.contacts && searchData.contacts.length > 0) {
        return searchData.contacts[0].contact_id;
      }
    }

    // 2. If contact not found, create new contact
    const createUrl = `${ZOHO_API_URL}/invoice/v3/contacts?organization_id=${ZOHO_ORGANIZATION_ID}`;
    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_name: name || email,
        email: email,
      }),
    });

    const createData = await createResponse.json();
    if (!createResponse.ok) {
      console.error("Zoho Invoice Create Contact API Error:", createData);
      throw new Error(createData.message || "Failed to create Zoho contact");
    }

    return createData.contact.contact_id;
  } catch (error) {
    console.error("Error in getOrCreateZohoInvoiceContact:", error);
    throw error;
  }
}

export async function createZohoInvoice(
  contactId: string,
  orderTitle: string,
  amount: number,
  orderId: number | string
): Promise<{ invoice_id: string; invoice_number: string; client_view_url: string }> {
  const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;
  const ZOHO_API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.com";

  if (!ZOHO_ORGANIZATION_ID) {
    throw new Error("Missing ZOHO_ORGANIZATION_ID");
  }

  const accessToken = await getZohoAccessToken();
  if (!accessToken) {
    throw new Error("Failed to get Zoho access token");
  }

  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // Create invoice in Zoho (initially as draft)
    const createUrl = `${ZOHO_API_URL}/invoice/v3/invoices?organization_id=${ZOHO_ORGANIZATION_ID}`;
    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: contactId,
        date: todayStr,
        due_date: todayStr,
        line_items: [
          {
            name: orderTitle || "Product Purchase",
            rate: amount,
            quantity: 1,
          },
        ],
        reference_number: `ORDER-${orderId}`,
      }),
    });

    const createData = await createResponse.json();
    if (!createResponse.ok) {
      console.error("Zoho Invoice Create API Error:", createData);
      throw new Error(createData.message || "Failed to create Zoho invoice");
    }

    const invoice = createData.invoice;

    // Flip invoice status from 'draft' to 'sent' (so payment can be recorded against it)
    const sentStatusUrl = `${ZOHO_API_URL}/invoice/v3/invoices/${invoice.invoice_id}/status/sent?organization_id=${ZOHO_ORGANIZATION_ID}`;
    const sentResponse = await fetch(sentStatusUrl, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    });

    if (!sentResponse.ok) {
      console.error("Failed to mark Zoho invoice as sent:", await sentResponse.text());
    }

    return {
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
      client_view_url: invoice.client_view_url || "",
    };
  } catch (error) {
    console.error("Error in createZohoInvoice:", error);
    throw error;
  }
}

export async function recordZohoInvoicePayment(
  contactId: string,
  invoiceId: string,
  amount: number,
  reference: string
): Promise<any> {
  const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;
  const ZOHO_API_URL = process.env.ZOHO_API_URL || "https://www.zohoapis.com";

  if (!ZOHO_ORGANIZATION_ID) {
    throw new Error("Missing ZOHO_ORGANIZATION_ID");
  }

  const accessToken = await getZohoAccessToken();
  if (!accessToken) {
    throw new Error("Failed to get Zoho access token");
  }

  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const paymentUrl = `${ZOHO_API_URL}/invoice/v3/customerpayments?organization_id=${ZOHO_ORGANIZATION_ID}`;
    const response = await fetch(paymentUrl, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: contactId,
        payment_mode: "Paystack",
        amount: amount,
        date: todayStr,
        reference_number: reference,
        invoices: [
          {
            invoice_id: invoiceId,
            amount_applied: amount,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Zoho Invoice Record Payment API Error:", data);
      throw new Error(data.message || "Failed to record Zoho payment");
    }

    return data;
  } catch (error) {
    console.error("Error in recordZohoInvoicePayment:", error);
    throw error;
  }
}

