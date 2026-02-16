import { prisma } from "../client";

export async function seedTools() {
  const tools = [
    { name: "Blender", tool_id: 1 },
    { name: "Figma", tool_id: 2 },
    { name: "Unity", tool_id: 3 },
    { name: "Unreal Engine", tool_id: 4 },
    { name: "Visual Studio Code", tool_id: 5 },
    { name: "Unreal Engine", tool_id: 6 },
    
  ];

  for (const tool of tools) {
    await prisma.tools.upsert({
      where: { tool_id: tool.tool_id },
      update: {
       name: tool.name,
      },
      create: tool,
    });
  }
}
