"use client";

import React from "react";
import { Baby, Trophy, Star } from "lucide-react";
import Link from "next/link";

export default function ParentView({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <Baby className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-indigo-900 mb-2">
          Bravework Kids Dashboard
        </h2>
        <p className="text-indigo-700 max-w-md mx-auto mb-6">
          Track your child's creative journey, episodes watched, and badged
          earned.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/kids"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            Go to Kids Zone
          </Link>
        </div>
      </div>

      {/* Mock Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-yellow-500" />
            <h3 className="font-bold text-gray-800">Recent Badges</h3>
          </div>
          <div className="flex gap-2">
            <div
              className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center"
              title="Explorer"
            >
              🌟
            </div>
            <div
              className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
              title="Creator"
            >
              🎨
            </div>
            <div
              className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
              title="Scientist"
            >
              🔬
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Star className="text-purple-500" />
            <h3 className="font-bold text-gray-800">Learning Streak</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">3 Days</p>
          <p className="text-xs text-gray-500">Keep it up!</p>
        </div>
      </div>
    </div>
  );
}
