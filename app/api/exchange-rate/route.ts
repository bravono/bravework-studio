import { NextResponse } from "next/server";
import { getCurrency } from "../../../lib/utils/getCurrency";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = parseFloat(searchParams.get("amount") || "1");

  try {
    const result = await getCurrency(amount);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to fetch currency data" },
      { status: 500 }
    );
  }
}