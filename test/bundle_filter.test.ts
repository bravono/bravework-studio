import {
  BundleWithCourses,
  getBundleTags,
  getBundleCategories,
  getAllBundleTags,
  getAllBundleCategories,
  filterBundles,
} from "@/lib/utils/bundleFilter";
import { Course } from "@/app/types/app";

describe("Bundle Filter Utilities", () => {
  const mockCourseA: Course = {
    id: 101,
    title: "Intro to 3D Modeling",
    description: "Learn foundational 3D modeling with Blender",
    category: "3D Animation",
    price: 100000,
    tags: ["Blender", "3D Modeling", "Beginner Friendly"],
    createdAt: new Date().toISOString(),
    isActive: true,
    startDate: "",
    endDate: "",
    maxStudents: 20,
    thumbnailUrl: "",
    level: "Beginner",
    language: "English",
  };

  const mockCourseB: Course = {
    id: 102,
    title: "Advanced 3D Animation Workflows",
    description: "Master character animation and rendering",
    category: "3D Animation",
    price: 150000,
    tags: ["Blender", "3D Animation", "Character Design"],
    createdAt: new Date().toISOString(),
    isActive: true,
    startDate: "",
    endDate: "",
    maxStudents: 20,
    thumbnailUrl: "",
    level: "Intermediate",
    language: "English",
  };

  const mockCourseC: Course = {
    id: 201,
    title: "Full-Stack Web Development Foundations",
    description: "Modern JavaScript and React architecture",
    category: "Software Development",
    price: 200000,
    tags: ["Web Development", "Frontend", "Full-Stack"],
    createdAt: new Date().toISOString(),
    isActive: true,
    startDate: "",
    endDate: "",
    maxStudents: 20,
    thumbnailUrl: "",
    level: "Beginner",
    language: "English",
  };

  const mockCourseD: Course = {
    id: 202,
    title: "Backend API and Database Engineering",
    description: "Node.js, PostgreSQL and scalable server systems",
    category: "Software Development",
    price: 250000,
    tags: ["Web Development", "Backend", "Full-Stack"],
    createdAt: new Date().toISOString(),
    isActive: true,
    startDate: "",
    endDate: "",
    maxStudents: 20,
    thumbnailUrl: "",
    level: "Advanced",
    language: "English",
  };

  const mockBundle3D: BundleWithCourses = {
    ...mockCourseA,
    id: 1001,
    title: "Complete 3D Animation Master Bundle",
    description: "Go from beginner to advanced 3D artist using Blender",
    category: "3D Animation",
    tags: ["3D Animation", "Blender"],
    bundleCourses: [mockCourseA, mockCourseB],
  };

  const mockBundleWeb: BundleWithCourses = {
    ...mockCourseC,
    id: 2001,
    title: "Full-Stack SaaS Engineering Bundle",
    description: "Build, launch, and monetize web apps from scratch",
    category: "Software Development",
    tags: ["Web Development", "Full-Stack"],
    bundleCourses: [mockCourseC, mockCourseD],
  };

  const sampleBundles: BundleWithCourses[] = [mockBundle3D, mockBundleWeb];

  describe("getBundleTags", () => {
    it("aggregates and deduplicates tags from root and child courses", () => {
      const tags = getBundleTags(mockBundle3D);
      expect(tags).toEqual([
        "3D Animation",
        "3D Modeling",
        "Beginner Friendly",
        "Blender",
        "Character Design",
      ]);
    });

    it("handles bundle with empty or non-array tags gracefully", () => {
      const emptyBundle: BundleWithCourses = {
        ...mockCourseA,
        tags: undefined as unknown as string[],
        bundleCourses: [
          { ...mockCourseA, tags: undefined as unknown as string[] },
        ],
      };
      expect(getBundleTags(emptyBundle)).toEqual([]);
    });
  });

  describe("getBundleCategories", () => {
    it("extracts unique categories from bundle root and courses", () => {
      const cats = getBundleCategories(mockBundleWeb);
      expect(cats).toEqual(["Software Development"]);
    });

    it("handles bundles where child courses have differing categories", () => {
      const mixedBundle: BundleWithCourses = {
        ...mockCourseA,
        category: "3D Animation",
        bundleCourses: [
          { ...mockCourseA, category: "3D Animation" },
          { ...mockCourseC, category: "Software Development" },
        ],
      };
      const cats = getBundleCategories(mixedBundle);
      expect(cats).toContain("3D Animation");
      expect(cats).toContain("Software Development");
    });
  });

  describe("getAllBundleTags and getAllBundleCategories", () => {
    it("gathers all unique tags across all provided bundles", () => {
      const allTags = getAllBundleTags(sampleBundles);
      expect(allTags).toContain("Blender");
      expect(allTags).toContain("Full-Stack");
      expect(allTags).toContain("Web Development");
      expect(allTags).toContain("3D Modeling");
    });

    it("gathers all unique categories across all provided bundles", () => {
      const allCategories = getAllBundleCategories(sampleBundles);
      expect(allCategories).toEqual(["3D Animation", "Software Development"]);
    });
  });

  describe("filterBundles", () => {
    it("returns all bundles when default filter options are supplied", () => {
      const result = filterBundles(sampleBundles, {});
      expect(result.length).toBe(2);
    });

    it("filters bundles by exact category", () => {
      const result = filterBundles(sampleBundles, { category: "3D Animation" });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1001);
    });

    it("ignores category filter when 'All' is selected", () => {
      const result = filterBundles(sampleBundles, { category: "All" });
      expect(result.length).toBe(2);
    });

    it("filters bundles by single tag", () => {
      const result = filterBundles(sampleBundles, {
        selectedTags: ["Blender"],
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1001);
    });

    it("filters bundles by multiple tags using logical AND", () => {
      const result = filterBundles(sampleBundles, {
        selectedTags: ["Blender", "Character Design"],
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1001);

      const nonMatching = filterBundles(sampleBundles, {
        selectedTags: ["Blender", "Full-Stack"],
      });
      expect(nonMatching.length).toBe(0);
    });

    it("searches by bundle title", () => {
      const result = filterBundles(sampleBundles, {
        searchQuery: "SaaS",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2001);
    });

    it("searches by category name in search box", () => {
      const result = filterBundles(sampleBundles, {
        searchQuery: "Software Development",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2001);
    });

    it("searches by tag name in search box", () => {
      const result = filterBundles(sampleBundles, {
        searchQuery: "Blender",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1001);
    });

    it("searches by child course title within bundle", () => {
      const result = filterBundles(sampleBundles, {
        searchQuery: "Database Engineering",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2001);
    });

    it("combines category, tag, and search query filters correctly", () => {
      const result = filterBundles(sampleBundles, {
        category: "Software Development",
        selectedTags: ["Full-Stack"],
        searchQuery: "SaaS",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2001);
    });

    it("returns empty array when search query matches nothing", () => {
      const result = filterBundles(sampleBundles, {
        searchQuery: "NonExistentKeywordXYZ",
      });
      expect(result.length).toBe(0);
    });

    it("handles whitespace in search query without failing", () => {
      const result = filterBundles(sampleBundles, {
        searchQuery: "   blender   ",
      });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1001);
    });
  });
});
