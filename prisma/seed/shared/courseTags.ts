import { prisma } from "../client";

export async function seedCourseTags() {
  const courseTagMappings: Array<{ courseTitle: string; tags: string[] }> = [
    {
      courseTitle: "3D Animation Training for Kids",
      tags: ["3D Animation", "3D Modeling", "Blender", "Kids & Teens", "Beginner Friendly"],
    },
    {
      courseTitle: "Medical 3D Visualization in Just 2 Hours",
      tags: ["Visualization", "3D Modeling", "Blender", "Medical & Healthcare", "Teaser Course", "Free"],
    },
    {
      courseTitle: "3D Technology for Medical Professionals",
      tags: ["Visualization", "3D Modeling", "Blender", "Medical & Healthcare", "Beginner Friendly"],
    },
    {
      courseTitle: "3D Culinary Creation Bootcamp for Chefs",
      tags: ["Visualization", "3D Modeling", "Blender", "Beginner Friendly"],
    },
    {
      courseTitle: "Win Your Next Tender in 2 Hours: 3D Visualization for Engineers with Blender",
      tags: ["Visualization", "3D Modeling", "Blender", "Engineering & Architecture", "Teaser Course", "Free"],
    },
    {
      courseTitle: "3D Engineering Mastery Bootcamp: Win More Tenders with Blender",
      tags: ["Visualization", "3D Modeling", "Blender", "Engineering & Architecture", "Portfolio Ready"],
    },
    {
      courseTitle: "3D Animation for Content Creators Curriculum: From Zero to Viral Intro Clip",
      tags: ["3D Animation", "Blender", "Content Creation", "Teaser Course"],
    },
    {
      courseTitle: "3D Animation Mastery for Content Creators: Build Viral Avatars, Intros & Explainers",
      tags: ["3D Animation", "Character Design", "Blender", "Content Creation", "Portfolio Ready"],
    },
    {
      courseTitle: "From Sketch to Screen: Create a Stunning 3D Ankara Dress in Just 2 Hours",
      tags: ["3D Modeling", "Blender", "Fashion & Apparel", "Visualization", "Teaser Course", "Free"],
    },
    {
      courseTitle: "3D Fashion Visualization for Designers",
      tags: ["3D Modeling", "Blender", "Fashion & Apparel", "Visualization", "Portfolio Ready"],
    },
    {
      courseTitle: "Build Powerful AI Assistants for Business & Personal Success",
      tags: ["Artificial Intelligence", "Local AI", "Ollama", "Productivity", "Autonomous Agents"],
    },
    {
      courseTitle: "From Prompt to 3D: Learn AI + 3D Creation in Just 2 Hours",
      tags: ["Artificial Intelligence", "3D Modeling", "Blender", "Teaser Course", "Free"],
    },
    {
      courseTitle: "AI-Assisted Full-Stack Web Development: Teaser",
      tags: ["Web Development", "Full-Stack", "Artificial Intelligence", "Teaser Course", "Free"],
    },
    {
      courseTitle: "Master Computer Basics in Just 2 Hours",
      tags: ["Computer Basics", "Digital Literacy", "Productivity", "Teaser Course", "Free"],
    },
    {
      courseTitle: "AI-Assisted UI/UX Teaser Course",
      tags: ["UI/UX Design", "Figma", "Prototyping", "Artificial Intelligence", "Teaser Course", "Free"],
    },
    {
      courseTitle: "Build Your First Private Productivity Assistant",
      tags: ["Artificial Intelligence", "Local AI", "Ollama", "Productivity", "Beginner Friendly"],
    },
    {
      courseTitle: "Build Agentic AI Assistants: Master Free Local Tools for Autonomous Productivity",
      tags: ["Artificial Intelligence", "Local AI", "Agentic AI", "Autonomous Agents", "Productivity"],
    },
    {
      courseTitle: "Enterprise Agentic AI: Scale Free Local Systems for Business Productivity",
      tags: ["Artificial Intelligence", "Local AI", "Agentic AI", "Autonomous Agents", "Enterprise"],
    },
    {
      courseTitle: "AI + 3D Foundations: Build Your First Professional-Grade Assets",
      tags: ["3D Modeling", "3D Animation", "Blender", "Artificial Intelligence", "Beginner Friendly"],
    },
    {
      courseTitle: "AI + 3D Workflow Pro: Complex Assets & Efficient Pipelines",
      tags: ["3D Modeling", "Blender", "Artificial Intelligence", "Portfolio Ready"],
    },
    {
      courseTitle: "AI + 3D Mastery: Production Pipelines & Creative Direction",
      tags: ["3D Modeling", "Blender", "Artificial Intelligence", "Mastery & Advanced"],
    },
    {
      courseTitle: "Building Complete Games – Mechanics, Enemies & Level Design",
      tags: ["Game Development", "Game Mechanics", "Level Design", "3D Modeling"],
    },
    {
      courseTitle: "Professional Game Development (UE) – Systems, Multiplayer & Publishing",
      tags: ["Game Development", "Unreal Engine", "Multiplayer", "Portfolio Ready", "Mastery & Advanced"],
    },
    {
      courseTitle: "From Zero to Confident: Master Computer Basics",
      tags: ["Computer Basics", "Digital Literacy", "Productivity", "Beginner Friendly"],
    },
    {
      courseTitle: "Daily Productivity & Practical Tools",
      tags: ["Computer Basics", "Digital Literacy", "Productivity", "Office Tools"],
    },
    {
      courseTitle: "Creativity, Data & Professional Edge",
      tags: ["Computer Basics", "Digital Literacy", "Productivity", "Portfolio Ready"],
    },
    {
      courseTitle: "AI-Powered Web Launch: Build & Deploy Your First Website",
      tags: ["Web Development", "Frontend", "Artificial Intelligence", "Beginner Friendly"],
    },
    {
      courseTitle: "AI-Assisted Dynamic Apps: Build Full-Stack Applications Fast",
      tags: ["Web Development", "Full-Stack", "Backend", "Artificial Intelligence"],
    },
    {
      courseTitle: "AI-Augmented Full-Stack Mastery: Production-Ready SaaS & Scalable Apps",
      tags: ["Web Development", "Full-Stack", "SaaS", "Artificial Intelligence", "Mastery & Advanced"],
    },
    {
      courseTitle: "AI-Powered UI/UX Foundations: From Prompt to Clickable Prototype",
      tags: ["UI/UX Design", "Figma", "Prototyping", "Artificial Intelligence", "Beginner Friendly"],
    },
    {
      courseTitle: "AI-Powered UI/UX Mastery: Build Scalable Design Systems & Workflows",
      tags: ["UI/UX Design", "Figma", "Design Systems", "Prototyping", "Artificial Intelligence"],
    },
    {
      courseTitle: "AI-Powered UI/UX Professional: Enterprise Systems, Strategy & Leadership",
      tags: ["UI/UX Design", "Figma", "Design Systems", "Enterprise", "Mastery & Advanced"],
    },
    {
      courseTitle: "From Zero to First Playable Game with Unity in 2 Hours",
      tags: ["Unity", "Game Development", "C#", "Teaser Course", "Free"],
    },
    {
      courseTitle: "Build Your First Ready to Play Game with Unity",
      tags: ["Unity", "Game Development", "C#", "Game Mechanics", "Beginner Friendly"],
    },
    {
      courseTitle: "Building Engaging Games with Unity – AI, Combat & Polish",
      tags: ["Unity", "Game Development", "C#", "Game Mechanics", "Artificial Intelligence"],
    },
    {
      courseTitle: "Professional Unity Development – Multiplayer, Systems & Publishing",
      tags: ["Unity", "Game Development", "Multiplayer", "Portfolio Ready", "Mastery & Advanced"],
    },
    {
      courseTitle: "Build Your First Unreal Engine Game Scene with AI in Just",
      tags: ["Unreal Engine", "Game Development", "Artificial Intelligence", "Teaser Course", "Free"],
    },
    {
      courseTitle: "Unreal Engine + AI Foundations: Build Playable Mini-Games from Scratch",
      tags: ["Unreal Engine", "Game Development", "Artificial Intelligence", "Beginner Friendly"],
    },
    {
      courseTitle: "Unreal Engine + AI Game Mechanics: Build Engaging Playable Games",
      tags: ["Unreal Engine", "Game Development", "Game Mechanics", "Artificial Intelligence"],
    },
    {
      courseTitle: "Unreal Engine + AI Professional Production: Build Polished Releasable Games",
      tags: ["Unreal Engine", "Game Development", "Portfolio Ready", "Mastery & Advanced"],
    },
  ];

  for (const mapping of courseTagMappings) {
    const course = await prisma.courses.findUnique({
      where: { title: mapping.courseTitle },
    });

    if (!course) {
      continue;
    }

    for (const tagName of mapping.tags) {
      const tag = await prisma.tags.findUnique({
        where: { tag_name: tagName },
      });

      if (tag) {
        await prisma.course_tags.upsert({
          where: {
            course_id_tag_id: {
              course_id: course.course_id,
              tag_id: tag.tag_id,
            },
          },
          update: {},
          create: {
            course_id: course.course_id,
            tag_id: tag.tag_id,
          },
        });
      }
    }
  }
}
