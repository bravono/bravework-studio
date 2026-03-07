"use client";

import React, { useState, useEffect } from "react";
import { Outfit } from "next/font/google";
import { Plus, Save, Trash2, Edit, FileText, X, Sparkles } from "lucide-react";
import BlogGeneratorUI from "@/app/components/blog/BlogGeneratorUI";
import { toast } from "react-toastify";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

interface PostSummary {
  slug: string;
  filename: string;
}

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    excerpt: "",
    category: "Academy",
    author: "Bravework Team",
    tags: "",
    content: "",
    coverImage: "/assets/DOF0160.png",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((t) => t.trim()),
        }),
      });

      if (res.ok) {
        toast.success("Post saved!");
        setIsModalOpen(false);
        fetchPosts();
      } else {
        toast.error("Save failed");
      }
    } catch (err) {
      toast.error("Error saving post");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        toast.success("Post deleted");
        fetchPosts();
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1
              className={`${outfit.className} text-4xl font-black text-gray-900`}
            >
              Blog <span className="text-indigo-600">Manager</span>
            </h1>
            <p className="text-gray-500">
              Create and manage your markdown blog posts.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              AI Generate
            </button>
            <button
              onClick={() => {
                setFormData({
                  slug: "",
                  title: "",
                  date: new Date().toISOString().split("T")[0],
                  excerpt: "",
                  category: "Academy",
                  author: "Bravework Team",
                  tags: "",
                  content: "",
                  coverImage: "/assets/DOF0160.png",
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Post
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Loading posts...
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{post.slug}</h3>
                    <p className="text-xs text-gray-400">{post.filename}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className={`${outfit.className} text-3xl font-bold`}>
                  Create Content
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Slug (URL identifier)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. my-awesome-post"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option>Academy</option>
                      <option>Kids</option>
                      <option>Studio</option>
                      <option>Rentals</option>
                      <option>How To</option>
                      <option>General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Excerpt (Short Preview Text)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Main Content (Markdown supported)
                  </label>
                  <textarea
                    required
                    rows={10}
                    placeholder="Write your story here..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-grow py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all"
                  >
                    Save Blog Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-grow py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {isAIModalOpen && (
        <BlogGeneratorUI
          onClose={() => setIsAIModalOpen(false)}
          onGenerated={(content) => {
            // Extract frontmatter using a simple regex since we are on the client
            const titleMatch = content.match(/title:\s*["']?(.*?)["']?\n/);
            const excerptMatch = content.match(/excerpt:\s*["']?(.*?)["']?\n/);
            const categoryMatch = content.match(
              /category:\s*["']?(.*?)["']?\n/,
            );
            const slugMatch = content.match(/slug:\s*["']?(.*?)["']?\n/);

            const title = titleMatch ? titleMatch[1] : "";
            const excerpt = excerptMatch ? excerptMatch[1] : "";
            const category = categoryMatch ? categoryMatch[1] : "General";
            const slug = title
              ? title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")
              : "";

            // Clean content by removing frontmatter block
            const cleanContent = content.replace(/^---[\s\S]*?---\n*/, "");

            setFormData({
              ...formData,
              title: title || formData.title,
              excerpt: excerpt || formData.excerpt,
              category: category || formData.category,
              slug: slug || formData.slug,
              content: cleanContent,
            });
            setIsAIModalOpen(false);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
