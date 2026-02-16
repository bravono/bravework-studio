import { prisma } from "../client";

export async function seedTags() {
  const tags = [
    { tag_name: "3D", tag_id: 1 },
    { tag_name: "2D", tag_id: 2 },
    { tag_name: "Animation", tag_id: 3 },
    { tag_name: "UiUx", tag_id: 4 },
    { tag_name: "Video Editing", tag_id: 5 },
    { tag_name: "Doctors", tag_id: 6 },
    { tag_name: "Professionals", tag_id: 7 },
    { tag_name: "Lawyers", tag_id: 8 },
    { tag_name: "Engineers", tag_id: 9 },
    { tag_name: "Fashion", tag_id: 10 },
    { tag_name: "Designers", tag_id: 11 },
    { tag_name: "Tailors", tag_id: 12 },
    { tag_name: "Kids", tag_id: 13 },
    { tag_name: "Chef", tag_id: 14 },
    { tag_name: "Frontend", tag_id: 15 },
    { tag_name: "Backend", tag_id: 16 },
    { tag_name: "Full-Stack", tag_id: 17 },
    { tag_name: "AI", tag_id: 18 },
    { tag_name: "Free", tag_id: 19 },
    { tag_name: "Paid", tag_id: 20 },
  ];

  for (const tag of tags) {
    await prisma.tags.upsert({
      where: { tag_id: tag.tag_id },
      update: {
        tag_name: tag.tag_name,
      },
      create: tag,
    });
  }
}
