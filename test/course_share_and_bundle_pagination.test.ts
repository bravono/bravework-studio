import {
  resolveShareUrl,
  createCourseShareData,
  createBundleShareData,
} from "@/lib/utils/share";

describe("Course and Bundle Sharing Utilities", () => {
  const dummyOrigin = "https://braveworkstudio.com";

  describe("resolveShareUrl", () => {
    it("should return absolute URLs unchanged", () => {
      expect(resolveShareUrl("https://example.com/course/1")).toBe(
        "https://example.com/course/1",
      );
      expect(resolveShareUrl("http://localhost:3000/bundles")).toBe(
        "http://localhost:3000/bundles",
      );
    });

    it("should prepend origin to relative paths with leading slash", () => {
      const url = resolveShareUrl("/academy/courses/10", dummyOrigin);
      expect(url).toBe("https://braveworkstudio.com/academy/courses/10");
    });

    it("should prepend origin and slash to relative paths without leading slash", () => {
      const url = resolveShareUrl("academy/bundles?bundleId=5", dummyOrigin);
      expect(url).toBe(
        "https://braveworkstudio.com/academy/bundles?bundleId=5",
      );
    });

    it("should fall back to default origin when no path is provided and window is undefined", () => {
      const url = resolveShareUrl(undefined, dummyOrigin);
      expect(url).toBe("https://braveworkstudio.com");
    });
  });

  describe("createCourseShareData", () => {
    it("should format single course share payload correctly", () => {
      const payload = createCourseShareData({
        courseId: 42,
        title: "3D Animation Masterclass",
        description: "Comprehensive 3D animation principles and workflow.",
        origin: dummyOrigin,
      });

      expect(payload.title).toBe(
        "3D Animation Masterclass | Bravework Studio Academy",
      );
      expect(payload.text).toBe(
        "Comprehensive 3D animation principles and workflow.",
      );
      expect(payload.url).toBe(
        "https://braveworkstudio.com/academy/courses/42",
      );
    });

    it("should strip course- prefix from courseId if passed", () => {
      const payload = createCourseShareData({
        courseId: "course-101",
        title: "Intro to Blender",
        origin: dummyOrigin,
      });

      expect(payload.url).toBe(
        "https://braveworkstudio.com/academy/courses/101",
      );
    });

    it("should truncate long descriptions exceeding 150 characters", () => {
      const longDescription =
        "This is an exceptionally comprehensive and extensive course covering every single facet of modern creative design, digital rendering, shader creation, lightning, and character modeling.";
      const payload = createCourseShareData({
        courseId: 7,
        title: "Full Stack Design",
        description: longDescription,
        origin: dummyOrigin,
      });

      expect(payload.text?.length).toBeLessThanOrEqual(150);
      expect(payload.text?.endsWith("...")).toBe(true);
    });

    it("should provide fallback text when description is missing", () => {
      const payload = createCourseShareData({
        courseId: 9,
        title: "VFX Fundamentals",
        origin: dummyOrigin,
      });

      expect(payload.text).toBe(
        "Check out VFX Fundamentals at Bravework Studio Academy",
      );
    });
  });

  describe("createBundleShareData", () => {
    it("should format bundle share payload with course count", () => {
      const payload = createBundleShareData({
        bundleId: 3,
        title: "Blender 3D Pro Path",
        courseCount: 3,
        description: "Complete pipeline bundle for young 3D artists.",
        origin: dummyOrigin,
      });

      expect(payload.title).toBe(
        "Blender 3D Pro Path (3 Courses) | Bravework Studio Academy",
      );
      expect(payload.text).toBe(
        "Complete pipeline bundle for young 3D artists.",
      );
      expect(payload.url).toBe(
        "https://braveworkstudio.com/academy/bundles?bundleId=3",
      );
    });

    it("should strip bundle- prefix from bundleId if passed", () => {
      const payload = createBundleShareData({
        bundleId: "bundle-88",
        title: "Unreal Engine Track",
        origin: dummyOrigin,
      });

      expect(payload.url).toBe(
        "https://braveworkstudio.com/academy/bundles?bundleId=88",
      );
    });

    it("should provide default text when bundle description is omitted", () => {
      const payload = createBundleShareData({
        bundleId: 15,
        title: "Game Dev Pathway",
        origin: dummyOrigin,
      });

      expect(payload.text).toContain("Game Dev Pathway");
      expect(payload.text).toContain("bundled learning path");
    });
  });
});

