import { prisma } from "../client";

export async function seedInstructors() {
  const instructors = [
    {
      first_name: "Ajisefini",
      last_name: "Yusuf",
      bio: "Lead 3D artist and instructor with 10+ years of experience in Blender.",
      photo_url: "",
      email: "yusufahbideen@yahoo.com",
    },
  ];

  for (const instructor of instructors) {
    await prisma.instructors.upsert({
      where: { email: instructor.email },
      update: {
        first_name: instructor.first_name,
        last_name: instructor.last_name,
        bio: instructor.bio,
        photo_url: instructor.photo_url,
      },
      create: instructor,
    });
  }
}
