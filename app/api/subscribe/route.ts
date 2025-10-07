import { NextResponse as Response } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, name, isActive } = await request.json();

    console.log("Received subscription request:", { email, name, isActive });
    if (!email || !name) {
      return Response.json(
        { message: "Email and name are required." },
        { status: 400 }
      );
    }
    const group = isActive === "true" ? "active-course" : "waitlist";
    const senderApiKey = process.env.SENDER_API_KEY;

    if (!senderApiKey) {
      return Response.json(
        { message: "Sender API key is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.sender.net/v2/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${senderApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        name,
        groups: [group],
      }),
    });

    if (response.ok) {
      return Response.json({ message: "Thanks for subscribing!" });
    } else {
      return Response.json({ message: "Subscription failed." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in subscription handler:", error);
    return Response.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
