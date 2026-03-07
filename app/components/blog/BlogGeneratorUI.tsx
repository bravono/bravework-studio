"use client";

import React, { useState } from "react";
import { Outfit } from "next/font/google";
import {
  Sparkles,
  Send,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

interface BlogGeneratorUIProps {
  onClose: () => void;
  onGenerated: (content: string) => void;
}

export default function BlogGeneratorUI({
  onClose,
  onGenerated,
}: BlogGeneratorUIProps) {
  const [topic, setTopic] = useState("");
  const [pointOfView, setPointOfView] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic) {
      setError("Please provide a topic.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setStatus("Initiating specialized agent fleet...");

    try {
      const response = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, pointOfView }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Post generated successfully!");
        setTimeout(() => {
          onGenerated(data.content);
        }, 1000);
      } else {
        setError(data.error || "Failed to generate blog post.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-indigo-50"
      >
        <div className="relative p-8 md:p-12">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2
              className={`${outfit.className} text-3xl font-black text-gray-900`}
            >
              AI Blog <span className="text-indigo-600">Generator</span>
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                What's the topic?
              </label>
              <input
                type="text"
                placeholder="e.g. The Future of AI in Creative Studios"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                Point of View / Angle (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="e.g. AI won't replace creators, it will empower them. Focus on human-AI collaboration."
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                value={pointOfView}
                onChange={(e) => setPointOfView(e.target.value)}
                disabled={isGenerating}
              />
              <p className="mt-2 text-xs text-gray-400 ml-1 italic">
                The agent fleet will use this as their core argument.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {isGenerating && (
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-pulse">
                <div className="flex items-center gap-4 text-indigo-700 font-bold">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{status}</span>
                </div>
                <div className="mt-4 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-full w-1/2 bg-indigo-600 rounded-full"
                  />
                </div>
              </div>
            )}

            {!isGenerating && !status.includes("complete") && (
              <button
                onClick={handleGenerate}
                className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-[2rem] hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Send className="w-5 h-5" />
                Empower the Agent Fleet
              </button>
            )}

            {status.includes("successfully") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-50 text-green-700 rounded-2xl flex items-center gap-4 font-bold border border-green-100"
              >
                <CheckCircle2 className="w-8 h-8" />
                <span>{status}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
