import React from "react";
import { Outfit } from "next/font/google";
import PostGrid from "@/app/components/blog/PostGrid";
import BlogSidebar from "@/app/components/blog/BlogSidebar";
import { getAllPosts } from "@/lib/blog";
import { HardDrive } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: "Hardware & Tech Setup | Bravework Studio",
  description:
    "Best specs for 3D, hardware setup guides, and academy rentals tips.",
};

export default function RentalsBlog() {
  // Pulling both Rentals and Academy for this section as requested
  const allPosts = getAllPosts([
    "title",
    "date",
    "excerpt",
    "category",
    "slug",
    "coverImage",
    "author",
  ]);
  const posts = allPosts.filter(
    (post) => post.category === "Rentals" || post.category === "Academy",
  );

  return (
    <main className="bg-gray-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hardware Focused Header */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl mb-16 border-l-8 border-green-500 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
              <HardDrive className="w-10 h-10" />
            </div>
            <div>
              <h1
                className={`${outfit.className} text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight`}
              >
                Hardware <span className="text-green-600">&</span> Specs
              </h1>
              <p className="text-lg text-gray-500">
                Optimizing your setup for 3D production and high-end web dev.
                Rent local, learn global.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <PostGrid posts={posts} />

            {/* Rentals CTA */}
            <div className="mt-20 flex flex-col md:flex-row items-center bg-white rounded-[2.5rem] p-4 pr-12 shadow-xl border border-gray-100 group">
              <div className="w-full md:w-1/3 h-48 rounded-[2rem] overflow-hidden mb-6 md:mb-0">
                <img
                  src="/assets/DOF0160.png"
                  alt="Hardware Setup"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="md:ml-10 flex-grow py-4">
                <h3
                  className={`${outfit.className} text-2xl font-bold text-gray-900 mb-3`}
                >
                  Need a Professional Workstation?
                </h3>
                <p className="text-gray-500 mb-6">
                  Don't let hardware limit your creativity. Rent high-end PCs
                  and production gear right here in Lagos.
                </p>
                <a
                  href="/academy/rentals"
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95"
                >
                  Browse Inventory
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
