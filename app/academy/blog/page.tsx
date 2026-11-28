import React from "react";
import { Outfit } from "next/font/google";
import PostGrid from "@/app/components/blog/PostGrid";
import BlogSidebar from "@/app/components/blog/BlogSidebar";
import { getPostsByCategory } from "@/lib/blog";
import { GraduationCap } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: "Academy Academy | Bravework Studio",
  description:
    "Learning tips, 3D tutorials, and educational insights from Bravework Academy.",
};

export default function AcademyBlog() {
  const posts = getPostsByCategory("Academy", [
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
        {/* Localized Header */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl mb-16 border border-blue-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200 shrink-0">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div>
              <h1
                className={`${outfit.className} text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight`}
              >
                Academy <span className="text-blue-600">Resources</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Level up your skills with our curated tutorials, learning paths,
                and expert advice for creative professionals.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <h2
              className={`${outfit.className} text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3`}
            >
              Latest Academy Posts
              <div className="h-1 flex-grow bg-blue-100 rounded-full" />
            </h2>
            <PostGrid posts={posts} />

            {/* CTA for Academy */}
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-10" />
              <div className="relative z-10 text-center">
                <h3 className={`${outfit.className} text-3xl font-bold mb-4`}>
                  Ready to Build Your Skills?
                </h3>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                  Take one of our professional 3D or Web Development courses and
                  turn these tips into actual projects.
                </p>
                <a
                  href="/academy/courses"
                  className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl active:scale-[0.98]"
                >
                  View All Courses
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
