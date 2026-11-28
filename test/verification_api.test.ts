import { POST as userVerifyPOST } from "@/app/api/user/verify/route";
import { POST as adminVerifyPOST } from "@/app/api/admin/users/[id]/verify/route";
import { getServerSession } from "next-auth/next";
import { queryDatabase } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { put } from "@vercel/blob";

jest.mock("next-auth/next");
jest.mock("@/lib/db");
jest.mock("@/lib/auth/admin-auth-guard");
jest.mock("@vercel/blob");

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

    it("should return 200 and update database if authorized with files", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 1 },
      });
      (queryDatabase as jest.Mock).mockResolvedValue([{ user_id: 1 }]);
      (put as jest.Mock).mockResolvedValue({
        url: "https://blob.url/test.jpg",
      });

      const formData = new FormData();
      formData.append("idType", "NIN");
      formData.append(
        "idCardFront",
        new Blob(["test"], { type: "image/jpeg" }) as any,
      );
      formData.append(
        "selfieWithId",
        new Blob(["test"], { type: "image/jpeg" }) as any,
      );

      const req = new Request("http://localhost/api/user/verify", {
        method: "POST",
        body: formData,
      });

      const res = await userVerifyPOST(req);
      expect(res.status).toBe(200);
      expect(put).toHaveBeenCalledTimes(2);
      expect(queryDatabase).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users"),
        expect.arrayContaining(["NIN", "https://blob.url/test.jpg", 1]),
      );
    });
  });

  describe("POST /api/admin/users/[id]/verify", () => {
    it("should return guard response if not admin", async () => {
      const guardRes = { status: 403 };
      (verifyAdmin as jest.Mock).mockResolvedValue(guardRes);
      const req = new Request("http://localhost/api/admin/users/1/verify", {
        method: "POST",
        body: JSON.stringify({ action: "approve" }),
      });
      const res = await adminVerifyPOST(req, { params: { id: "1" } });
      expect(res).toBe(guardRes);
    });

    it("should approve verification if admin and action is approve", async () => {
      (verifyAdmin as jest.Mock).mockResolvedValue(null);
      (queryDatabase as jest.Mock).mockResolvedValue([]);
      const req = new Request("http://localhost/api/admin/users/1/verify", {
        method: "POST",
        body: JSON.stringify({ action: "approve" }),
      });
      const res = await adminVerifyPOST(req, { params: { id: "1" } });
      expect(res.status).toBe(200);
      expect(queryDatabase).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users SET is_verified = TRUE"),
        [1],
      );
    });
  });
});
