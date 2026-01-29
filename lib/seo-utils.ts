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
