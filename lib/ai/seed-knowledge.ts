import prisma from "@/lib/prisma";

export const DEFAULT_KNOWLEDGE_ENTRIES = [
  {
    category: "general",
    question: "What is Bravework Studio?",
    answer: "Bravework Studio is a Lagos-based creative powerhouse offering end-to-end digital services including 3D modeling and animation, custom software and web development, AI integration, UI/UX design, hands-on Academy training, kids edutainment, and affordable workstation hardware rentals.",
    keywords: "about, company, overview, lagos, creative powerhouse",
  },
  {
    category: "services",
    question: "What 3D animation services do you provide?",
    answer: "We deliver full-pipeline 3D production including custom character modeling, rigging, texturing, YouTube and brand intro animations, commercial visual effects, architectural visualizations, and children's edutainment animation series.",
    keywords: "3d, animation, modeling, blender, character, intro, render",
  },
  {
    category: "services",
    question: "What software and web development services do you offer?",
    answer: "We engineer scalable full-stack web applications, progressive web apps (PWAs), cross-platform mobile apps for iOS and Android, e-commerce storefronts with payment gateways like Paystack, custom SaaS platforms, and secure RESTful APIs.",
    keywords: "software, web development, mobile app, pwa, react, nextjs, payment",
  },
  {
    category: "services",
    question: "Can Bravework Studio integrate AI into our business?",
    answer: "Yes, our AI integration solutions include intelligent customer service chatbots, automated workflow systems, custom machine learning models, product recommendation engines, and natural language processing pipelines.",
    keywords: "ai, artificial intelligence, chatbot, automation, machine learning",
  },
  {
    category: "academy",
    question: "What is Bravework Academy and how can I enroll?",
    answer: "Bravework Academy offers practical, mentor-led courses in Blender 3D modeling, full-stack software development, UI/UX design, and game technology. Students can enroll directly on our website under the /academy section, track lesson progress, and receive accredited certificates upon completion.",
    keywords: "academy, courses, training, learn, blender, coding, certificate",
  },
  {
    category: "rentals",
    question: "How does workstation and PC rental work?",
    answer: "We provide hourly, daily, and weekly rentals of high-specification PC workstations equipped with dedicated GPUs and software packages for 3D rendering, video editing, and software compilation at our Lagos creative hub. Reservations can be placed under the /hub section.",
    keywords: "rentals, hardware, pc, gpu, workstation, hub, lagos",
  },
  {
    category: "pricing",
    question: "How do I get a custom quote or start a project with Bravework Studio?",
    answer: "You can submit your project requirements directly through our online ordering wizard at /order, or connect directly with our production leads via WhatsApp. We provide transparent custom offers detailing milestones, deliverables, and turnaround times.",
    keywords: "pricing, quote, order, custom offer, hire, contact",
  },
  {
    category: "kids",
    question: "What is Bravework Kids Hub?",
    answer: "Bravework Kids Hub is our edutainment division providing engaging 3D animations, creative storytelling, and introductory digital skills training designed specifically for children and young learners.",
    keywords: "kids, children, edutainment, workshop, animation for kids",
  },
];

export async function ensureDefaultKnowledgeBase(): Promise<number> {
  const count = await prisma.ai_knowledge_base.count();
  if (count > 0) {
    return count;
  }

  for (const entry of DEFAULT_KNOWLEDGE_ENTRIES) {
    await prisma.ai_knowledge_base.create({
      data: {
        category: entry.category,
        question: entry.question,
        answer: entry.answer,
        keywords: entry.keywords,
        is_active: true,
        source: "admin",
      },
    });
  }

  return DEFAULT_KNOWLEDGE_ENTRIES.length;
}
