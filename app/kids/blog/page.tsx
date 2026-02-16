import React from "react";
import { Outfit } from "next/font/google";
import PostGrid from "@/app/components/blog/PostGrid";
import BlogSidebar from "@/app/components/blog/BlogSidebar";
import { getPostsByCategory } from "@/lib/blog";
import { Rocket } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: "Kids Fun & Tech | Bravework Studio",
  description:
    "Playful tech activities, safe digital tips, and edutainment for families.",
};

export default function KidsBlog() {
  const posts = getPostsByCategory("Kids", [
    "title",
    "date",
    "excerpt",
    "category",
    "slug",
    "coverImage",
    "author",
  ]);

  return (
    <main className="bg-amber-50/30 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Playful Header */}
        <div className="bg-gradient-to-br from-pink-400 to-orange-400 rounded-[3rem] p-8 md:p-16 shadow-2xl mb-16 relative overflow-hidden text-white border-8 border-white">
          {/* Decorative Floats */}
          <div className="absolute top-4 right-10 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-pink-500 shadow-2xl rotate-3 shrink-0">
              <Rocket className="w-12 h-12" />
            </div>
            <div className="text-center md:text-left">
              <h1
                className={`${outfit.className} text-5xl md:text-6xl font-black mb-4 tracking-tighter`}
              >
                Kids <span className="text-yellow-300">Adventure</span>!
              </h1>
              <p className="text-xl font-medium text-pink-50 max-w-2xl">
                Fun activities, digital safety tips, and cool tech secrets for
                explorers ages 7 and up. Let's create something amazing
                together!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="mb-10 flex items-center gap-4">
              <h2
                className={`${outfit.className} text-3xl font-black text-gray-900`}
              >
                Cool Stories & Tips
              </h2>
              <div className="h-2 w-20 bg-pink-400 rounded-full" />
            </div>

            {/* Using standard PostGrid but we could wrap it for custom styling */}
            <div className="kids-blog-feed">
              <PostGrid posts={posts} />
            </div>

            {/* Kids CTA */}
            <div className="mt-16 bg-white rounded-[3rem] p-8 md:p-16 text-center shadow-xl border-4 border-pink-100 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-50 rounded-full" />
              <h3
                className={`${outfit.className} text-4xl font-black text-gray-900 mb-6 relative z-10`}
              >
                Start Your Tech Journey
              </h3>
              <p className="text-gray-600 text-lg mb-10 max-w-xl mx-auto relative z-10">
                Join our Discovery Lessons where kids learn to build their own
                3D worlds and simple games.
              </p>
              <a
                href="/kids"
                className="inline-block px-12 py-5 bg-pink-500 text-white font-black text-xl rounded-2xl hover:bg-pink-600 transition-all shadow-xl shadow-pink-200 active:scale-95 relative z-10"
              >
                Go to Kids Hub
              </a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
