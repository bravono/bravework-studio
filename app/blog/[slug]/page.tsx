import React from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  User,
  ChevronLeft,
  Share2,
  Tag as TagIcon,
} from "lucide-react";
import Link from "next/link";
import { Outfit } from "next/font/google";
import { getPostBySlug } from "@/lib/blog";
import { generateArticleSchema } from "@/lib/seo-utils";
import CategoryBadge from "@/app/components/blog/CategoryBadge";
import BlogSidebar from "@/app/components/blog/BlogSidebar";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

interface PostProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PostProps) {
  const post = getPostBySlug(params.slug, ["title", "excerpt", "coverImage"]);
  if (!post.title) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Bravework Blog`,
    description: post.excerpt,
    openGraph: {
      images: [{ url: post.coverImage || "/assets/DOF0160.png" }],
    },
  };
}

export default function PostDetail({ params }: PostProps) {
  const post = getPostBySlug(params.slug, [
    "title",
    "date",
    "excerpt",
    "category",
    "slug",
    "coverImage",
    "author",
    "content",
    "tags",
  ]);

  if (!post.title) {
    notFound();
  }

  const schema = generateArticleSchema(post);

  return (
    <main className="bg-white min-h-screen pt-32 pb-24">
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-bold transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to Feed
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Header */}
            <header className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <CategoryBadge category={post.category || "General"} />
                <button className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-bold">Share</span>
                </button>
              </div>

              <h1
                className={`${outfit.className} text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-[1.1]`}
              >
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-500 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {post.author?.charAt(0) || "B"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {post.author || "Bravework Team"}
                    </p>
                    <p className="text-xs">Author</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {post.date
                        ? format(new Date(post.date), "MMMM dd, yyyy")
                        : "Recently"}
                    </p>
                    <p className="text-xs">Published</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            <div className="relative h-[300px] md:h-[500px] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl">
              <img
                src={post.coverImage || "/assets/DOF0160.png"}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Rendering */}
            <div className="prose prose-lg prose-indigo max-w-none mb-16 px-2">
              {/* For now, we'll render content as a simple string or use a dangerouslySetInnerHTML if we had a parser. 
                 Since dependencies were installed, in a real environment we'd use ReactMarkdown or MDXRemote.
                 For this MVP, we will render the content as blocks. */}
              <div
                className="text-gray-700 leading-relaxed space-y-6 text-lg"
                dangerouslySetInnerHTML={{
                  __html: post.content?.replace(/\n/g, "<br />") || "",
                }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-100">
                <TagIcon className="w-5 h-5 text-gray-400 self-center mr-2" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag.toLowerCase()}`}
                    className="px-4 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl text-sm font-semibold transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <BlogSidebar />
          </div>
        </div>
      </article>
    </main>
  );
}
