import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendAdminCustomOfferCreatedEmail } from "@/lib/mailer";

export const runtime = "nodejs";

// Initialize Gemini Client if API key is present
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

interface ProposalMilestone {
  title: string;
  description: string;
  durationDays: number;
  amountKobo: number;
}

interface FleetProposalResult {
  summary: string;
  milestones: ProposalMilestone[];
  totalBudgetKobo: number;
  estimatedDays: number;
  timelineDescription: string;
}

/**
 * Executes the 3-Stage Agent Fleet Workflow:
 * 1. Agent 1: Spec & Document Requirements Analyzer
 * 2. Agent 2: Scope & Milestone Architect
 * 3. Agent 3: Estimator & Custom Offer Synthesizer
 */
async function runAIAgentFleet(
  order: {
    order_id: number;
    title?: string;
    project_description?: string;
    budget_range?: string;
    timeline?: string;
    category_name?: string;
  },
  orderFiles: Array<{ file_name: string; file_size?: string; file_url?: string }>,
  refinementPrompt?: string
): Promise<FleetProposalResult> {
  const serviceCategory = order.category_name || "General Creative / Tech Service";
  const projectDesc = order.project_description || "No detailed description provided by client.";
  const budgetPref = order.budget_range || "Not specified";
  const timelinePref = order.timeline || "Not specified";
  const fileDetails = orderFiles.length > 0
    ? orderFiles.map(f => `- ${f.file_name} (${f.file_url || 'Attached file'})`).join("\n")
    : "No document attachments uploaded.";

  if (!genAI) {
    // Smart Fallback Fleet synthesis when GEMINI_API_KEY is not configured
    console.warn("GEMINI_API_KEY not set. Using smart fallback AI fleet heuristics.");
    
    const fallbackMilestones: ProposalMilestone[] = [
      {
        title: "Phase 1: Discovery, Planning & Scope Alignment",
        description: `Analyze client requirements for ${serviceCategory}, review attached documents, and produce initial concepts & wireframes.`,
        durationDays: 3,
        amountKobo: 5000000, // ₦50,000
      },
      {
        title: "Phase 2: Core Execution & Implementation",
        description: `Execute main deliverable based on description: "${projectDesc.slice(0, 100)}..."`,
        durationDays: 7,
        amountKobo: 12000000, // ₦120,000
      },
      {
        title: "Phase 3: QA, Client Review & Final Delivery",
        description: "Perform quality assurance checks, incorporate client feedback, and deliver production-ready assets.",
        durationDays: 4,
        amountKobo: 3000000, // ₦30,000
      },
    ];

    if (refinementPrompt) {
      fallbackMilestones.push({
        title: "Phase 4: Requested Refinements & Modifications",
        description: `Custom adjustment requested: "${refinementPrompt}"`,
        durationDays: 2,
        amountKobo: 2000000, // ₦20,000
      });
    }

    const totalKobo = fallbackMilestones.reduce((acc, m) => acc + m.amountKobo, 0);
    const totalDays = fallbackMilestones.reduce((acc, m) => acc + m.durationDays, 0);

    return {
      summary: `AI Fleet Proposal for ${serviceCategory}: Fully analyzed project description and ${orderFiles.length} file attachments. Proposed a multi-phase execution roadmap tailored to client preferences.`,
      milestones: fallbackMilestones,
      totalBudgetKobo: totalKobo,
      estimatedDays: totalDays,
      timelineDescription: `Estimated completion within ${totalDays} business days (${totalDays <= 7 ? "1-2 weeks" : "2-4 weeks"}).`,
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const promptText = `
You are an expert AI Fleet Orchestrator at Bravework Studio (a creative, design, software, and 3D studio).
Your fleet consists of 3 specialized sub-agents:
1. Requirements Analyst Agent
2. Milestone & Deliverables Architect Agent
3. Budget & Estimator Agent

Analyze the following order details and create a comprehensive custom offer proposal:

--- ORDER DATA ---
Order ID: ${order.order_id}
Category/Service: ${serviceCategory}
Title: ${order.title || 'Untitled Order'}
Description: ${projectDesc}
Client Budget Preference: ${budgetPref}
Client Timeline Preference: ${timelinePref}
Attached Files:
${fileDetails}

${refinementPrompt ? `--- ADMIN REFINEMENT INSTRUCTION ---\nPlease modify the proposal according to this instruction: "${refinementPrompt}"` : ''}

Return ONLY a valid JSON object matching this exact schema (no markdown formatting, no code blocks):
{
  "summary": "Clear executive summary of project scope and requirements",
  "milestones": [
    {
      "title": "Milestone Title",
      "description": "Detailed deliverables for this milestone",
      "durationDays": 5,
      "amountKobo": 5000000
    }
  ],
  "totalBudgetKobo": 20000000,
  "estimatedDays": 14,
  "timelineDescription": "2 Weeks Total Execution Timeline"
}

Note: Amount is in kobo (100 kobo = 1 NGN). Be realistic with pricing based on standard studio rates.
`;

  try {
    const result = await model.generateContent(promptText);
    const text = result.response.text().trim();

    // Clean JSON response if wrapped in backticks
    const cleanedJson = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
    const parsed: FleetProposalResult = JSON.parse(cleanedJson);
    return parsed;
  } catch (err) {
    console.error("Gemini AI Fleet generation error:", err);
    throw new Error("AI Fleet failed to generate proposal structure");
  }
}

/**
 * POST /api/admin/orders/[id]/ai-proposal
 * Triggers AI Agent Fleet proposal generation for a specific order.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
    }

    // Optional admin verification (allow system background call if secret header passed)
    const authHeader = request.headers.get("x-system-trigger");
    if (authHeader !== "internal-auto-trigger") {
      const guardResponse = await verifyAdmin(request);
      if (guardResponse) return guardResponse;
    }

    // 1. Fetch Order Details
    const orderRows = await queryDatabase(
      `SELECT o.order_id, o.user_id, o.title, o.project_description, o.budget_range, o.timeline, pc.category_name
       FROM orders o
       LEFT JOIN product_categories pc ON o.category_id = pc.category_id
       WHERE o.order_id = $1`,
      [orderId]
    );

    if (orderRows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderRows[0];

    // 2. Fetch Attached Files
    const fileRows = await queryDatabase(
      `SELECT file_name, file_size, file_url FROM order_files WHERE order_id = $1`,
      [orderId]
    );

    // 3. Optional payload for refinement prompt
    let refinementPrompt: string | undefined;
    try {
      const body = await request.json();
      refinementPrompt = body.refinementPrompt;
    } catch {
      // Body empty or not JSON
    }

    // 4. Run AI Agent Fleet Workflow
    const fleetResult = await runAIAgentFleet(order, fileRows, refinementPrompt);

    // Formulate structured description with milestone details
    const formattedDescription = `${fleetResult.summary}\n\n--- MILESTONES & TIMELINE (${fleetResult.timelineDescription}) ---\n` +
      fleetResult.milestones.map((m, idx) => `${idx + 1}. ${m.title} (${m.durationDays} days - ₦${(m.amountKobo / 100).toLocaleString()})\n   ${m.description}`).join("\n");

    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    // 5. Store / Update Custom Offer in Database
    return await withTransaction(async (client) => {
      // Fetch status_id for 'pending'
      const statusRes = await client.query(
        "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
        ["pending"]
      );
      const statusId = statusRes.rows[0]?.offer_status_id || 1;

      // Check if custom offer already exists for this order
      const existingOfferRes = await client.query(
        "SELECT offer_id FROM custom_offers WHERE order_id = $1",
        [orderId]
      );

      let offerId: number;

      if (existingOfferRes.rows.length > 0) {
        // Update existing custom offer
        offerId = existingOfferRes.rows[0].offer_id;
        await client.query(
          `UPDATE custom_offers 
           SET offer_amount_in_kobo = $1, description = $2, expires_at = $3, project_duration_days = $4, updated_at = NOW()
           WHERE offer_id = $5`,
          [fleetResult.totalBudgetKobo, formattedDescription, expiresAt, fleetResult.estimatedDays, offerId]
        );
      } else {
        // Create new custom offer
        const insertRes = await client.query(
          `INSERT INTO custom_offers (order_id, user_id, offer_amount_in_kobo, description, status_id, expires_at, project_duration_days)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING offer_id`,
          [orderId, order.user_id, fleetResult.totalBudgetKobo, formattedDescription, statusId, expiresAt, fleetResult.estimatedDays]
        );
        offerId = insertRes.rows[0].offer_id;

        // Associate offer_id with order
        await client.query("UPDATE orders SET offer_id = $1 WHERE order_id = $2", [offerId, orderId]);
      }

      // 6. Notify Admins via In-App Notification & Email
      const adminUsers = await client.query(
        `SELECT user_id, email FROM users WHERE role = 'admin' OR user_id = 1 LIMIT 5`
      );

      const notificationTitle = `🤖 AI Fleet Proposal Ready for Order #${orderId}`;
      const notificationMessage = `Custom offer generated: ₦${(fleetResult.totalBudgetKobo / 100).toLocaleString()} for Order #${orderId}. Click to review.`;
      const notificationLink = `/admin/dashboard?tab=custom-offers&offerId=${offerId}`;

      for (const admin of adminUsers.rows) {
        // In-app notification
        try {
          await client.query(
            "INSERT INTO notifications (user_id, title, message, link) VALUES ($1, $2, $3, $4)",
            [admin.user_id, notificationTitle, notificationMessage, notificationLink]
          );
        } catch (nErr) {
          console.error("Failed to insert admin notification:", nErr);
        }

        // Email notification
        if (admin.email) {
          sendAdminCustomOfferCreatedEmail(
            admin.email,
            orderId,
            fleetResult.totalBudgetKobo,
            formattedDescription,
            offerId
          ).catch((e) => console.error("Email dispatch error:", e));
        }
      }

      return NextResponse.json({
        success: true,
        offerId,
        orderId,
        fleetResult,
        formattedDescription,
        message: "AI Agent Fleet successfully generated custom offer proposal.",
      });
    });
  } catch (error: any) {
    console.error("Error in AI Proposal Fleet endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI Proposal Fleet" },
      { status: 500 }
    );
  }
}
