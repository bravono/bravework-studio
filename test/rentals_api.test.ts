import { POST as generateDescriptionPOST } from "@/app/api/rentals/generate-description/route";
import { POST as userRentalsPOST, GET as userRentalsGET } from "@/app/api/user/rentals/route";
import { PUT as userRentalDetailsPUT, GET as userRentalDetailsGET } from "@/app/api/user/rentals/[id]/route";
import { GET as publicRentalsGET } from "@/app/api/rentals/route";
import { GET as adminStatsGET } from "@/app/api/admin/stats/route";
import { GET as adminRentalsGET } from "@/app/api/admin/rentals/route";
import { getServerSession } from "next-auth/next";
import { queryDatabase, withTransaction } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

jest.mock("next-auth/next");
jest.mock("@/lib/db");
jest.mock("@google/generative-ai");
jest.mock("@/lib/auth/admin-auth-guard");

describe("Rentals and AI API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/rentals/generate-description", () => {
    it("should successfully generate description on primary model", async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: { text: () => "This is a premium high-end rendering PC." },
      });
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      });
      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
      }));

      const req = new Request("http://localhost/api/rentals/generate-description", {
        method: "POST",
        body: JSON.stringify({
          deviceName: "Rendering PC",
          processor: "Core i9",
          ram: "64GB",
        }),
      });

      const res = await generateDescriptionPOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.description).toBe("This is a premium high-end rendering PC.");
      expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: "gemini-2.5-flash" });
    });

    it("should fallback to secondary model if primary model throws error", async () => {
      const mockGenerateContent = jest.fn()
        .mockRejectedValueOnce(new Error("Model not found"))
        .mockResolvedValueOnce({
          response: { text: () => "Fallback generated description." },
        });

      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      });
      (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
      }));

      const req = new Request("http://localhost/api/rentals/generate-description", {
        method: "POST",
        body: JSON.stringify({
          deviceName: "Rendering PC",
          processor: "Core i9",
          ram: "64GB",
        }),
      });

      const res = await generateDescriptionPOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.description).toBe("Fallback generated description.");
      expect(mockGetGenerativeModel).toHaveBeenNthCalledWith(1, { model: "gemini-2.5-flash" });
      expect(mockGetGenerativeModel).toHaveBeenNthCalledWith(2, { model: "gemini-2.0-flash" });
    });
  });

  describe("User Listings Authorization", () => {
    it("should allow listing creation when user is authenticated (verification is not checked here)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 42 },
      });

      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ rental_id: 101 }],
      });
      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({ query: mockQuery });
      });

      const req = new Request("http://localhost/api/user/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceType: "PC",
          deviceName: "Developer Workstation",
          ram: "32GB",
          storage: "1TB SSD",
          locationCity: "Lagos",
        }),
      });

      const res = await userRentalsPOST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toBe(101);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO rentals"),
        expect.arrayContaining(["Developer Workstation", "32GB", "1TB SSD"])
      );
    });
  });

  describe("PUT /api/user/rentals/[id]", () => {
    it("should update rental and synchronize images Array", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 42 },
      });

      (queryDatabase as jest.Mock).mockResolvedValue([{ user_id: 42 }]);

      const mockQuery = jest.fn().mockResolvedValue({});
      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({ query: mockQuery });
      });

      const req = new Request("http://localhost/api/user/rentals/101", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: "Updated Workstation",
          storage: "2TB SSD",
          images: ["https://blob.url/img1.jpg", "https://blob.url/img2.jpg"],
        }),
      });

      const res = await userRentalDetailsPUT(req, { params: { id: "101" } });
      expect(res.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE rentals SET"),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM rental_images WHERE rental_id = $1",
        ["101"]
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO rental_images"),
        ["101", null, null, "https://blob.url/img1.jpg"]
      );
    });
  });

  describe("Admin Dashboard Stats and Rentals", () => {
    it("should fetch pendingRentalsCount in admin stats", async () => {
      (verifyAdmin as jest.Mock).mockResolvedValue(null);
      (queryDatabase as jest.Mock)
        .mockResolvedValueOnce([{ count: "5" }]) // totalOrders
        .mockResolvedValueOnce([{ sum: "500000" }]) // totalRevenue
        .mockResolvedValueOnce([{ count: "2" }]) // pendingOrders
        .mockResolvedValueOnce([{ count: "10" }]) // totalUsers
        .mockResolvedValueOnce([{ count: "1" }]) // pendingJobApplications
        .mockResolvedValueOnce([{ count: "4" }]) // activeCoupons
        .mockResolvedValueOnce([{ count: "3" }]) // unReadNotifications
        .mockResolvedValueOnce([{ count: "8" }]); // pendingRentalsCount

      const req = new Request("http://localhost/api/admin/stats");
      const res = await adminStatsGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pendingRentalsCount).toBe(8);
    });

    it("should fetch admin rentals list with correctly structured images object", async () => {
      (verifyAdmin as jest.Mock).mockResolvedValue(null);
      const mockRentals = [
        {
          id: 1,
          deviceName: "High End Rig",
          images: [
            {
              file_name: "rig.jpg",
              file_size: 1024,
              file_url: "https://blob.url/rig.jpg",
            },
          ],
        },
      ];
      (queryDatabase as jest.Mock).mockResolvedValue(mockRentals);

      const req = new Request("http://localhost/api/admin/rentals?filter=pending");
      const res = await adminRentalsGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data[0].images[0].file_url).toBe("https://blob.url/rig.jpg");
      expect(queryDatabase).toHaveBeenCalledWith(
        expect.stringContaining('image_url AS "file_url"'),
        expect.any(Array)
      );
    });
  });
});
