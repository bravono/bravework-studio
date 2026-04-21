"use client";

import { useEffect } from "react";

interface BlogAnalyticsProps {
  post: {
    title: string;
    category?: string;
  };
}

export default function BlogAnalytics({ post }: BlogAnalyticsProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "blog_post_view",
        blog_category: post.category || "general",
        blog_post_title: post.title,
        page: window.location.pathname,
      });
    }
  }, [post.title, post.category]);

  return null;
}
