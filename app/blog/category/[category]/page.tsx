import React from "react";
import { Outfit } from "next/font/google";
import PostGrid from "@/app/components/blog/PostGrid";
import BlogSidebar from "@/app/components/blog/BlogSidebar";
import { getPostsByCategory } from "@/lib/blog";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

interface CategoryProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryProps) {
  const category =
    params.category.charAt(0).toUpperCase() + params.category.slice(1);
  return {
    title: `${category} Articles | Bravework Blog`,
    description: `Explore all blog posts in the ${category} category at Bravework Studio.`,
  };
}

export default function CategoryArchive({ params }: CategoryProps) {
  const category =
    params.category.charAt(0).toUpperCase() + params.category.slice(1);
  const posts = getPostsByCategory(category, [
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
            Category Archive
          </p>
          <h1
            className={`${outfit.className} text-5xl font-black text-gray-900 tracking-tight`}
          >
            Browsing: <span className="text-indigo-600">{category}</span>
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
