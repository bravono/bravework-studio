import { prisma } from "../client";

export async function seedTags() {
  const tags = [
    { tag_name: "3D" },
    { tag_name: "2D" },
    { tag_name: "Animation" },
    { tag_name: "UiUx" },
    { tag_name: "Video Editing" },
    { tag_name: "Doctors" },
    { tag_name: "Professionals" },
    { tag_name: "Lawyers" },
    { tag_name: "Engineers" },
    { tag_name: "Fashion" },
    { tag_name: "Designers" },
    { tag_name: "Tailors" },
    { tag_name: "Kids" },
    { tag_name: "Chef" },
    { tag_name: "Frontend" },
    { tag_name: "Backend" },
    { tag_name: "Full-Stack" },
    { tag_name: "AI" },
    { tag_name: "Free" },
    { tag_name: "Paid" },
  ];

  for (const tag of tags) {
    await prisma.tags.upsert({
      where: { tag_name: tag.tag_name || "" },
      update: {},
      create: tag,
    });
  }
}
