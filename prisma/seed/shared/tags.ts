import { prisma } from "../client";

export async function seedTags() {
  const tags = [
    { tag_name: "3D Animation" },
    { tag_name: "3D Modeling" },
    { tag_name: "Agentic AI" },
    { tag_name: "Artificial Intelligence" },
    { tag_name: "Autonomous Agents" },
    { tag_name: "Backend" },
    { tag_name: "Beginner Friendly" },
    { tag_name: "Blender" },
    { tag_name: "C#" },
    { tag_name: "Character Design" },
    { tag_name: "Computer Basics" },
    { tag_name: "Content Creation" },
    { tag_name: "Design Systems" },
    { tag_name: "Digital Literacy" },
    { tag_name: "Engineering & Architecture" },
    { tag_name: "Enterprise" },
    { tag_name: "Fashion & Apparel" },
    { tag_name: "Figma" },
    { tag_name: "Free" },
    { tag_name: "Frontend" },
    { tag_name: "Full-Stack" },
    { tag_name: "Game Development" },
    { tag_name: "Game Mechanics" },
    { tag_name: "Kids & Teens" },
    { tag_name: "Level Design" },
    { tag_name: "Local AI" },
    { tag_name: "Mastery & Advanced" },
    { tag_name: "Medical & Healthcare" },
    { tag_name: "Multiplayer" },
    { tag_name: "Office Tools" },
    { tag_name: "Ollama" },
    { tag_name: "Portfolio Ready" },
    { tag_name: "Productivity" },
    { tag_name: "Prototyping" },
    { tag_name: "SaaS" },
    { tag_name: "Teaser Course" },
    { tag_name: "UI/UX Design" },
    { tag_name: "Unity" },
    { tag_name: "Unreal Engine" },
    { tag_name: "Visualization" },
    { tag_name: "Web Development" },
  ];

  for (const tag of tags) {
    await prisma.tags.upsert({
      where: { tag_name: tag.tag_name },
      update: {},
      create: tag,
    });
  }
}
