import { NextResponse } from "next/server";
import { createZohoLead } from "@/lib/zoho";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Map data to Zoho CRM Lead format
    // Note: Zoho CRM requires Last_Name. We'll use the full name for now.
    const leadData = {
      Last_Name: name,
      Email: email,
      Description: `Subject: ${subject}\n\n${message}`,
      Lead_Source: "Website Contact Form",
    };

    await createZohoLead(leadData);

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
