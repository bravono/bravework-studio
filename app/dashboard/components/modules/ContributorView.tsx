"use client";

import React from "react";
import { PenTool, UploadCloud } from "lucide-react";

export default function ContributorView({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
          <PenTool className="h-8 w-8 text-pink-600" />
        </div>
        <h2 className="text-2xl font-bold text-pink-900 mb-2">
          Contributor Workspace
        </h2>
        <p className="text-pink-700 max-w-md mx-auto mb-6">
          Manage your content, articles, and educational materials for Bravework
          Kids.
        </p>
        <button className="px-6 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition flex items-center gap-2 mx-auto">
          <UploadCloud size={18} />
          Submit New Content
        </button>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-500 italic">
          Content management tools coming soon.
        </p>
      </div>
    </div>
  );
}
