import { prisma } from "../client";

export async function seedCourseCategories() {
  const courseCategories = [
    {
      category_name: "Software Development",
      description: "Learn to build modern software, web applications and scalable products",
    },
    {
      category_name: "3D Animation",
      description: "Master 3D modeling, visualization, animation and visual effects",
    },
    {
      category_name: "2D Animation",
      description: "Create stunning 2D animations, motion graphics and storytelling",
    },
    {
      category_name: "AI",
      description: "Artificial Intelligence, autonomous agents, RAG and local models",
    },
    {
      category_name: "UI/UX Design",
      description: "Design intuitive user interfaces, prototypes and design systems",
    },
    {
      category_name: "Video Editing",
      description: "Professional video editing, color grading and post-production",
    },
    {
      category_name: "Game Development",
      description: "Master game design, Unity, Unreal Engine, mechanics and multiplayer",
    },
    {
      category_name: "Computer Fundamentals",
      description: "Digital literacy, operating systems, and essential productivity tools",
    },
  ];

  for (const category of courseCategories) {
    await prisma.course_categories.upsert({
      where: { category_name: category.category_name },
      update: {
        description: category.description,
      },
      create: category,
    });
  }
}
