import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import dns from "node:dns";
import { BusinessGapDetection } from "./customer-service-agent";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

export interface SynthesisResult {
  analyzedConversationsCount: number;
  identifiedGapsCount: number;
  gaps: BusinessGapDetection[];
}

export async function synthesizeOfferingGapsFromHistory(): Promise<SynthesisResult> {
  const apiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY in environment configuration.");
  }

  // Fetch recent user messages from chat sessions
  const recentMessages = await prisma.ai_chat_messages.findMany({
    where: { sender: "user" },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  if (recentMessages.length === 0) {
    return {
      analyzedConversationsCount: 0,
      identifiedGapsCount: 0,
      gaps: [],
    };
  }

  const userQueries = recentMessages.map((m) => `- "${m.content}"`).join("\n");

  const prompt = `
Analyze the following user questions sent to Bravework Studio's customer service.
Bravework Studio currently offers:
- 3D Modeling & Animation (character, architectural, intros, kids series)
- Software & Web Engineering (custom web apps, mobile apps, e-commerce, APIs)
- AI Solutions (agents, chatbots, process automation)
- UI/UX Design (wireframes, prototypes)
- Bravework Academy (Blender 3D, coding courses in Lagos)
- Workstation & PC Rentals (hourly/daily GPU workstation access)
- Bravework Kids (kids animation workshops)

USER QUERIES:
${userQueries}

TASK:
Identify any unmet market demands, missing capabilities, or business offering gaps that Bravework Studio does not currently offer or could expand into based on these queries.
Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "title": "Short title of the offering gap",
    "category": "Services" | "Academy" | "Hardware Rentals" | "Kids Hub" | "Other",
    "description": "Clear explanation of what customers are requesting",
    "suggested_offering": "Strategic recommendation for how Bravework Studio can package, price, or launch this service/product",
    "impact": "high" | "medium" | "low"
  }
]
If there are no clear gaps, return an empty array [].
Do NOT wrap the JSON in markdown backticks or commentary. Return raw JSON only.
`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

  let rawOutput = "";
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      const res = await response.response;
      const text = res.text();
      if (text) {
        rawOutput = text;
        break;
      }
    } catch {
      continue;
    }
  }

  let parsedGaps: BusinessGapDetection[] = [];
  try {
    const cleaned = rawOutput.replace(/```json/gi, "").replace(/```/gi, "").trim();
    parsedGaps = JSON.parse(cleaned);
  } catch {
    parsedGaps = [];
  }

  let savedCount = 0;
  for (const gap of parsedGaps) {
    if (!gap.title || !gap.description) continue;

    // Check if similar gap title already exists
    const existing = await prisma.ai_offering_gaps.findFirst({
      where: {
        title: {
          contains: gap.title.substring(0, 30),
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      await prisma.ai_offering_gaps.update({
        where: { id: existing.id },
        data: {
          occurrences_count: { increment: 1 },
          suggested_offering: gap.suggested_offering || existing.suggested_offering,
        },
      });
    } else {
      await prisma.ai_offering_gaps.create({
        data: {
          title: gap.title,
          category: gap.category || "Services",
          description: gap.description,
          suggested_offering: gap.suggested_offering || "Assess business viability",
          potential_impact: gap.impact || "medium",
          status: "new",
        },
      });
      savedCount++;
    }
  }

  return {
    analyzedConversationsCount: recentMessages.length,
    identifiedGapsCount: savedCount,
    gaps: parsedGaps,
  };
}
