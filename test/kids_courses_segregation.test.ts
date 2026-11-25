import { Course } from "@/app/types/app";

describe("Kids Courses Segregation and Cross-Linking Logic", () => {
  const mixedCatalog: Partial<Course>[] = [
    {
      id: "1",
      title: "3D Animation Training for Kids",
      description: "Fun introductory 3D modeling with Blender for children",
      isForKids: true,
      category: "3D Animation",
      price: 250000,
    },
    {
      id: "2",
      title: "Fullstack Web Engineering",
      description: "Production Next.js and TypeScript architecture",
      isForKids: false,
      category: "Web Development",
      price: 500000,
    },
    {
      id: "3",
      title: "Kids Game Creator with Godot",
      description: "Build 2D and 3D arcade games",
      isForKids: true,
      category: "Game Design",
      price: 0,
    },
    {
      id: "4",
      title: "Medical 3D Visualization",
      description: "Clinical patient organ modeling for healthcare professionals",
      isForKids: false,
      category: "3D Animation",
      price: 0,
    },
  ];

  it("should segregate adult courses by excluding all isForKids items", () => {
    const adultCourses = mixedCatalog.filter((course) => !course.isForKids);

    expect(adultCourses).toHaveLength(2);
    expect(adultCourses.map((c) => c.title)).toEqual([
      "Fullstack Web Engineering",
      "Medical 3D Visualization",
    ]);
    expect(adultCourses.some((c) => c.isForKids)).toBe(false);
  });

  it("should segregate kids courses by including only isForKids items", () => {
    const kidsCourses = mixedCatalog.filter((course) => course.isForKids);

    expect(kidsCourses).toHaveLength(2);
    expect(kidsCourses.map((c) => c.title)).toEqual([
      "3D Animation Training for Kids",
      "Kids Game Creator with Godot",
    ]);
    expect(kidsCourses.every((c) => c.isForKids)).toBe(true);
  });

  it("should correctly detect search queries referring to children or kids", () => {
    const isKidsQuery = (query: string) => {
      const normalized = query.trim().toLowerCase();
      const keywords = ["kid", "kids", "child", "children", "teen", "teens"];
      return keywords.some((k) => normalized.includes(k));
    };

    expect(isKidsQuery("kids animation")).toBe(true);
    expect(isKidsQuery("coding for children")).toBe(true);
    expect(isKidsQuery("TEEN GAME DEV")).toBe(true);
    expect(isKidsQuery("blender")).toBe(false);
    expect(isKidsQuery("web development")).toBe(false);
  });

  it("should filter kids courses by category and search keyword correctly", () => {
    const kidsCatalog = mixedCatalog.filter((c) => c.isForKids);

    const filterCategory = (category: string) =>
      kidsCatalog.filter((c) => category === "All" || c.category === category);

    const searchCatalog = (term: string) =>
      kidsCatalog.filter(
        (c) =>
          c.title?.toLowerCase().includes(term.toLowerCase()) ||
          c.description?.toLowerCase().includes(term.toLowerCase())
      );

    expect(filterCategory("3D Animation")).toHaveLength(1);
    expect(filterCategory("Game Design")).toHaveLength(1);
    expect(filterCategory("All")).toHaveLength(2);

    expect(searchCatalog("Blender")).toHaveLength(1);
    expect(searchCatalog("arcade")).toHaveLength(1);
    expect(searchCatalog("Python")).toHaveLength(0);
  });
});
