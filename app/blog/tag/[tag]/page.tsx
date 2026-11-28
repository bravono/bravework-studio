import React from "react";
import { Outfit } from "next/font/google";
import PostGrid from "@/app/components/blog/PostGrid";
import BlogSidebar from "@/app/components/blog/BlogSidebar";
import { getPostsByTag } from "@/lib/blog";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

interface TagProps {
  params: {
    tag: string;
  };
}

export async function generateMetadata({ params }: TagProps) {
  const tag = params.tag;
  return {
    title: `#${tag} | Bravework Blog`,
    description: `Explore all blog posts tagged with #${tag} at Bravework Studio.`,
  };
}

export default function TagArchive({ params }: TagProps) {
  const tag = params.tag;
  const posts = getPostsByTag(tag, [
    "title",
    "date",
    "excerpt",
    "category",
    "slug",
    "coverImage",
    "author",
  ]);

  return (
    <main className="bg-gray-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-2">
            Tag Archive
          </p>
          <h1
            className={`${outfit.className} text-5xl font-black text-gray-900 tracking-tight`}
          >
            Articles Tagged: <span className="text-indigo-600">#{tag}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <PostGrid posts={posts} />
          </div>
          <div className="lg:col-span-4">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
