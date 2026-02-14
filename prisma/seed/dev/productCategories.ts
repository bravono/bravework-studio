import { prisma } from "../client";

export async function seedProductCategories() {
  const categories = [
    {
      category_id: 3,
      category_name: "3D Modeling & Animation",
      category_description:
        "Professional 3D modeling, animation, and visualization services for your projects.",
      accepted_files: ".fbx,.obj,.blend,.3ds,.max,.dae,.glb,.stl",
    },
    {
      category_id: 5,
      category_name: "UiUx Design",
      category_description:
        "User-centered design solutions that enhance user experience.",
      accepted_files: ".psd,.ai,.sketch,.fig,.xd,.pdf,.png,.jpg",
    },
    {
      category_id: 7,
      category_name: "Training Services",
      category_description:
        "Your kids will love to learn 3D modeling and animation with our simple and easy to understand training services.",
      accepted_files: ".pdf,.docx,.txt,.png,.jpg",
    },
    {
      category_id: 1,
      category_name: "Web Development",
      category_description:
        "Custom web applications and websites built with modern technologies.",
      accepted_files: ".zip,.rar,.pdf,.doc,.docx,.txt,.ai,.psd,.fig,.png,.jpg",
    },
    {
      category_id: 2,
      category_name: "Mobile App",
      category_description:
        "Custom mobile applications for iOS and Android platforms, built with apache cordova. React Native coming soon",
      accepted_files: ".zip,.rar,.pdf,.doc,.docx,.txt,.ai,.psd,.fig,.png,.jpg",
    },
    {
      category_id: 4,
      category_name: "Game Development",
      category_description:
        "Engaging game development services for various platforms.",
      accepted_files: ".unity,.uproject,.fbx,.obj,.blend,.pdf,.zip,.rar,.docx",
    },
    {
      category_id: 6,
      category_name: "Video & Voice Over",
      category_description:
        "Professional voice-over services for your videos, games, and multimedia projects.",
      accepted_files: ".mp3,.wav,.ogg,.aac,.m4a,.pdf,.docx,.txt,.png,.jpg",
    },
    {
      category_id: 8,
      category_name: "Course",
      category_description:
        "Your kids will love to learn 3D modeling and animation with our simple and easy to understand training services.",
      accepted_files: "",
    },
  ];

  for (const category of categories) {
    await prisma.product_categories.upsert({
      where: { category_id: category.category_id },
      update: {
        category_name: category.category_name,
        category_description: category.category_description,
        accepted_files: category.accepted_files,
      },
      create: category,
    });
  }
}
