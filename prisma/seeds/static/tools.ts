type Tool = {
    tool_Id: number;
    name: string;
};

export const TOOLS: Tool[] = [
    { tool_Id: 1, name: "HTML" },
    { tool_Id: 2, name: "CSS" },
    { tool_Id: 3, name: "Figma" },
    { tool_Id: 4, name: "JavaScript" },
    { tool_Id: 5, name: "Typescript" },
    { tool_Id: 6, name: "Redux" },
    { tool_Id: 7, name: "React" },
    { tool_Id: 8, name: "Next.js" },
    { tool_Id: 9, name: "Blender" },
    { tool_Id: 10, name: "ExpressJS" },
    { tool_Id: 10, name: "MySQL" },
    { tool_Id: 10, name: "SQL" },
];

export const seedTools = async (prisma) => {
    await prisma.tools.createMany({
        data: TOOLS,
        skipDuplicates: true, // Critical for static data!
    });
};