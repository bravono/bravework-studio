import { prisma } from "../client";

export async function seedTools() {
  const tools = [
    { name: "Blender" },
    { name: "Figma" },
    { name: "Unity" },
    { name: "Unreal Engine" },
    { name: "Visual Studio Code" },
  ];

  for (const tool of tools) {
    await prisma.tools.upsert({
      where: { name: tool.name },
      update: {},
      create: tool,
    });
  }
}
