import { prisma } from "../client";

export async function seedCourseTools() {
  const courseToolsMappings = [
    { courseTitle: "3D Animation Training for Kids", toolName: "Blender" },
    { courseTitle: "Medical 3D Visualization in Just 2 Hours", toolName: "Blender" },
  ];

  for (const mapping of courseToolsMappings) {
    const course = await prisma.courses.findUnique({
      where: { title: mapping.courseTitle },
    });

    const tool = await prisma.tools.findUnique({
      where: { name: mapping.toolName },
    });

    if (course && tool) {
      await prisma.course_tools.upsert({
        where: {
          course_id_tool_id: {
            course_id: course.course_id,
            tool_id: tool.tool_id,
          },
        },
        update: {},
        create: {
          course_id: course.course_id,
          tool_id: tool.tool_id,
        },
      });
    } else {
      console.warn(`Skipping course tool mapping: ${mapping.courseTitle} -> ${mapping.toolName} (One or both not found)`);
    }
  }
}
