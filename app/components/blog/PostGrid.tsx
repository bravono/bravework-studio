import React from "react";
import PostCard from "./PostCard";
import { BlogPost } from "@/lib/blog";

interface PostGridProps {
  posts: Partial<BlogPost>[];
}

export default function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-2xl font-bold text-gray-400">No posts found.</h3>
        <p className="text-gray-500 mt-2">Check back later for more updates!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
