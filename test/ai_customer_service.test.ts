import { POST as chatPOST } from "@/app/api/chat/route";
import { GET as chatHistoryGET } from "@/app/api/chat/history/route";
import {
  GET as adminKnowledgeGET,
  POST as adminKnowledgePOST,
} from "@/app/api/admin/ai-service/knowledge/route";
import {
  PUT as adminKnowledgePUT,
  DELETE as adminKnowledgeDELETE,
} from "@/app/api/admin/ai-service/knowledge/[id]/route";
import { GET as adminEscalationsGET } from "@/app/api/admin/ai-service/escalations/route";
import { POST as adminEscalationsResolvePOST } from "@/app/api/admin/ai-service/escalations/[id]/resolve/route";
import {
  GET as adminGapsGET,
  POST as adminGapsPOST,
} from "@/app/api/admin/ai-service/gaps/route";
import {
  PUT as adminGapsPUT,
  DELETE as adminGapsDELETE,
} from "@/app/api/admin/ai-service/gaps/[id]/route";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { GoogleGenerativeAI } from "@google/generative-ai";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    ai_knowledge_base: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ai_escalations: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    ai_chat_sessions: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    ai_chat_messages: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    ai_offering_gaps: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth/admin-auth-guard");
jest.mock("@google/generative-ai");

