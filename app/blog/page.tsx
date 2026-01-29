import React from "react";
import { Outfit } from "next/font/google";
import PostGrid from "@/app/components/blog/PostGrid";
import BlogSidebar from "@/app/components/blog/BlogSidebar";
import { getAllPosts } from "@/lib/blog";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: "Blog | Bravework Studio",
  description:
    "Insights, tutorials, and success stories from the intersection of technology and creativity in Lagos.",
};

export default function BlogHub() {
  const allPosts = getAllPosts([
    "title",
    "date",
    "excerpt",
    "category",
    "slug",
    "coverImage",
    "author",
  ]);
  const featuredPost = allPosts[0];
  const remainingPosts = allPosts.slice(1);

  return (
    <main className="bg-gray-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1
            className={`${outfit.className} text-6xl font-black text-gray-900 mb-4 tracking-tight`}
          >
            Our <span className="text-indigo-600">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore the latest from Bravework: From 3D animation tutorials to
            web development case studies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Featured Post Card (Optional/Horizontal) */}
            {featuredPost && (
              <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden group border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img
                      src={featuredPost.coverImage || "/assets/DOF0160.png"}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="bg-indigo-600 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full w-fit mb-4">
                      Featured Post
                    </span>
                    <h2
                      className={`${outfit.className} text-3xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors`}
                    >
                      <a href={`/blog/${featuredPost.slug}`}>
                        {featuredPost.title}
                      </a>
                    </h2>
                    <p className="text-gray-600 line-clamp-3 mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <a
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-8 decoration-2 decoration-indigo-200 hover:decoration-indigo-600 transition-all"
                    >
                      Read Featured Story
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-gray-100">
              <h2
                className={`${outfit.className} text-2xl font-bold text-gray-900 mb-8`}
              >
                Recent Articles
              </h2>
              <PostGrid posts={remainingPosts} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
