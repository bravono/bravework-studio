import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import dns from "node:dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

export interface ServiceRecommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  actionUrl: string;
  actionLabel: string;
}

export interface BusinessGapDetection {
  title: string;
  category: "Services" | "Academy" | "Hardware Rentals" | "Kids Hub" | "Other";
  description: string;
  suggested_offering: string;
  impact: "high" | "medium" | "low";
}

export interface CustomerServiceAgentResult {
  reply: string;
  recommendations: ServiceRecommendation[];
  isEscalated: boolean;
  escalatedTopic?: string;
  businessGap?: BusinessGapDetection;
}

export interface ChatHistoryMessage {
  sender: "user" | "assistant" | "system";
  content: string;
}

export const BRAVEWORK_SERVICES: ServiceRecommendation[] = [
  {
    id: "3d-animation",
    title: "3D Modeling & Animation",
    category: "Creative Services",
    description: "High-fidelity character design, architectural visualization, YouTube intros, and children 3D animated series.",
    actionUrl: "/services",
    actionLabel: "Explore 3D Services",
  },
  {
    id: "software-development",
    title: "Software & Web Development",
    category: "Engineering",
    description: "Scalable full-stack web platforms, mobile applications (iOS/Android), custom SaaS, and REST APIs.",
    actionUrl: "/order",
    actionLabel: "Start Project Order",
  },
  {
    id: "ai-integration",
    title: "AI Integration & Automation",
    category: "Artificial Intelligence",
    description: "Custom AI agents, intelligent customer support bots, automated workflows, and predictive analytics.",
    actionUrl: "/order",
    actionLabel: "Request AI Solution",
  },
  {
    id: "uiux-design",
    title: "UI/UX & Brand Design",
    category: "Design",
    description: "User research, wireframing, high-converting web and mobile prototypes in Figma.",
    actionUrl: "/services",
    actionLabel: "View Design Work",
  },
  {
    id: "academy",
    title: "Bravework Academy",
    category: "Education",
    description: "Practical certified digital courses in Blender 3D, frontend development, and programming in Lagos.",
    actionUrl: "/academy",
    actionLabel: "Browse Courses",
  },
  {
    id: "hardware-rentals",
    title: "Workstation & PC Rentals",
    category: "Infrastructure",
    description: "Affordable high-performance GPU rigs and laptop rentals for creators, developers, and students.",
    actionUrl: "/hub",
    actionLabel: "Reserve Hardware",
  },
  {
    id: "kids-hub",
    title: "Bravework Kids Hub",
    category: "Edutainment",
    description: "Interactive creative tech workshops, storytelling, and digital animation designed for young minds.",
    actionUrl: "/kids",
    actionLabel: "Explore Kids Hub",
  },
];

