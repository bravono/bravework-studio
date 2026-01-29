import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, User, ArrowRight } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import { BlogPost } from "@/lib/blog";

interface PostCardProps {
  post: Partial<BlogPost>;
}

export default function PostCard({ post }: PostCardProps) {
  const { title, date, excerpt, category, slug, coverImage, author } = post;

  return (
    <div className="group bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full border border-gray-100">
      <div className="relative overflow-hidden h-52">
        <img
          src={coverImage || "/assets/DOF0160.png"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 left-4 z-10">
          <CategoryBadge category={category || "General"} />
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {date ? format(new Date(date), "MMM dd, yyyy") : "No Date"}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {author || "Bravework Team"}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
          <Link href={`/blog/${slug}`}>{title}</Link>
        </h3>

        <p className="text-gray-600 text-sm mb-6 line-clamp-3">{excerpt}</p>

        <div className="mt-auto pt-4 border-t border-gray-50">
          <Link
            href={`/blog/${slug}`}
            className="inline-flex items-center text-sm font-bold text-indigo-600 group/link"
          >
            Read More
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
