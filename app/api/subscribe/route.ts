import { NextResponse as Response } from "next/server";
import { subscriptionSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { error, value } = subscriptionSchema.validate(body);
    if (error) {
      return Response.json(
        { message: error.details[0].message },
        { status: 400 },
      );
    }

    const { email, name, isActive } = value;

    console.log("Received subscription request:", { email, name, isActive });

    // Handle both string "true"/"false" and boolean true/false
    const isActiveBool = String(isActive) === "true" || isActive === true;
    const group = isActiveBool ? "active-course" : "waitlist";
    const senderApiKey = process.env.SENDER_API_KEY;

    if (!senderApiKey) {
      console.error(
        "SENDER_API_KEY is not configured in environment variables.",
      );
      return Response.json(
        { message: "Server configuration error. Please contact support." },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.sender.net/v2/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${senderApiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        firstname: name.split(" ")[0],
        lastname: name.split(" ").slice(1).join(" "),
        groups: [group],
      }),
    });

    const responseData = await response.json();

    if (response.ok) {
      return Response.json({ message: "Thanks for subscribing!" });
    } else {
      console.error("Sender API error:", responseData);
      return Response.json(
        { message: responseData.message || "Subscription failed." },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Error in subscription handler:", error);
    return Response.json(
      { message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
