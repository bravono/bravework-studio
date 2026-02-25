import { POST as userVerifyPOST } from "@/app/api/user/verify/route";
import { POST as adminVerifyPOST } from "@/app/api/admin/users/[id]/verify/route";
import { getServerSession } from "next-auth/next";
import { queryDatabase } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { NextResponse } from "next/server";

jest.mock("next-auth/next");
jest.mock("@/lib/db");
jest.mock("@/lib/auth/admin-auth-guard");
jest.mock("next/server", () => {
  const actual = jest.requireActual("next/server");
  return {
    ...actual,
    NextResponse: {
      json: jest.fn((data, init) => {
        return {
          status: init?.status || 200,
          json: async () => data,
        };
      }),
    },
  };
});

describe("Identity Verification API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/user/verify", () => {
    it("should return 401 if unauthorized", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      const req = new Request("http://localhost/api/user/verify", {
        method: "POST",
      });
      const res = await userVerifyPOST(req);
      expect(res.status).toBe(401);
    });

    it("should return 200 and update database if authorized", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "user-1" },
      });
      (queryDatabase as jest.Mock).mockResolvedValue([]);
      const req = new Request("http://localhost/api/user/verify", {
        method: "POST",
      });
      const res = await userVerifyPOST(req);
      expect(res.status).toBe(200);
      expect(queryDatabase).toHaveBeenCalledWith(
        expect.stringContaining(
          "UPDATE users SET verification_submitted_at = NOW()",
        ),
        ["user-1"],
      );
    });
  });

  describe("POST /api/admin/users/[id]/verify", () => {
    it("should return guard response if not admin", async () => {
      const guardRes = { status: 403 };
      (verifyAdmin as jest.Mock).mockResolvedValue(guardRes);
      const req = new Request(
        "http://localhost/api/admin/users/user-1/verify",
        {
          method: "POST",
          body: JSON.stringify({ action: "approve" }),
        },
      );
      const res = await adminVerifyPOST(req, { params: { id: "user-1" } });
      expect(res).toBe(guardRes);
    });

    it("should approve verification if admin and action is approve", async () => {
      (verifyAdmin as jest.Mock).mockResolvedValue(null);
      (queryDatabase as jest.Mock).mockResolvedValue([]);
      const req = new Request(
        "http://localhost/api/admin/users/user-1/verify",
        {
          method: "POST",
          body: JSON.stringify({ action: "approve" }),
        },
      );
      const res = await adminVerifyPOST(req, { params: { id: "user-1" } });
      expect(res.status).toBe(200);
      expect(queryDatabase).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users SET is_verified = TRUE"),
        ["user-1"],
      );
    });

    it("should reject verification if admin and action is reject", async () => {
      (verifyAdmin as jest.Mock).mockResolvedValue(null);
      (queryDatabase as jest.Mock).mockResolvedValue([]);
      const req = new Request(
        "http://localhost/api/admin/users/user-1/verify",
        {
          method: "POST",
          body: JSON.stringify({ action: "reject" }),
        },
      );
      const res = await adminVerifyPOST(req, { params: { id: "user-1" } });
      expect(res.status).toBe(200);
      expect(queryDatabase).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users SET is_verified = FALSE"),
        ["user-1"],
      );
    });
  });
});
