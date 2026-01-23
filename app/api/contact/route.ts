import { NextResponse } from "next/server";
import { createZohoLead } from "@/lib/zoho";
import { contactSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const { error, value } = contactSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = value;

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
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
