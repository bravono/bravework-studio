import React from "react";
import Link from "next/link";
import { Search, Mail, Tag, List } from "lucide-react";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

const categories = [
  { name: "Academy", count: 12, color: "text-blue-600" },
  { name: "Kids", count: 8, color: "text-pink-600" },
  { name: "Studio", count: 15, color: "text-purple-600" },
  { name: "Rentals", count: 5, color: "text-green-600" },
  { name: "General", count: 4, color: "text-gray-600" },
];

const tags = [
  "NextJS",
  "Blender3D",
  "NigeriaEdTech",
  "UIUX",
  "3DAnimation",
  "WebDev",
  "Startup",
];

export default function BlogSidebar() {
  return (
    <aside className="space-y-12">
      {/* Search Bar */}
      <div className="relative group">
        <input
          type="text"
          placeholder="Search articles..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-3xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm group-hover:shadow-md"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
      </div>

      {/* Categories */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
        <h3
          className={`${outfit.className} text-xl font-bold text-gray-900 mb-6 flex items-center gap-2`}
        >
          <List className="w-5 h-5 text-indigo-600" />
          Categories
        </h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/blog/category/${cat.name.toLowerCase()}`}
              className="group flex items-center justify-between py-2 border-b border-gray-50 hover:border-indigo-100 transition-colors"
            >
              <span
                className={`font-semibold group-hover:translate-x-1 transition-transform duration-300 ${cat.color}`}
              >
                {cat.name}
              </span>
              <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2.5 rounded-full font-bold">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
        <h3
          className={`${outfit.className} text-xl font-bold text-gray-900 mb-6 flex items-center gap-2`}
        >
          <Tag className="w-5 h-5 text-indigo-600" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag.toLowerCase()}`}
              className="px-4 py-2 bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-600 text-sm font-semibold rounded-2xl transition-all duration-300"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="relative overflow-hidden bg-indigo-600 p-8 rounded-3xl shadow-xl text-white">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50" />
        <h3
          className={`${outfit.className} text-2xl font-black mb-4 relative z-10`}
        >
          Never Miss an Update
        </h3>
        <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed">
          Subscribe to our newsletter for the latest tech insights and studio
          updates.
        </p>
        <div className="space-y-4 relative z-10">
          <div className="relative">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full pl-10 pr-4 py-4 bg-indigo-700/50 border border-indigo-400/30 rounded-2xl placeholder-indigo-300 text-white outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
          </div>
          <button className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20 active:scale-[0.98]">
            Subscribe Now
          </button>
        </div>
      </div>
    </aside>
  );
}
