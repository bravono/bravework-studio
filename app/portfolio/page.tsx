'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Portfolio() {
  const projects = [
    {
      id: '3d-character-design',
      title: '3D Character Design',
      category: '3D Services',
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      description: 'Custom character design for a mobile game'
    },
    {
      id: 'ecommerce-website',
      title: 'E-commerce Website',
      category: 'Web Development',
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      description: 'Full-stack e-commerce platform with modern UI'
    },
    {
      id: 'mobile-app-ui',
      title: 'Mobile App UI',
      category: 'UI/UX Design',
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      description: 'User interface design for a fitness tracking app'
    },
    {
      id: 'architectural-visualization',
      title: 'Architectural Visualization',
      category: '3D Services',
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      description: 'Realistic 3D visualization of a modern building'
    },
    {
      id: 'corporate-website',
      title: 'Corporate Website',
      category: 'Web Development',
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      description: 'Responsive corporate website with CMS integration'
    },
    {
      id: 'brand-identity',
      title: 'Brand Identity',
      category: 'UI/UX Design',
      image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
      description: 'Complete brand identity design system'
    }
  ];

  return (
    <main>
      <Navbar />
      <section className="portfolio-section">
        <div className="container">
          <h1 className="section-title">Our Portfolio</h1>
          <div className="portfolio-grid">
            {projects.map((project) => (
              <Link href={`/portfolio/${project.id}`} key={project.id} className="portfolio-item">
                <div className="portfolio-image">
                  <img src={project.image} alt={project.title} />
                </div>
                <div className="portfolio-content">
                  <span className="portfolio-category">{project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 