describe("AI Customer Service & Business Insights Test Suite", () => {
  const originalEnvKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-ai-key-123";
    (verifyAdmin as jest.Mock).mockResolvedValue(null); // Admin authorized by default
  });

  afterAll(() => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalEnvKey;
  });

  describe("Customer Chat Endpoint (POST /api/chat)", () => {
    it("should return 400 when message is missing or empty", async () => {
      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: "   " }),
      });

      const res = await chatPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("should process standard user query and return service recommendations", async () => {
      (prisma.ai_knowledge_base.count as jest.Mock).mockResolvedValue(5);
      (prisma.ai_knowledge_base.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.ai_chat_sessions.create as jest.Mock).mockResolvedValue({
        session_id: "session-abc-123",
        user_email: null,
      });
      (prisma.ai_chat_messages.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.ai_chat_messages.create as jest.Mock).mockResolvedValue({ id: 1 });

      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () =>
            "We offer end-to-end 3D animation services for content creators.\n[RECOMMEND: 3d-animation]",
        },
      });
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      });
      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
      }));

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Can you create a 3D animated intro for my channel?",
        }),
      });

      const res = await chatPOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sessionId).toBe("session-abc-123");
      expect(data.reply).toContain("We offer end-to-end 3D animation services");
      expect(data.recommendations).toHaveLength(1);
      expect(data.recommendations[0].id).toBe("3d-animation");
      expect(data.isEscalated).toBe(false);
    });

    it("should record escalation when AI detects an unanswerable question", async () => {
      (prisma.ai_knowledge_base.count as jest.Mock).mockResolvedValue(5);
      (prisma.ai_knowledge_base.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.ai_chat_sessions.create as jest.Mock).mockResolvedValue({
        session_id: "session-escalate-1",
        user_email: "client@example.com",
      });
      (prisma.ai_chat_messages.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.ai_chat_messages.create as jest.Mock).mockResolvedValue({ id: 2 });
      (prisma.ai_escalations.create as jest.Mock).mockResolvedValue({ id: 10 });

      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () =>
            "I do not have specific custom enterprise SLA pricing for 2027 in my records.\n[ESCALATE: Custom enterprise SLA pricing 2027]",
        },
      });
      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "What is your enterprise SLA rate for 2027?",
          userEmail: "client@example.com",
        }),
      });

      const res = await chatPOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isEscalated).toBe(true);
      expect(prisma.ai_escalations.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            question: "What is your enterprise SLA rate for 2027?",
            status: "pending",
          }),
        })
      );
    });

    it("should record offering gap when customer asks for unoffered service", async () => {
      (prisma.ai_knowledge_base.count as jest.Mock).mockResolvedValue(5);
      (prisma.ai_knowledge_base.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.ai_chat_sessions.create as jest.Mock).mockResolvedValue({
        session_id: "session-gap-1",
      });
      (prisma.ai_chat_messages.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.ai_chat_messages.create as jest.Mock).mockResolvedValue({ id: 3 });
      (prisma.ai_offering_gaps.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.ai_offering_gaps.create as jest.Mock).mockResolvedValue({ id: 25 });

      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () =>
            "Bravework Studio currently does not offer drone aerial videography.\n[BUSINESS_GAP: {\"title\": \"Drone Aerial Videography\", \"category\": \"Services\", \"description\": \"Customer requested drone video capture for events\", \"suggested_offering\": \"Partner with licensed drone operators in Lagos\", \"impact\": \"high\"}]",
        },
      });
      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      }));

      const req = new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Do you provide drone videography for outdoor events?",
        }),
      });

      const res = await chatPOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.businessGapDetected).toBe(true);
      expect(prisma.ai_offering_gaps.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Drone Aerial Videography",
            category: "Services",
            status: "new",
          }),
        })
      );
    });
  });

  describe("Chat History Endpoint (GET /api/chat/history)", () => {
    it("should return 400 when sessionId is not provided", async () => {
      const req = new Request("http://localhost/api/chat/history");
      const res = await chatHistoryGET(req);
      expect(res.status).toBe(400);
    });

    it("should return message list when sessionId is provided", async () => {
      (prisma.ai_chat_messages.findMany as jest.Mock).mockResolvedValue([
        { id: 1, sender: "user", content: "Hello" },
        { id: 2, sender: "assistant", content: "Welcome to Bravework Studio" },
      ]);

      const req = new Request("http://localhost/api/chat/history?sessionId=session-xyz");
      const res = await chatHistoryGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.messages).toHaveLength(2);
    });
  });

  describe("Admin Knowledge Base API", () => {
    it("should reject unauthorized requests", async () => {
      (verifyAdmin as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
      );

      const req = new Request("http://localhost/api/admin/ai-service/knowledge");
      const res = await adminKnowledgeGET(req);
      expect(res.status).toBe(401);
    });

    it("should list knowledge items", async () => {
      (prisma.ai_knowledge_base.count as jest.Mock).mockResolvedValue(2);
      (prisma.ai_knowledge_base.findMany as jest.Mock).mockResolvedValue([
        { id: 1, question: "What is Bravework Studio?", answer: "A creative powerhouse" },
      ]);

      const req = new Request("http://localhost/api/admin/ai-service/knowledge");
      const res = await adminKnowledgeGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toHaveLength(1);
    });

    it("should allow admin to directly create new knowledge (Direct Training)", async () => {
      (prisma.ai_knowledge_base.create as jest.Mock).mockResolvedValue({
        id: 99,
        question: "Do you offer Unreal Engine 5 coaching?",
        answer: "Yes, personalized one-on-one sessions are available.",
        category: "academy",
        is_active: true,
      });

      const req = new Request("http://localhost/api/admin/ai-service/knowledge", {
        method: "POST",
        body: JSON.stringify({
          question: "Do you offer Unreal Engine 5 coaching?",
          answer: "Yes, personalized one-on-one sessions are available.",
          category: "academy",
        }),
      });

      const res = await adminKnowledgePOST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.item.id).toBe(99);
      expect(prisma.ai_knowledge_base.create).toHaveBeenCalled();
    });

    it("should allow admin to update knowledge", async () => {
      (prisma.ai_knowledge_base.update as jest.Mock).mockResolvedValue({
        id: 99,
        answer: "Updated verified answer",
      });

      const req = new Request("http://localhost/api/admin/ai-service/knowledge/99", {
        method: "PUT",
        body: JSON.stringify({
          answer: "Updated verified answer",
        }),
      });

      const res = await adminKnowledgePUT(req, { params: { id: "99" } });
      expect(res.status).toBe(200);
      expect(prisma.ai_knowledge_base.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 99 },
        })
      );
    });

    it("should allow admin to delete knowledge", async () => {
      (prisma.ai_knowledge_base.delete as jest.Mock).mockResolvedValue({ id: 99 });

      const req = new Request("http://localhost/api/admin/ai-service/knowledge/99", {
        method: "DELETE",
      });

      const res = await adminKnowledgeDELETE(req, { params: { id: "99" } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe("Admin Escalation Resolution & Trainable Memory Feedback Loop", () => {
    it("should list escalations and pending count", async () => {
      (prisma.ai_escalations.findMany as jest.Mock).mockResolvedValue([
        { id: 1, question: "Custom pricing query", status: "pending" },
      ]);
      (prisma.ai_escalations.count as jest.Mock).mockResolvedValue(1);

      const req = new Request("http://localhost/api/admin/ai-service/escalations");
      const res = await adminEscalationsGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.escalations).toHaveLength(1);
      expect(data.pendingCount).toBe(1);
    });

    it("should resolve escalation, update status, and immediately train AI memory", async () => {
      (prisma.ai_escalations.findUnique as jest.Mock).mockResolvedValue({
        id: 5,
        question: "Can we rent workstations for 30 consecutive days?",
        status: "pending",
      });
      (prisma.ai_escalations.update as jest.Mock).mockResolvedValue({
        id: 5,
        status: "answered",
        admin_response: "Yes, monthly workstation packages receive a 25% discount.",
      });
      (prisma.ai_knowledge_base.create as jest.Mock).mockResolvedValue({
        id: 105,
        question: "Can we rent workstations for 30 consecutive days?",
        answer: "Yes, monthly workstation packages receive a 25% discount.",
        source: "escalation_resolution",
      });

      const req = new Request(
        "http://localhost/api/admin/ai-service/escalations/5/resolve",
        {
          method: "POST",
          body: JSON.stringify({
            answer: "Yes, monthly workstation packages receive a 25% discount.",
            category: "rentals",
          }),
        }
      );

      const res = await adminEscalationsResolvePOST(req, { params: { id: "5" } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Verify escalation record marked answered
      expect(prisma.ai_escalations.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 5 },
          data: expect.objectContaining({
            status: "answered",
            admin_response: "Yes, monthly workstation packages receive a 25% discount.",
          }),
        })
      );

      // Verify knowledge base memory updated with answer
      expect(prisma.ai_knowledge_base.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            question: "Can we rent workstations for 30 consecutive days?",
            answer: "Yes, monthly workstation packages receive a 25% discount.",
            source: "escalation_resolution",
          }),
        })
      );
    });
  });

  describe("Admin Offering Gaps Portal API", () => {
    it("should list gaps with category and status counts", async () => {
      (prisma.ai_offering_gaps.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          title: "Mobile Game Server Hosting",
          category: "Services",
          potential_impact: "high",
          status: "new",
        },
      ]);
      (prisma.ai_offering_gaps.count as jest.Mock)
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1) // new
        .mockResolvedValueOnce(0) // planned
        .mockResolvedValueOnce(0) // adopted
        .mockResolvedValueOnce(1); // highImpact

      const req = new Request("http://localhost/api/admin/ai-service/gaps");
      const res = await adminGapsGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.gaps).toHaveLength(1);
      expect(data.stats.total).toBe(1);
      expect(data.stats.highImpact).toBe(1);
    });

    it("should allow admin to manually record an offering gap", async () => {
      (prisma.ai_offering_gaps.create as jest.Mock).mockResolvedValue({
        id: 2,
        title: "VR Game Development Course",
        category: "Academy",
        description: "Frequent requests for VR game dev classes",
        suggested_offering: "Launch a 4-week weekend VR cohort",
        potential_impact: "high",
        status: "new",
      });

      const req = new Request("http://localhost/api/admin/ai-service/gaps", {
        method: "POST",
        body: JSON.stringify({
          title: "VR Game Development Course",
          category: "Academy",
          description: "Frequent requests for VR game dev classes",
          suggested_offering: "Launch a 4-week weekend VR cohort",
          potential_impact: "high",
        }),
      });

      const res = await adminGapsPOST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.gap.id).toBe(2);
    });

    it("should allow admin to update gap status and save action notes", async () => {
      (prisma.ai_offering_gaps.update as jest.Mock).mockResolvedValue({
        id: 2,
        status: "planned",
        admin_notes: "Assigned lead instructor to develop syllabus for Q4.",
      });

      const req = new Request("http://localhost/api/admin/ai-service/gaps/2", {
        method: "PUT",
        body: JSON.stringify({
          status: "planned",
          admin_notes: "Assigned lead instructor to develop syllabus for Q4.",
        }),
      });

      const res = await adminGapsPUT(req, { params: { id: "2" } });
      expect(res.status).toBe(200);
      expect(prisma.ai_offering_gaps.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 2 },
          data: expect.objectContaining({
            status: "planned",
            admin_notes: "Assigned lead instructor to develop syllabus for Q4.",
          }),
        })
      );
    });

    it("should allow admin to delete an offering gap", async () => {
      (prisma.ai_offering_gaps.delete as jest.Mock).mockResolvedValue({ id: 2 });

      const req = new Request("http://localhost/api/admin/ai-service/gaps/2", {
        method: "DELETE",
      });

      const res = await adminGapsDELETE(req, { params: { id: "2" } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
