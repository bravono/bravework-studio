import { prisma } from "../client";

export async function seedCourseCategories() {
  const courseCategories = [
    {
      category_id: 1,
      category_name: "Software Development",
      description: "Learn to build software applications",
    },
    {
      category_id: 2,
      category_name: "3D Animation",
      description: "Master 3D modeling and animation",
    },
    {
      category_id: 3,
      category_name: "2D Animation",
      description: "Create stunning 2D animations",
    },
    {
      category_id: 4,
      category_name: "AI",
      description: "Artificial Intelligence and Machine Learning",
    },
    {
      category_id: 5,
      category_name: "UI/UX Design",
      description: "Design beautiful user interfaces",
    },
    {
      category_id: 6,
      category_name: "Video Editing",
      description: "Professional video editing skills",
    },
  ];

  for (const category of courseCategories) {
    await prisma.course_categories.upsert({
      where: { category_id: category.category_id },
      update: {
        category_name: category.category_name,
        description: category.description,
      },
      create: category,
    });
  }
}
