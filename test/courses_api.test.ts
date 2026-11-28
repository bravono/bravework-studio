import { GET as coursesGET } from "@/app/api/courses/route";
import { GET as courseCategoriesGET } from "@/app/api/course-categories/route";
import { GET as tagsGET } from "@/app/api/tags/route";
import { GET as toolsGET } from "@/app/api/tools/route";
import { queryDatabase } from "@/lib/db";

jest.mock("@/lib/db");

describe("Courses, Categories, Tags, and Tools Dynamic API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/courses", () => {
    it("should return 200 with parsed courses and no-store cache headers", async () => {
      const mockDbCourses = [
        {
          id: 1,
          title: "Introduction to 3D Animation",
          description: "Learn Blender from scratch",
          createdAt: "2026-01-01T00:00:00.000Z",
          isActive: true,
          tags: '["Blender", "3D"]',
          category: "Animation",
        },
        {
          id: 2,
          title: "Fullstack Web Development",
          description: "Next.js and Node.js",
          createdAt: "2026-01-02T00:00:00.000Z",
          isActive: true,
          tags: ["Next.js", "React"],
          category: "Development",
        },
      ];

      (queryDatabase as jest.Mock).mockResolvedValueOnce(mockDbCourses);

      const req = new Request("http://localhost/api/courses", { method: "GET" });
      const res = await coursesGET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");

      const data = await res.json();
      expect(data).toHaveLength(2);
      expect(data[0].tags).toEqual(["Blender", "3D"]);
      expect(data[1].tags).toEqual(["Next.js", "React"]);
      expect(queryDatabase).toHaveBeenCalledWith(
        expect.stringContaining("WHERE c.is_published = true")
      );
    });

    it("should handle empty course results", async () => {
      (queryDatabase as jest.Mock).mockResolvedValueOnce([]);

      const req = new Request("http://localhost/api/courses", { method: "GET" });
      const res = await coursesGET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
      const data = await res.json();
      expect(data).toEqual([]);
    });

    it("should return 500 when database query fails", async () => {
      (queryDatabase as jest.Mock).mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const req = new Request("http://localhost/api/courses", { method: "GET" });
      const res = await coursesGET(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.message).toBe("Error fetching courses");
    });
  });

  describe("GET /api/course-categories", () => {
    it("should return 200 with categories and no-store cache headers", async () => {
      const mockCategories = [{ name: "3D Design" }, { name: "Web Development" }];
      (queryDatabase as jest.Mock).mockResolvedValueOnce(mockCategories);

      const req = new Request("http://localhost/api/course-categories", { method: "GET" });
      const res = await courseCategoriesGET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
      const data = await res.json();
      expect(data).toEqual(mockCategories);
    });

    it("should return 500 when categories database query fails", async () => {
      (queryDatabase as jest.Mock).mockRejectedValueOnce(
        new Error("Categories lookup failed")
      );

      const req = new Request("http://localhost/api/course-categories", { method: "GET" });
      const res = await courseCategoriesGET(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Categories lookup failed");
    });
  });

  describe("GET /api/tags", () => {
    it("should return 200 with tags and no-store cache headers", async () => {
      const mockTags = [
        { id: 1, name: "Animation" },
        { id: 2, name: "Modeling" },
      ];
      (queryDatabase as jest.Mock).mockResolvedValueOnce(mockTags);

      const res = await tagsGET();

      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
      const data = await res.json();
      expect(data).toEqual(mockTags);
    });

    it("should return 500 when tags query fails", async () => {
      (queryDatabase as jest.Mock).mockRejectedValueOnce(new Error("Tags DB error"));

      const res = await tagsGET();

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Tags DB error");
    });
  });

  describe("GET /api/tools", () => {
    it("should return 200 with tools and no-store cache headers", async () => {
      const mockTools = [
        { id: 1, name: "Blender" },
        { id: 2, name: "Maya" },
      ];
      (queryDatabase as jest.Mock).mockResolvedValueOnce(mockTools);

      const res = await toolsGET();

      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
      const data = await res.json();
      expect(data).toEqual(mockTools);
    });

    it("should return 500 when tools query fails", async () => {
      (queryDatabase as jest.Mock).mockRejectedValueOnce(new Error("Tools DB error"));

      const res = await toolsGET();

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Tools DB error");
    });
  });
});
