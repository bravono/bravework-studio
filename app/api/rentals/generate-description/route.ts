import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      deviceName,
      deviceType,
      ram,
      storage,
      processor,
      systemType,
      locationCity,
    } = body;

    if (!deviceName && !processor && !ram) {
      return NextResponse.json(
        {
          error:
            "Please provide at least a device name, processor, or RAM to generate a description.",
        },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    );

    const specsList = [
      deviceName && `Device Name: ${deviceName}`,
      deviceType && `Device Type: ${deviceType}`,
      processor && `Processor: ${processor}`,
      ram && `RAM: ${ram}`,
      storage && `Storage: ${storage}`,
      systemType && `System Type: ${systemType}`,
      locationCity && `Location: ${locationCity}`,
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `You are writing a compelling listing description for a hardware rental platform called Bravework Studio. 
Write a short, professional, and engaging description (2-3 sentences) for the following PC/device listing. 
Highlight the key specs that make this device great for creative professionals, designers, or students.
Be concise, punchy, and professional. Do NOT use markdown or bullet points. Output plain text only.

Specs:
${specsList}`;

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.5-pro",
    ];

    let lastError: any = null;
    let description = "";

    for (const modelName of modelsToTry) {
      try {
        console.log(`[generateDescription] Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) {
          description = text.trim();
          console.log(`[generateDescription] Success with model: ${modelName}`);
          break;
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`[generateDescription] Failed with model ${modelName}:`, error.message);
      }
    }

    if (!description) {
      throw new Error(
        `Failed to generate description across all models. Last error: ${lastError?.message || "Unknown error"}`
      );
    }

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error("Error generating description:", error);
    return NextResponse.json(
      { error: "Failed to generate description. Please try again." },
      { status: 500 },
    );
  }
}
