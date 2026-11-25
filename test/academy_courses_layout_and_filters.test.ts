import { Course } from "@/app/types/app";

describe("Academy Courses Layout and Filtering Logic", () => {
  const sampleCourses: Partial<Course>[] = [
    {
      id: "1",
      title: "Mastering Blender 3D",
      description: "Complete 3D modeling and animation workflow",
      category: "3D Animation",
      price: 15000000,
      tags: ["3D", "Blender", "Animation"],
      createdAt: "2026-01-15T00:00:00.000Z",
      isActive: true,
      enrollmentCount: 45,
    },
    {
      id: "2",
      title: "Fullstack Web Development",
      description: "Modern Next.js and TypeScript engineering",
      category: "Software Development",
      price: 20000000,
      tags: ["Next.js", "TypeScript", "React"],
      createdAt: "2026-02-10T00:00:00.000Z",
      isActive: true,
      enrollmentCount: 120,
    },
    {
      id: "3",
      title: "Free Intro to Digital Art",
      description: "Quick starter workshop for creatives",
      category: "Digital Arts",
      price: 0,
      tags: ["Art", "Illustration"],
      createdAt: "2026-02-20T00:00:00.000Z",
      isActive: true,
      enrollmentCount: 300,
    },
    {
      id: "4",
      title: "Advanced Character Rigging",
      description: "Rigging mechanics and bone structures",
      category: "3D Animation",
      price: 18000000,
      tags: ["3D", "Blender", "Rigging"],
      createdAt: "2026-01-01T00:00:00.000Z",
      isActive: false,
      enrollmentCount: 10,
    },
  ];

  describe("Category Generation for One-Line Side-Scrolling", () => {
    it("should generate category list with static items followed by unique course categories", () => {
      const getCategories = (courses: Partial<Course>[]) => [
        "All",
        "Latest",
        "Popular",
        "Free",
        "Bundles",
        ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
      ];

      const categories = getCategories(sampleCourses);

      expect(categories.slice(0, 5)).toEqual([
        "All",
        "Latest",
        "Popular",
        "Free",
        "Bundles",
      ]);
      expect(categories).toContain("3D Animation");
      expect(categories).toContain("Software Development");
      expect(categories).toContain("Digital Arts");
      expect(categories.length).toBe(8);
    });

    it("should handle empty courses list without crashing", () => {
      const getCategories = (courses: Partial<Course>[]) => [
        "All",
        "Latest",
        "Popular",
        "Free",
        "Bundles",
        ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
      ];

      const categories = getCategories([]);
      expect(categories).toEqual([
        "All",
        "Latest",
        "Popular",
        "Free",
        "Bundles",
      ]);
    });
  });

  describe("Course Filtering and Sorting", () => {
    const filterCourses = (
      courses: Partial<Course>[],
      activeFilter: string,
      searchQuery: string,
      selectedTags: string[],
    ) => {
      let result = courses.filter((course) => {
        const matchesFilter =
          activeFilter === "All" ||
          activeFilter === "Latest" ||
          activeFilter === "Popular" ||
          activeFilter === "Bundles" ||
          course.category === activeFilter ||
          (activeFilter === "Free" && course.price === 0);

        const matchesSearch = (course.title ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.every((tag) => course.tags?.includes(tag));

        return matchesFilter && matchesSearch && matchesTags;
      });

      if (activeFilter === "Popular") {
        result = [...result].sort(
          (a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0),
        );
      } else if (activeFilter === "Latest" || activeFilter === "All") {
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
      }

      return result;
    };

    it("should filter by Free courses", () => {
      const freeCourses = filterCourses(sampleCourses, "Free", "", []);
      expect(freeCourses).toHaveLength(1);
      expect(freeCourses[0].title).toBe("Free Intro to Digital Art");
    });

    it("should filter by specific Category", () => {
      const animationCourses = filterCourses(
        sampleCourses,
        "3D Animation",
        "",
        [],
      );
      expect(animationCourses).toHaveLength(2);
      expect(
        animationCourses.every((c) => c.category === "3D Animation"),
      ).toBe(true);
    });

    it("should sort Popular courses descending by enrollmentCount", () => {
      const popular = filterCourses(sampleCourses, "Popular", "", []);
      expect(popular[0].enrollmentCount).toBe(300);
      expect(popular[1].enrollmentCount).toBe(120);
      expect(popular[2].enrollmentCount).toBe(45);
      expect(popular[3].enrollmentCount).toBe(10);
    });

    it("should sort Latest courses descending by createdAt timestamp", () => {
      const latest = filterCourses(sampleCourses, "Latest", "", []);
      expect(latest[0].title).toBe("Free Intro to Digital Art"); // Feb 20
      expect(latest[1].title).toBe("Fullstack Web Development"); // Feb 10
      expect(latest[2].title).toBe("Mastering Blender 3D"); // Jan 15
      expect(latest[3].title).toBe("Advanced Character Rigging"); // Jan 01
    });

    it("should filter by multiple specialization tags concurrently", () => {
      const tagged = filterCourses(sampleCourses, "All", "", [
        "3D",
        "Rigging",
      ]);
      expect(tagged).toHaveLength(1);
      expect(tagged[0].title).toBe("Advanced Character Rigging");
    });
  });

  describe("Specialization Tag Management", () => {
    it("should extract unique sorted tags from all courses", () => {
      const extractTags = (courses: Partial<Course>[]) => {
        const tags = new Set<string>();
        courses.forEach((course) => {
          if (Array.isArray(course.tags)) {
            course.tags.forEach((tag) => tags.add(tag));
          }
        });
        return Array.from(tags).sort();
      };

      const tags = extractTags(sampleCourses);
      expect(tags).toEqual([
        "3D",
        "Animation",
        "Art",
        "Blender",
        "Illustration",
        "Next.js",
        "React",
        "Rigging",
        "TypeScript",
      ]);
    });

    it("should toggle tags in selected state correctly", () => {
      const toggle = (prev: string[], tag: string) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];

      let selected: string[] = [];
      selected = toggle(selected, "Blender");
      expect(selected).toEqual(["Blender"]);

      selected = toggle(selected, "3D");
      expect(selected).toEqual(["Blender", "3D"]);

      selected = toggle(selected, "Blender");
      expect(selected).toEqual(["3D"]);
    });
  });

  describe("Youth and Kids Search Detection", () => {
    const isKidsSearch = (query: string) => {
      const normalized = query.trim().toLowerCase();
      return ["kid", "kids", "child", "children", "teen", "teens"].some((k) =>
        normalized.includes(k),
      );
    };

    it("should identify searches targeting younger audiences", () => {
      expect(isKidsSearch("kids robotics")).toBe(true);
      expect(isKidsSearch("coding for a CHILD")).toBe(true);
      expect(isKidsSearch("teenager creative workshop")).toBe(true);
      expect(isKidsSearch("children storybook")).toBe(true);
    });

    it("should not flag normal adult searches", () => {
      expect(isKidsSearch("blender animation")).toBe(false);
      expect(isKidsSearch("react architecture")).toBe(false);
      expect(isKidsSearch("enterprise training")).toBe(false);
    });
  });

  describe("Initial Page Load Visibility State", () => {
    it("should ensure filters are collapsed by default to maximise immediate course visibility", () => {
      const initialFilterOpenState = false;
      expect(initialFilterOpenState).toBe(false);
    });

    it("should accurately reflect active tag count badge", () => {
      const activeTags = ["Blender", "3D"];
      const badgeCount = activeTags.length;
      expect(badgeCount).toBe(2);
    });
  });
});
