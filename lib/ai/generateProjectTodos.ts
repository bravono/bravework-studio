import { GoogleAgent } from "./google-adk";
import prisma from "@/lib/prisma";

export interface GeneratedTodoItem {
  title: string;
  description: string;
  milestoneTitle: string;
  positionOrder: number;
}

export async function generateProjectTodos(orderId: number): Promise<GeneratedTodoItem[]> {
  // Fetch order details including custom offer information
  const order = await prisma.orders.findUnique({
    where: { order_id: orderId },
    include: {
      product_categories: true,
      custom_offers_orders_offer_idTocustom_offers: true,
    },
  });

  if (!order) {
    throw new Error(`Order #${orderId} not found`);
  }

  const offer = order.custom_offers_orders_offer_idTocustom_offers;
  const projectTitle = order.title || "Custom Project";
  const categoryName = order.product_categories?.category_name || "General Service";
  const projectDescription = offer?.description || order.project_description || "Custom offer project";
  const timelineDays = offer?.project_duration_days || 7;
  const amountInKobo = offer?.offer_amount_in_kobo || order.total_expected_amount_kobo;
  const amountFormatted = `₦${(amountInKobo / 100).toLocaleString()}`;

  const promptText = `
You are an expert project manager and technical lead. Break down this confirmed project into a detailed, logical sequence of actionable todo milestone items for our delivery team and client.

Project Details:
- Title: ${projectTitle}
- Category: ${categoryName}
- Overview & Description: ${projectDescription}
- Duration / Timeline: ${timelineDays} days
- Total Value: ${amountFormatted}

Instructions:
1. Divide the project into 3-5 logical chronological milestones (e.g. "Phase 1: Discovery & Planning", "Phase 2: Core Development / Design", "Phase 3: Review & Deliverables").
2. Under each milestone, create clear, specific, actionable todo tasks.
3. Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "milestoneTitle": "Phase 1: Discovery & Planning",
    "title": "Initial Kickoff & Requirements Alignment",
    "description": "Establish scope baseline and gather initial branding/technical guidelines from client.",
    "positionOrder": 1
  }
]
Do not output markdown code blocks or surrounding text, just the raw JSON array.
`;

  try {
    const aiAgent = new GoogleAgent(
      "TodoBreakdownAgent",
      "Project Breakdown Specialist",
      "You are a structured project planner that outputs strict JSON task lists."
    );

    const res = await aiAgent.process({ topic: promptText });
    let cleanContent = res.content.trim();

    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const items: GeneratedTodoItem[] = JSON.parse(cleanContent);
    return items;
  } catch (error) {
    console.error("[generateProjectTodos] Error generating todos via AI:", error);

    // Dynamic fallback structured list based on timeline duration
    const fallbackMilestones: GeneratedTodoItem[] = [
      {
        milestoneTitle: "Phase 1: Onboarding & Requirements",
        title: "Kickoff & Project Requirements Confirmation",
        description: "Review contract guidelines and gather initial client assets.",
        positionOrder: 1,
      },
      {
        milestoneTitle: "Phase 1: Onboarding & Requirements",
        title: "Design & Architecture Blueprint",
        description: "Finalize technical approach and share initial wireframes/concepts.",
        positionOrder: 2,
      },
      {
        milestoneTitle: "Phase 2: Execution & Development",
        title: "Core Build & Implementation",
        description: "Primary execution phase according to agreed project scope.",
        positionOrder: 3,
      },
      {
        milestoneTitle: "Phase 3: QA & Deliverables",
        title: "Quality Review & Client Feedback Integration",
        description: "Review completed work and resolve open comments.",
        positionOrder: 4,
      },
      {
        milestoneTitle: "Phase 3: QA & Deliverables",
        title: "Final Delivery & Project Handover",
        description: "Deliver final assets, source files, and project sign-off.",
        positionOrder: 5,
      },
    ];

    return fallbackMilestones;
  }
}
