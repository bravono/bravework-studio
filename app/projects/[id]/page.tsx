import React from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { projects } from "../../services/localDataService";

export default function ProjectDetails({ params }: { params: { id: number } }) {
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
      <main>
        <Navbar />
        <div className="container">
          <h1>Project not found</h1>
          <Link href="/" className="back-link">
            ← Back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
        <div className="container">
          <Link href="/" className="back-link">
            ← Back
          </Link>

          <div id="project-card" className="project-card" >
            <h1>{project.title}</h1>
            <div className="project-info">
              <div className="info-group">
                <label>Category</label>
                <span>{project.category}</span>
              </div>
              <div className="info-group">
                <label>Budget</label>
                <span>{project.budget}</span>
              </div>
              <div className="info-group">
                <label>Client</label>
                <span>{project.owner}</span>
              </div>
              <div className="info-group">
                <label>Timeline</label>
                <span>
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </span>
              </div>
            </div>
            <div className="project-overview">
              <div className="project-todos">
                <h3>Tasks</h3>
                <ul>
                  {project.todos.map((todo) => (
                    <li
                      key={todo.id}
                      className={todo.completed ? "completed" : ""}
                    >
                      {todo.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="active-project-description">
                <h2>Project Overview</h2>
                <p>{project.description}</p>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}
