"use client";

import React from "react";
import Project from "../components/Project";
import { projects } from "../services/localDataService"; // Assuming you have a local data service to fetch projects

// Mock data for projects
export default function ProjectsPage() {
  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Our Projects</h1>
        <p>Explore our ongoing and completed projects</p>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <Project
            key={project.id}
            id={project.id}
            owner={project.owner}
            budget={project.budget}
            startDate={project.startDate}
            endDate={project.endDate}
            status={project.status}
            todos={project.todos}
            title={project.title}
          />
        ))}
      </div>
    </div>
  );
}
