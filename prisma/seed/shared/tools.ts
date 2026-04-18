import { prisma } from "../client";

export async function seedTools() {
  const tools = [
    { name: "Blender" },
    { name: "Figma" },
    { name: "Unity" },
    { name: "Unreal Engine" },
    { name: "Visual Studio Code" },
    { name: "Ollama" },
    { name: "LM Studio" },
    { name: "Jan.ai" },
    { name: "OpenClaw" },
    { name: "Qwen3.5" },
    { name: "Llama 3.3" },
    { name: "GLM-5" },
    { name: "DeepSeek V3.2" },
    { name: "GitHub" },
  ];

  for (const tool of tools) {
    await prisma.tools.upsert({
      where: { name: tool.name },
      update: {},
      create: tool,
    });
  }
}
