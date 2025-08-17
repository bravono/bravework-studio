import React from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { projects } from "../../services/localDataService";
import { ArrowLeft } from "lucide-react";

export default function ProjectDetails({
  params,
}: {
  params: { id: number };
}) {
  const project = projects.find((p) => p.id == params.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!project) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project not found
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div
          id="project-card"
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
              {project.title}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-600">
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Category</span>
                <span className="text-gray-600">{project.category}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Budget</span>
                <span className="text-gray-600">{project.budget}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Client</span>
                <span className="text-gray-600">{project.owner}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Timeline</span>
                <span className="text-gray-600">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Project Overview */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Project Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Tasks */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tasks</h2>
              <ul className="space-y-3">
                {project.todos.map((todo) => (
                  <li
                    key={todo.id}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg transition-colors duration-200
                      ${
                        todo.completed
                          ? "bg-green-100 text-gray-600 line-through"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }
                    `}
                  >
                    <span
                      className={`
                        w-5 h-5 flex items-center justify-center rounded-full border-2
                        ${
                          todo.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white border-gray-400"
                        }
                      `}
                    >
                      {todo.completed && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </span>
                    <span>{todo.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}