describe("Bundle Page Pagination Logic", () => {
  const BUNDLES_PER_PAGE = 4;

  const mockBundles = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    title: `Bundle ${i + 1}`,
    bundleCourses: [
      { id: (i + 1) * 10 + 1, title: `Course ${(i + 1) * 10 + 1}` },
      { id: (i + 1) * 10 + 2, title: `Course ${(i + 1) * 10 + 2}` },
      { id: (i + 1) * 10 + 3, title: `Course ${(i + 1) * 10 + 3}` },
      { id: (i + 1) * 10 + 4, title: `Course ${(i + 1) * 10 + 4}` },
    ],
  }));

  const paginate = <T>(items: T[], page: number, perPage: number): T[] => {
    const startIndex = (page - 1) * perPage;
    return items.slice(startIndex, startIndex + perPage);
  };

  it("should calculate total pages correctly for various bundle counts", () => {
    expect(Math.ceil(0 / BUNDLES_PER_PAGE)).toBe(0);
    expect(Math.ceil(1 / BUNDLES_PER_PAGE)).toBe(1);
    expect(Math.ceil(4 / BUNDLES_PER_PAGE)).toBe(1);
    expect(Math.ceil(5 / BUNDLES_PER_PAGE)).toBe(2);
    expect(Math.ceil(8 / BUNDLES_PER_PAGE)).toBe(2);
    expect(Math.ceil(11 / BUNDLES_PER_PAGE)).toBe(3);
  });

  it("should return the first 4 bundles on page 1", () => {
    const page1 = paginate(mockBundles, 1, BUNDLES_PER_PAGE);
    expect(page1).toHaveLength(4);
    expect(page1[0].id).toBe(1);
    expect(page1[3].id).toBe(4);
  });

  it("should return bundles 5 through 8 on page 2", () => {
    const page2 = paginate(mockBundles, 2, BUNDLES_PER_PAGE);
    expect(page2).toHaveLength(4);
    expect(page2[0].id).toBe(5);
    expect(page2[3].id).toBe(8);
  });

  it("should return remaining 3 bundles on page 3", () => {
    const page3 = paginate(mockBundles, 3, BUNDLES_PER_PAGE);
    expect(page3).toHaveLength(3);
    expect(page3[0].id).toBe(9);
    expect(page3[2].id).toBe(11);
  });

  it("should return empty array for out of range page numbers", () => {
    const page4 = paginate(mockBundles, 4, BUNDLES_PER_PAGE);
    expect(page4).toHaveLength(0);
  });

  describe("Deep Link Bundle Page Resolution", () => {
    const resolveTargetPage = (
      bundles: { id: number | string }[],
      targetId: string,
      perPage: number,
    ): number | null => {
      const index = bundles.findIndex(
        (b) => String(b.id) === targetId || `bundle-${b.id}` === targetId,
      );
      if (index === -1) return null;
      return Math.floor(index / perPage) + 1;
    };

    it("should resolve bundle 1 to page 1", () => {
      expect(resolveTargetPage(mockBundles, "1", BUNDLES_PER_PAGE)).toBe(1);
    });

    it("should resolve bundle 6 to page 2", () => {
      expect(resolveTargetPage(mockBundles, "6", BUNDLES_PER_PAGE)).toBe(2);
    });

    it("should resolve bundle 10 to page 3", () => {
      expect(resolveTargetPage(mockBundles, "10", BUNDLES_PER_PAGE)).toBe(3);
    });

    it("should handle bundle- prefixed id", () => {
      expect(
        resolveTargetPage(mockBundles, "bundle-7", BUNDLES_PER_PAGE),
      ).toBe(2);
    });

    it("should return null when target bundle is not found", () => {
      expect(
        resolveTargetPage(mockBundles, "999", BUNDLES_PER_PAGE),
      ).toBeNull();
    });
  });

  describe("Course Preview Limit Within Bundle Card", () => {
    const COURSES_PER_BUNDLE_PREVIEW = 3;

    it("should show preview slice when not expanded", () => {
      const bundle = mockBundles[0];
      const isExpanded = false;
      const visibleCourses = isExpanded
        ? bundle.bundleCourses
        : bundle.bundleCourses.slice(0, COURSES_PER_BUNDLE_PREVIEW);

      expect(visibleCourses).toHaveLength(3);
      expect(bundle.bundleCourses.length - COURSES_PER_BUNDLE_PREVIEW).toBe(1);
    });

    it("should show all courses when expanded", () => {
      const bundle = mockBundles[0];
      const isExpanded = true;
      const visibleCourses = isExpanded
        ? bundle.bundleCourses
        : bundle.bundleCourses.slice(0, COURSES_PER_BUNDLE_PREVIEW);

      expect(visibleCourses).toHaveLength(4);
    });
  });
});
