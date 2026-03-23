import { prisma } from "../client";

export async function seedCourseTools() {
  const courseTools = [
    { course_id: 3, tool_id: 1 },
    { course_id: 4, tool_id: 1 },
  ];

  for (const ct of courseTools) {
    await prisma.course_tools.upsert({
      where: {
        course_id_tool_id: {
          course_id: ct.course_id,
          tool_id: ct.tool_id,
        },
      },
      update: {},
      create: ct,
    });
  }
}
