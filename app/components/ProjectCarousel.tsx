'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Project {
  id: string;
  title: string;
  owner: string;
  tasks: Task[];
  startDate: string;
  endDate: string;
  status: 'active' | 'done' | 'pending';
}

const projects: Project[] = [
  {
    id: '3d-character-design',
    title: '3D Character Design',
    owner: 'Game Studio X',
    tasks: [
      { id: '1', title: 'Concept Design', completed: true },
      { id: '2', title: 'Modeling', completed: true },
      { id: '3', title: 'Texturing', completed: false },
      { id: '4', title: 'Rigging', completed: false },
      { id: '5', title: 'Animation', completed: false },
      { id: '6', title: 'Final Review', completed: false }
    ],
    startDate: '2024-03-01',
    endDate: '2025-05-15',
    status: 'active'
  },
  {
    id: 'ecommerce-website',
    title: 'E-commerce Website',
    owner: 'Retail Solutions Inc.',
    tasks: [
      { id: '1', title: 'Design Mockups', completed: true },
      { id: '2', title: 'Frontend Development', completed: true },
      { id: '3', title: 'Backend Integration', completed: false },
      { id: '4', title: 'Payment Gateway', completed: false },
      { id: '5', title: 'Testing', completed: false }
    ],
    startDate: '2024-03-15',
    endDate: '2024-03-30',
    status: 'done'
  },
  {
    id: 'mobile-app-ui',
    title: 'Mobile App UI',
    owner: 'FitLife Technologies',
    tasks: [
      { id: '1', title: 'User Research', completed: true },
      { id: '2', title: 'Wireframing', completed: true },
      { id: '3', title: 'UI Design', completed: false },
      { id: '4', title: 'Prototype', completed: false }
    ],
    startDate: '2024-04-01',
    endDate: '2024-07-15',
    status: 'pending'
  },
  {
    id: 'architectural-visualization',
    title: 'Architectural Visualization',
    owner: 'Modern Architects Co.',
    tasks: [],
    startDate: '2024-04-15',
    endDate: '2024-08-01',
    status: 'pending'
  },
  {
    id: 'corporate-website',
    title: 'Corporate Website',
    owner: 'Global Enterprises Ltd.',
    tasks: [],
    startDate: '2024-05-01',
    endDate: '2024-08-15',
    status: 'pending'
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    owner: 'StartupX',
    tasks: [],
    startDate: '2024-05-15',
    endDate: '2024-09-01',
    status: 'pending'
  }
];

export default function ProjectCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProject = projects[currentIndex];

  const nextProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
  };

  // Calculate completion percentage based on completed tasks
  const completedTasks = currentProject.tasks.filter(task => task.completed).length;
  const completionPercentage = (completedTasks / currentProject.tasks.length) * 100;

  // Calculate timeline percentage
  const start = new Date(currentProject.startDate);
  const end = new Date(currentProject.endDate);
  const today = new Date();
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  
  // If the project hasn't started yet, timeline should be 0
  const timelinePercentage = today < start ? 0 : Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="project-carousel-section">
      <div className="container">
        <h2 className="section-title">Current Projects</h2>
        <div className="project-carousel">
          <button className="carousel-arrow prev" onClick={prevProject}>
            <span className="arrow-icon">←</span>
          </button>
          
          <div className="project-card">
            <div className="project-counter">
              {currentIndex + 1} of {projects.length}
            </div>
            <h3 className="project-title">{currentProject.title}</h3>
            <p className="project-owner">{currentProject.owner}</p>
            
            <div className="progress-rings">
              <div className="progress-ring">
                <svg viewBox="0 0 100 100" className="progress-ring__circle">
                  <circle
                    className="progress-ring__circle-bg"
                    cx="50"
                    cy="50"
                    r="45"
                  />
                  <circle
                    className="progress-ring__circle-progress"
                    cx="50"
                    cy="50"
                    r="45"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - completionPercentage / 100)}`
                    }}
                  />
                </svg>
                <div className="progress-ring__content">
                  <span className="progress-ring__label">Tasks</span>
                  <span className="progress-ring__value">{completedTasks} of {currentProject.tasks.length}</span>
                </div>
              </div>

              <div className="progress-ring">
                <svg viewBox="0 0 100 100" className="progress-ring__circle">
                  <circle
                    className="progress-ring__circle-bg"
                    cx="50"
                    cy="50"
                    r="45"
                  />
                  <circle
                    className="progress-ring__circle-progress"
                    cx="50"
                    cy="50"
                    r="45"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - timelinePercentage / 100)}`
                    }}
                  />
                </svg>
                <div className="progress-ring__content">
                  <span className="progress-ring__label">Timeline</span>
                  <span className="progress-ring__value">{Math.round(timelinePercentage)}%</span>
                </div>
              </div>
            </div>

            <div className="project-dates">
              <div className="date">
                <span className="date-label">Start</span>
                <span className="date-value">{formatDate(currentProject.startDate)}</span>
              </div>
              <div className="date">
                <span className="date-label">End</span>
                <span className="date-value">{formatDate(currentProject.endDate)}</span>
              </div>
            </div>

            <Link 
              href={`/projects?highlight=${currentProject.id}`}
              className="view-project-link"
            >
              View Project Details
            </Link>
          </div>

          <button className="carousel-arrow next" onClick={nextProject}>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </section>
  );
} 