import React from "react";
import { Outfit } from "next/font/google";
import PostGrid from "@/app/components/blog/PostGrid";
import BlogSidebar from "@/app/components/blog/BlogSidebar";
import { getPostsByCategory } from "@/lib/blog";
import { Briefcase } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: "Studio Insights | Bravework Studio",
  description:
    "Web development case studies, 3D project breakdowns, and tech trends.",
};

export default function StudioBlog() {
  const posts = getPostsByCategory("Studio", [
    "title",
    "date",
    "excerpt",
    "category",
    "slug",
    "coverImage",
    "author",
  ]);

  return (
    <main className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Professional Header */}
        <div className="border-b-4 border-purple-600 pb-12 mb-16">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-purple-600 font-black tracking-widest uppercase text-sm mb-4">
                <Briefcase className="w-5 h-5" />
                Studio & Craft
              </div>
              <h1
                className={`${outfit.className} text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-[0.9]`}
              >
                Studio <span className="text-purple-600 italic">Insights</span>
              </h1>
              <p className="text-xl text-gray-600">
                In-depth case studies, technical breakdowns, and industry
                perspective from our production team.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-32 w-32 border-8 border-gray-100 rounded-full flex items-center justify-center text-gray-200 font-black text-5xl">
                B
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <PostGrid posts={posts} />

            {/* Services CTA */}
            <div className="mt-20 bg-gray-900 rounded-3xl p-10 md:p-16 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.15),transparent)]" />
              <h3
                className={`${outfit.className} text-3xl font-bold mb-6 relative z-10`}
              >
                Build Your Next Vision With Us
              </h3>
              <p className="text-gray-400 mb-10 max-w-lg mx-auto relative z-10">
                From high-end 3D animation to enterprise web applications, we
                deliver results that scale.
              </p>
              <div className="flex flex-wrap justify-center gap-6 relative z-10">
                <a
                  href="/studio"
                  className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-xl"
                >
                  Contact Studio
                </a>
                <a
                  href="/portfolio"
                  className="px-8 py-4 bg-white/10 text-white hover:bg-white/20 font-bold rounded-xl transition-all border border-white/10 backdrop-blur-sm"
                >
                  View Portfolio
                </a>
              </div>
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
