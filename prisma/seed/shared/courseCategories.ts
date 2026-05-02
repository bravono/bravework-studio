import { prisma } from "../client";

export async function seedCourseCategories() {
  const courseCategories = [
    {
      category_name: "Software Development",
      description: "Learn to build software applications",
    },
    {
      category_name: "3D Animation",
      description: "Master 3D modeling and animation",
    },
    {
      category_name: "2D Animation",
      description: "Create stunning 2D animations",
    },
    {
      category_name: "AI",
      description: "Artificial Intelligence and Machine Learning",
    },
    {
      category_name: "UI/UX Design",
      description: "Design beautiful user interfaces",
    },
    {
      category_name: "Video Editing",
      description: "Professional video editing skills",
    },
    {
      category_name: "Game Development",
      description: "Master game design and development",
    },
    {
      category_name: "Computer Fundamentals",
      description: "Learn how to use a computer, its accessories and software",
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
