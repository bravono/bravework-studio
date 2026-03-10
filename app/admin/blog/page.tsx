"use client";

import React, { useState, useEffect } from "react";
import { Outfit } from "next/font/google";
import {
  Plus,
  Save,
  Trash2,
  Edit,
  FileText,
  X,
  Sparkles,
  RotateCw,
  Wand2,
} from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);

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

  const handleRefine = async () => {
    if (!refineInstructions) {
      toast.warn("Please enter instructions for the AI.");
      return;
    }

    setIsRefining(true);
    try {
      const res = await fetch("/api/blog/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formData.content,
          instructions: refineInstructions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // AI output might still have fences despite instructions, so we strip them robustly
        let refined = data.content.trim();
        // Remove markdown code fences if they exist
        refined = refined.replace(/^```markdown\n/, "").replace(/```$/, "");
        // If the AI included frontmatter in the refine response, strip it too
        refined = refined.replace(/^---[\s\S]*?---\n*/, "");

        setFormData({ ...formData, content: refined });
        setRefineInstructions("");
        toast.success("Content refined by the fleet!");
      } else {
        toast.error(data.error || "Refinement failed");
      }
    } catch (err) {
      toast.error("An error occurred during refinement.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleEdit = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/blog/${slug}`);
      const data = await res.json();
      if (res.ok) {
        setFormData({
          slug: data.slug,
          title: data.title,
          date: data.date,
          excerpt: data.excerpt,
          category: data.category,
          author: data.author,
          tags: data.tags,
          content: data.content,
          coverImage: data.coverImage,
        });
        setIsModalOpen(true);
      } else {
        toast.error("Failed to load post");
      }
    } catch (err) {
      toast.error("Error loading post content");
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
                    onClick={() => handleEdit(post.slug)}
                    className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
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
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-center">
              <h2 className={`${outfit.className} text-3xl font-bold`}>
                Edit <span className="text-indigo-600">Content</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                  <form
                    onSubmit={handleSave}
                    id="blog-form"
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Slug
                        </label>
                        <input
                          required
                          type="text"
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
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
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
                          Cover Image URL
                        </label>
                        <input
                          type="text"
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.coverImage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              coverImage: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Content (Markdown)
                      </label>
                      <textarea
                        required
                        rows={15}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed"
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                      />
                    </div>
                  </form>
                </div>

                {/* Right Column: AI Refinement */}
                <div className="lg:col-span-1 border-l border-gray-100 pl-0 lg:pl-10">
                  <div className="sticky top-0 space-y-6">
                    <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                      <div className="flex items-center gap-2 text-indigo-700 font-black mb-4">
                        <Wand2 className="w-5 h-5" />
                        Refine with Agent Fleet
                      </div>
                      <p className="text-xs text-indigo-600/70 mb-4 leading-relaxed">
                        Tell the agents how to improve this post. They'll update
                        your content while maintaining your SEO and structure.
                      </p>
                      <textarea
                        rows={5}
                        placeholder="e.g. Make it sound more professional, add a paragraph about Nigerian tech hubs, or shorten the intro."
                        className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none mb-4"
                        value={refineInstructions}
                        onChange={(e) => setRefineInstructions(e.target.value)}
                        disabled={isRefining}
                      />
                      <button
                        onClick={handleRefine}
                        disabled={isRefining || !refineInstructions}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {isRefining ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            Agents working...
                          </>
                        ) : (
                          "Apply Refinements"
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        type="submit"
                        form="blog-form"
                        className="w-full py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-full py-5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                      >
                        Close Editor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAIModalOpen && (
        <BlogGeneratorUI
          onClose={() => setIsAIModalOpen(false)}
          onGenerated={(rawContent, thumbnailUrl) => {
            // Robust cleaning for AI content
            let content = rawContent.trim();
            // Remove markdown code fences if agents ignored previous instructions
            content = content.replace(/^```markdown\n/, "").replace(/```$/, "");

            // Extract metadata from the cleaned content
            const titleMatch = content.match(/title:\s*["']?(.*?)["']?\n/);
            const excerptMatch = content.match(/excerpt:\s*["']?(.*?)["']?\n/);
            const categoryMatch = content.match(
              /category:\s*["']?(.*?)["']?\n/,
            );

            const title = titleMatch ? titleMatch[1] : "";
            const excerpt = excerptMatch ? excerptMatch[1] : "";
            const category = categoryMatch ? categoryMatch[1] : "General";
            const slug = title
              ? title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")
              : "";

            // Remove frontmatter block completely using regex
            const bodyContent = content
              .replace(/^---[\s\S]*?---\n*/, "")
              .trim();

            setFormData({
              ...formData,
              title: title || formData.title,
              excerpt: excerpt || formData.excerpt,
              category: category || formData.category,
              slug: slug || formData.slug,
              content: bodyContent,
              coverImage: thumbnailUrl || formData.coverImage,
            });
            setIsAIModalOpen(false);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
