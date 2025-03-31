'use client';

import React from 'react';
import Project from '../components/Project';

// Mock data for projects
const mockProjects = [
  {
    id: "1",
    name: "E-commerce Website Redesign",
    budget: "15000",
    startDate: "2024-03-01",
    finishDate: "2024-05-15",
    status: "done" as const,
    buyer: {
      name: "John Smith",
      company: "TechRetail Inc."
    },
    todos: [
      { id: "1", text: "Design new homepage layout", completed: true },
      { id: "2", text: "Implement responsive design", completed: true },
      { id: "3", text: "Add product filtering system", completed: false },
      { id: "4", text: "Integrate payment gateway", completed: false },
      { id: "5", text: "Set up analytics dashboard", completed: false }
    ]
  },
  {
    id: "2",
    name: "3D Product Visualization",
    budget: "8000",
    startDate: "2024-03-15",
    finishDate: "2024-04-30",
    status: "active" as const,
    buyer: {
      name: "Sarah Johnson",
      company: "FurniturePlus"
    },
    todos: [
      { id: "1", text: "Create 3D models of products", completed: true },
      { id: "2", text: "Add texture mapping", completed: true },
      { id: "3", text: "Implement rotation controls", completed: false },
      { id: "4", text: "Optimize for web performance", completed: false }
    ]
  },
  {
    id: "3",
    name: "Mobile App UI/UX Design",
    budget: "12000",
    startDate: "2024-04-01",
    finishDate: "2024-06-30",
    status: "pending" as const,
    buyer: {
      name: "Michael Chen",
      company: "StartupX"
    },
    todos: [
      { id: "1", text: "Create user personas", completed: false },
      { id: "2", text: "Design wireframes", completed: false },
      { id: "3", text: "Create high-fidelity mockups", completed: false },
      { id: "4", text: "Design component library", completed: false }
    ]
  }
];

export default function ProjectsPage() {
  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Our Projects</h1>
        <p>Explore our ongoing and completed projects</p>
      </div>
      
      <div className="projects-grid">
        {mockProjects.map((project) => (
          <Project
            key={project.id}
            id={project.id}
            title={project.name}
            owner={project.buyer.name}
            budget={project.budget}
            startDate={project.startDate}
            endDate={project.finishDate}
            status={project.status}
            todos={project.todos}
          />
        ))}
      </div>
    </div>
  );
} 