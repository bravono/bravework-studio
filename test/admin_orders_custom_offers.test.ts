import { GET as adminOrdersGET, PATCH as adminOrdersPATCH } from "@/app/api/admin/orders/route";
import { POST as customOffersPOST } from "@/app/api/admin/custom-offers/route";
import { GET as adminUsersGET } from "@/app/api/admin/users/route";
import { queryDatabase, withTransaction } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

jest.mock("@/lib/db");
jest.mock("@/lib/auth/admin-auth-guard");
jest.mock("@/lib/mailer", () => ({
  sendCustomOfferEmail: jest.fn().mockResolvedValue(true),
}));

describe("Admin Orders, Custom Offers & Users API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAdmin as jest.Mock).mockResolvedValue(null); // Admin verified
  });

  describe("Admin Orders Status Handling", () => {
    it("should return orders with status as string name", async () => {
      (queryDatabase as jest.Mock).mockResolvedValue([
        {
          id: 1,
          service: 2,
          status: "pending",
          paymentStatusId: 1,
          statusName: "pending",
          amount: 50000,
          amountPaid: 0,
          clientId: 10,
          clientName: "Jane Doe",
        },
        {
          id: 2,
          service: 1,
          status: "paid",
          paymentStatusId: 2,
          statusName: "paid",
          amount: 150000,
          amountPaid: 150000,
          clientId: 12,
          clientName: "John Smith",
        },
      ]);

      const req = new Request("http://localhost/api/admin/orders");
      const res = await adminOrdersGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].status).toBe("pending");
      expect(data[1].status).toBe("paid");
    });
  });

  describe("Custom Offers Creation in USD Dollars", () => {
    it("should accept custom offer amount and insert into custom_offers", async () => {
      const mockClient = {
        query: jest.fn().mockImplementation((queryText: string) => {
          if (queryText.includes("INSERT INTO custom_offers")) {
            return Promise.resolve({
              rows: [
                {
                  id: 101,
                  orderId: 5,
                  userId: 10,
                  offerAmount: 25000,
                  description: "Custom UI Design in USD",
                  expiresAt: new Date().toISOString(),
                },
              ],
            });
          }
          if (queryText.includes("SELECT first_name, last_name, email FROM users")) {
            return Promise.resolve({
              rows: [{ first_name: "Jane", last_name: "Doe", email: "jane@example.com" }],
            });
          }
          if (queryText.includes("SELECT name FROM payment_statuses")) {
            return Promise.resolve({
              rows: [{ name: "pending" }],
            });
          }
          return Promise.resolve({ rows: [] });
        }),
      };

      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockClient);
      });

      const req = new Request("http://localhost/api/admin/custom-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: 5,
          userId: 10,
          offerAmount: 25000,
          description: "Custom UI Design in USD",
        }),
      });

      const res = await customOffersPOST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.offerAmount).toBe(25000);
      expect(data.orderId).toBe(5);
    });
  });

  describe("Admin Users Complete Data Fetch", () => {
    it("should return all user fields including phone, company, bio, 2FA, and verification", async () => {
      (queryDatabase as jest.Mock).mockResolvedValue([
        {
          id: 1,
          user_id: 1,
          fullName: "Admin User",
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
          phone: "+123456789",
          companyName: "Bravework",
          bio: "Lead Admin",
          profilePictureUrl: "https://example.com/pic.jpg",
          emailVerified: true,
          isVerified: true,
          twoFactorEnabled: true,
          referralCode: "REF123",
          hearAboutUs: "Google",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z",
          roles: [{ roleName: "admin" }],
        },
      ]);

      const req = new Request("http://localhost/api/admin/users");
      const res = await adminUsersGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data[0].phone).toBe("+123456789");
      expect(data[0].companyName).toBe("Bravework");
      expect(data[0].twoFactorEnabled).toBe(true);
      expect(data[0].isVerified).toBe(true);
    });
  });
});
