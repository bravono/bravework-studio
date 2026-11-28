import { BlogPost } from "@/lib/blog";

export function generateArticleSchema(post: Partial<BlogPost>) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || "https://braveworkstudio.com/assets/DOF0160.png",
    author: {
      "@type": "Organization",
      name: "Bravework Studio",
      url: "https://braveworkstudio.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Bravework Studio",
      logo: {
        "@type": "ImageObject",
        url: "https://braveworkstudio.com/assets/Bravework_Studio-Logo-Color.png",
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://braveworkstudio.com/blog/${post.slug}`,
    },
  };
}

export function generateHowToSchema(post: Partial<BlogPost>) {
  // Simple extraction of steps from content if hyphenated or numbered
  // In a real scenario, we might want a specific field, but for now we'll mock the structure
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.title,
    description: post.excerpt,
    image: post.coverImage || "https://braveworkstudio.com/assets/DOF0160.png",
    step: [
      {
        "@type": "HowToStep",
        text: "Read the article to discover the full guide.",
        url: `https://braveworkstudio.com/blog/${post.slug}`,
      },
    ],
  };
}