export async function processCustomerMessage(
  sessionId: string,
  userMessage: string,
  history: ChatHistoryMessage[] = []
): Promise<CustomerServiceAgentResult> {
  const apiKey = (process.env.GOOGLE_GENERATIVE_AI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY in environment configuration.");
  }

  const activeKnowledge = await prisma.ai_knowledge_base.findMany({
    where: { is_active: true },
    orderBy: { updated_at: "desc" },
    take: 30,
  });

  const knowledgeContext = activeKnowledge
    .map((item) => `[Category: ${item.category}] Q: ${item.question}\nA: ${item.answer}`)
    .join("\n\n");

  const servicesCatalog = BRAVEWORK_SERVICES.map(
    (s) => `- ${s.title} (${s.category}): ${s.description} [URL: ${s.actionUrl}]`
  ).join("\n");

  const systemInstruction = `
You are Bravework AI, the intelligent customer service assistant and official business advisor for Bravework Studio based in Lagos, Nigeria.
Bravework Studio is a creative powerhouse empowering businesses and creators through 3D animation, custom software engineering, AI integration, UI/UX design, Academy courses, hardware rentals, and kids edutainment.

Your goals:
1. Provide warm, clear, professional, and knowledgeable answers to visitor inquiries.
2. Recommend relevant Bravework Studio services whenever the visitor has a project need, business problem, or learning interest.
3. Handle unknown information strictly and escalate when needed.
4. Detect business offering gaps: identify when a customer is asking for a service, product, course, or capability that Bravework Studio does not currently provide.

OFFICIAL SERVICES CATALOG:
${servicesCatalog}

VERIFIED KNOWLEDGE BASE MEMORY:
${knowledgeContext || "No dynamic knowledge base items entered yet."}

RULES:
- When the visitor asks for information that is NOT covered in your knowledge base or service catalog, or when you are uncertain about specific custom pricing or internal administrative policies:
  1. Append this marker on its own line at the end of your response:
     [ESCALATE: <short description of the unanswerable question>]
  2. Inform the customer courteously that you have recorded their question for the Bravework Studio administrative team to review and respond.
- When the visitor requests a service, product, feature, or course that Bravework Studio DOES NOT offer (e.g. drone videography, hardware sales, game server hosting, etc.):
  1. Append this marker on its own line at the end of your response:
     [BUSINESS_GAP: {"title": "<short gap title>", "category": "<Services|Academy|Hardware Rentals|Kids Hub|Other>", "description": "<what the customer requested>", "suggested_offering": "<recommendation on how Bravework could monetize or provide this>", "impact": "<high|medium|low>"}]
  2. In your customer response, politely state that Bravework does not currently provide this specific offering, suggest the nearest related alternative if applicable, or offer to pass the interest along to the team.
- When recommending services, include a line:
  [RECOMMEND: <comma-separated service ids, e.g. 3d-animation, software-development>]
  Allowed IDs: 3d-animation, software-development, ai-integration, uiux-design, academy, hardware-rentals, kids-hub.
- Do NOT use emojis in your response. Keep tone modern, articulate, and helpful.
`;

  const conversationTranscript = history
    .map((m) => `${m.sender === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `${conversationTranscript ? `Previous Conversation:\n${conversationTranscript}\n\n` : ""}Visitor: ${userMessage}\nAssistant:`;

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  let rawResponseText = "";
  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const response = await model.generateContent(prompt);
      const res = await response.response;
      const text = res.text();
      if (text) {
        rawResponseText = text;
        break;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  if (!rawResponseText) {
    throw new Error(`Failed to generate customer service response: ${lastError?.message || "All models failed"}`);
  }

  let cleanedReply = rawResponseText;
  let isEscalated = false;
  let escalatedTopic: string | undefined;
  let businessGap: BusinessGapDetection | undefined;
  const recommendations: ServiceRecommendation[] = [];

  const escalateMatch = cleanedReply.match(/\[ESCALATE:\s*([^\]]+)\]/i);
  if (escalateMatch) {
    isEscalated = true;
    escalatedTopic = escalateMatch[1].trim();
    cleanedReply = cleanedReply.replace(/\[ESCALATE:\s*[^\]]+\]/gi, "").trim();
  }

  const gapMatch = cleanedReply.match(/\[BUSINESS_GAP:\s*(\{[\s\S]*?\})\]/i);
  if (gapMatch) {
    try {
      const parsed = JSON.parse(gapMatch[1]) as BusinessGapDetection;
      businessGap = {
        title: parsed.title || "Unspecified Business Opportunity",
        category: parsed.category || "Services",
        description: parsed.description || userMessage,
        suggested_offering: parsed.suggested_offering || "Assess feasibility of new customer request",
        impact: parsed.impact || "medium",
      };
    } catch {
      businessGap = {
        title: "Unmet Customer Request",
        category: "Services",
        description: userMessage,
        suggested_offering: "Evaluate market demand for requested capability",
        impact: "medium",
      };
    }
    cleanedReply = cleanedReply.replace(/\[BUSINESS_GAP:\s*\{[\s\S]*?\}\]/gi, "").trim();
  }

  const recommendMatch = cleanedReply.match(/\[RECOMMEND:\s*([^\]]+)\]/i);
  if (recommendMatch) {
    const rawIds = recommendMatch[1].split(",").map((s) => s.trim().toLowerCase());
    for (const id of rawIds) {
      const found = BRAVEWORK_SERVICES.find((srv) => srv.id.toLowerCase() === id);
      if (found && !recommendations.some((r) => r.id === found.id)) {
        recommendations.push(found);
      }
    }
    cleanedReply = cleanedReply.replace(/\[RECOMMEND:\s*[^\]]+\]/gi, "").trim();
  }

  return {
    reply: cleanedReply,
    recommendations,
    isEscalated,
    escalatedTopic,
    businessGap,
  };
}
