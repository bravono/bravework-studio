"use client";

import React, { useState, useEffect } from "react";
import { SessionUser } from "@/app/types/auth";
import {
  GraduationCap,
  Briefcase,
  Baby,
  Key,
  Edit3,
  ShieldAlert,
  Archive,
} from "lucide-react";

// Module Imports (Lazy loaded or direct imports)
import StudentView from "./modules/StudentView";
import ContributorView from "./modules/ContributorView";
import ClientView from "./modules/ClientView";
import RenterView from "./modules/RenterView";
import ParentView from "./modules/ParentView";

// Using a type alias for roles to ensure type safety
type UserRole =
  | "student"
  | "client"
  | "parent"
  | "renter"
  | "contributor"
  | "instructor"
  | "admin"
  | "freelancer";

interface DashboardShellProps {
  user: any; // Using any for now to match Session structure roughly, but ideally Typed
  roles: string[];
}

export default function DashboardShell({ user, roles }: DashboardShellProps) {
  // Normalize roles to lowercase
  const normalizedRoles = roles.map((r) => r.toLowerCase());

  // Determine default active view
  // Priority: Student -> Client -> Renter -> Contributor -> Parent
  const getDefaultView = () => {
    if (normalizedRoles.includes("student")) return "student";
    if (normalizedRoles.includes("client")) return "client";
    if (normalizedRoles.includes("renter")) return "renter";
    if (normalizedRoles.includes("contributor")) return "contributor";
    if (normalizedRoles.includes("parent")) return "parent";
    return normalizedRoles[0] || "student";
  };

  const [activeView, setActiveView] = useState<string>(getDefaultView());

  // Available Views Configuration
  const views = [
    {
      id: "student",
      label: "Academy",
      icon: GraduationCap,
      color: "text-blue-600",
    },
    {
      id: "client",
      label: "Studio",
      icon: Briefcase,
      color: "text-purple-600",
    },
    { id: "renter", label: "Rentals", icon: Key, color: "text-orange-600" },
    {
      id: "contributor",
      label: "Contributor",
      icon: Edit3,
      color: "text-pink-600",
    },
    { id: "parent", label: "Kids", icon: Baby, color: "text-green-600" },
    // { id: "instructor", label: "Instructor", icon: Archive, color: "text-indigo-600" },
  ];

  // Filter views based on user roles
  const availableViews = views.filter((view) =>
    normalizedRoles.includes(view.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground text-gray-500">
            You are viewing your dashboard as a{" "}
            <span className="font-semibold capitalize text-gray-900">
              {activeView}
            </span>
            .
          </p>
        </div>

        {/* Role Switcher */}
        {availableViews.length > 1 && (
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            {availableViews.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`
                                        flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                                        ${
                                          isActive
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                                        }
                                    `}
                >
                  <Icon size={16} className={isActive ? view.color : ""} />
                  {view.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* View Content */}
      <div className="min-h-[500px]">
        {activeView === "student" && <StudentView user={user} />}
        {activeView === "client" && <ClientView user={user} />}
        {activeView === "renter" && <RenterView user={user} />}
        {activeView === "parent" && <ParentView user={user} />}
        {activeView === "contributor" && <ContributorView user={user} />}

        {/* Fallback if role exists but no view defined yet */}
        {!views.find((v) => v.id === activeView) && (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl">
            <ShieldAlert className="h-10 w-10 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold">View Not Implemented</h3>
            <p className="text-gray-500">
              The dashboard view for {activeView} is coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
