import { PATCH as adminCoursePATCH } from "@/app/api/admin/courses/[courseId]/route";
import { POST as adminCoursePOST } from "@/app/api/admin/courses/route";
import { queryDatabase, withTransaction } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

jest.mock("@/lib/db");
jest.mock("@/lib/auth/admin-auth-guard");

describe("Admin Course Edit and Create API Robustness", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAdmin as jest.Mock).mockResolvedValue(null);
  });

  describe("PATCH /api/admin/courses/[courseId]", () => {
    it("should update a course when instructor is undefined without crashing on split", async () => {
      const mockExistingCourse = {
        course_id: 10,
        title: "Existing Title",
        price_in_kobo: 5000000,
        description: "Existing Description",
        start_date: "2026-03-01",
        end_date: "2026-04-01",
        instructor_id: 3,
        course_category_id: 1,
        is_active: true,
        is_published: true,
        max_students: 20,
        thumbnail_url: "https://example.com/thumb.jpg",
        level: "Beginner",
        language: "English",
        slug: "existing-title",
        content: "<p>Content</p>",
        excerpt: "Excerpt",
        is_for_kids: false,
        parent_course_id: null,
        duration: "4 weeks",
      };

      const mockClient = {
        query: jest.fn().mockImplementation((queryText: string, params: any[]) => {
          if (queryText.includes("SELECT * FROM courses WHERE course_id = $1")) {
            return { rows: [mockExistingCourse], rowCount: 1 };
          }
          if (queryText.includes("UPDATE courses SET")) {
            return { rowCount: 1 };
          }
          if (queryText.includes("DELETE FROM course_tools")) {
            return { rowCount: 0 };
          }
          if (queryText.includes("DELETE FROM course_tags")) {
            return { rowCount: 0 };
          }
          if (queryText.includes("DELETE FROM sessions")) {
            return { rowCount: 0 };
          }
          if (queryText.includes("INSERT INTO sessions")) {
            return { rowCount: 1 };
          }
          return { rows: [], rowCount: 0 };
        }),
      };

      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockClient);
      });

      const payload = {
        title: "Updated Title",
        price_in_kobo: 6000000,
        description: "Updated Description",
        // instructor is intentionally omitted/undefined
        sessions: [
          {
            options: [
              {
                optionNumber: 1,
                link: "https://meet.jit.si/test-1",
                label: "Morning",
                duration: 90,
                time: "2026-03-01T10:00:00",
              },
            ],
          },
        ],
      };

      const req = new Request("http://localhost/api/admin/courses/10", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await adminCoursePATCH(req, { params: { courseId: "10" } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.courseId).toBe("10");

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE courses SET"),
        expect.arrayContaining(["Updated Title", 3]) // retains existing instructor_id = 3
      );
    });

    it("should handle instructor name with single word gracefully", async () => {
      const mockExistingCourse = {
        course_id: 11,
        title: "Course 11",
        price_in_kobo: 4000000,
        instructor_id: 2,
        course_category_id: 1,
        thumbnail_url: "https://example.com/thumb.jpg",
      };

      const mockClient = {
        query: jest.fn().mockImplementation((queryText: string, params: any[]) => {
          if (queryText.includes("SELECT * FROM courses WHERE course_id = $1")) {
            return { rows: [mockExistingCourse], rowCount: 1 };
          }
          if (queryText.includes("SELECT instructor_id FROM instructors")) {
            return { rows: [{ instructor_id: 5 }], rowCount: 1 };
          }
          if (queryText.includes("UPDATE courses SET")) {
            return { rowCount: 1 };
          }
          if (queryText.includes("DELETE FROM course_tools") || queryText.includes("DELETE FROM course_tags")) {
            return { rowCount: 0 };
          }
          return { rows: [], rowCount: 0 };
        }),
      };

      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockClient);
      });

      const payload = {
        title: "Course 11 Updated",
        instructor: "Admin", // Single word instructor
        sessions: [],
      };

      const req = new Request("http://localhost/api/admin/courses/11", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await adminCoursePATCH(req, { params: { courseId: "11" } });
      expect(res.status).toBe(200);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE courses SET"),
        expect.arrayContaining([5])
      );
    });

    it("should sanitize dirty Flickr HTML thumbnail_url on update", async () => {
      const mockExistingCourse = {
        course_id: 12,
        title: "Course 12",
        instructor_id: 1,
        course_category_id: 1,
      };

      const mockClient = {
        query: jest.fn().mockImplementation((queryText: string) => {
          if (queryText.includes("SELECT * FROM courses WHERE course_id = $1")) {
            return { rows: [mockExistingCourse], rowCount: 1 };
          }
          if (queryText.includes("UPDATE courses SET")) {
            return { rowCount: 1 };
          }
          return { rows: [], rowCount: 0 };
        }),
      };

      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockClient);
      });

      const dirtyFlickrUrl =
        '"\\https://live.staticflickr.com/65535/55269372986_042d362ed0_b.jpg\\\\" width=\\1024\\ height=\\572\\ alt=\\Course\\"';

      const payload = {
        title: "Course 12 Updated",
        thumbnail_url: dirtyFlickrUrl,
        sessions: [],
      };

      const req = new Request("http://localhost/api/admin/courses/12", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await adminCoursePATCH(req, { params: { courseId: "12" } });
      expect(res.status).toBe(200);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE courses SET"),
        expect.arrayContaining([
          "https://live.staticflickr.com/65535/55269372986_042d362ed0_b.jpg",
        ])
      );
    });

    it("should return error if course to update does not exist", async () => {
      const mockClient = {
        query: jest.fn().mockImplementation(() => {
          return { rows: [], rowCount: 0 };
        }),
      };

      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockClient);
      });

      const req = new Request("http://localhost/api/admin/courses/999", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nonexistent Course", sessions: [] }),
      });

      const res = await adminCoursePATCH(req, { params: { courseId: "999" } });
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toContain("Course with ID 999 not found");
    });
  });

  describe("POST /api/admin/courses", () => {
    it("should fall back to default instructor if instructor is omitted or none", async () => {
      (queryDatabase as jest.Mock).mockResolvedValueOnce([
        { instructor_id: 7, first_name: "Default", last_name: "Instructor" },
      ]);

      const mockClient = {
        query: jest.fn().mockImplementation((queryText: string) => {
          if (queryText.includes("SELECT instructor_id FROM instructors")) {
            return { rows: [{ instructor_id: 7 }], rowCount: 1 };
          }
          if (queryText.includes("SELECT category_id FROM course_categories")) {
            return { rows: [{ category_id: 2 }], rowCount: 1 };
          }
          if (queryText.includes("INSERT INTO courses")) {
            return { rows: [{ course_id: 15 }], rowCount: 1 };
          }
          return { rows: [], rowCount: 0 };
        }),
      };

      (withTransaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockClient);
      });

      const payload = {
        title: "New Course",
        price: 20000,
        description: "New Course Description",
        instructor: "none",
        category: "Design",
        sessions: [
          {
            options: [
              {
                optionNumber: 1,
                duration: 60,
                link: "https://meet.jit.si/test",
                label: "Morning",
              },
            ],
          },
        ],
      };

      const req = new Request("http://localhost/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await adminCoursePOST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.courseId).toBe(15);
    });
  });
});
