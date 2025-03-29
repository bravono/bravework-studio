'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

// This would typically come from a database or API
const projects = [
  {
    id: '3d-character-design',
    title: '3D Character Design',
    category: '3D Services',
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    description: 'Custom character design for a mobile game',
    details: {
      client: 'Game Studio X',
      year: '2024',
      tools: ['Blender', 'ZBrush', 'Substance Painter'],
      description: 'A detailed 3D character design project for a mobile game. The character was created with a focus on stylized aesthetics while maintaining realistic proportions and appealing features.',
      challenges: [
        'Creating a unique character design that stands out',
        'Optimizing the model for mobile performance',
        'Achieving the right balance between style and realism'
      ],
      solutions: [
        'Developed a distinctive character silhouette',
        'Implemented efficient topology and texture mapping',
        'Created a custom shader for the desired visual style'
      ]
    }
  },
  {
    id: 'ecommerce-website',
    title: 'E-commerce Website',
    category: 'Web Development',
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    description: 'Full-stack e-commerce platform with modern UI',
    details: {
      client: 'Retail Solutions Inc.',
      year: '2024',
      tools: ['Next.js', 'Node.js', 'MongoDB', 'Stripe'],
      description: 'A comprehensive e-commerce platform featuring a modern, responsive design with advanced filtering, search capabilities, and secure payment integration.',
      challenges: [
        'Implementing real-time inventory management',
        'Optimizing performance for high traffic',
        'Ensuring secure payment processing'
      ],
      solutions: [
        'Developed a robust caching system',
        'Implemented server-side rendering for better SEO',
        'Integrated secure payment gateway with fraud detection'
      ]
    }
  },
  {
    id: 'mobile-app-ui',
    title: 'Mobile App UI',
    category: 'UI/UX Design',
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    description: 'User interface design for a fitness tracking app',
    details: {
      client: 'FitLife Technologies',
      year: '2024',
      tools: ['Figma', 'Adobe XD', 'Protopie'],
      description: 'A modern and intuitive mobile app interface design focusing on user engagement and seamless navigation for fitness tracking and workout planning.',
      challenges: [
        'Creating an engaging onboarding experience',
        'Designing intuitive workout tracking interface',
        'Ensuring accessibility for all users'
      ],
      solutions: [
        'Developed interactive onboarding tutorials',
        'Created customizable workout dashboard',
        'Implemented comprehensive accessibility features'
      ]
    }
  },
  {
    id: 'architectural-visualization',
    title: 'Architectural Visualization',
    category: '3D Services',
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    description: 'Realistic 3D visualization of a modern building',
    details: {
      client: 'Modern Architects Co.',
      year: '2024',
      tools: ['3ds Max', 'V-Ray', 'Photoshop'],
      description: 'High-quality architectural visualization project showcasing a modern commercial building with realistic materials, lighting, and environmental effects.',
      challenges: [
        'Achieving photorealistic material quality',
        'Optimizing render times for large scenes',
        'Creating accurate lighting simulation'
      ],
      solutions: [
        'Developed custom material libraries',
        'Implemented efficient rendering techniques',
        'Created dynamic lighting system'
      ]
    }
  },
  {
    id: 'corporate-website',
    title: 'Corporate Website',
    category: 'Web Development',
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    description: 'Responsive corporate website with CMS integration',
    details: {
      client: 'Global Enterprises Ltd.',
      year: '2024',
      tools: ['WordPress', 'React', 'Tailwind CSS'],
      description: 'A professional corporate website featuring a modern design, content management system, and seamless integration with various business tools.',
      challenges: [
        'Implementing multilingual support',
        'Creating efficient content management workflow',
        'Ensuring cross-browser compatibility'
      ],
      solutions: [
        'Developed custom translation system',
        'Created intuitive content management interface',
        'Implemented comprehensive testing suite'
      ]
    }
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    category: 'UI/UX Design',
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    description: 'Complete brand identity design system',
    details: {
      client: 'StartupX',
      year: '2024',
      tools: ['Adobe Illustrator', 'Photoshop', 'InDesign'],
      description: 'A comprehensive brand identity project including logo design, color palette, typography, and brand guidelines for consistent visual communication.',
      challenges: [
        'Creating memorable brand mark',
        'Developing scalable design system',
        'Ensuring brand consistency across platforms'
      ],
      solutions: [
        'Designed distinctive logo with multiple variations',
        'Created comprehensive style guide',
        'Developed brand asset management system'
      ]
    }
  }
];

export default function PortfolioItem({ params }: { params: { id: string } }) {
  const project = projects.find(p => p.id === params.id);

  if (!project) {
    return (
      <main>
        <Navbar />
        <div className="container">
          <h1>Project not found</h1>
          <Link href="/portfolio" className="btn-primary">Back to Portfolio</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <section className="portfolio-detail-section">
        <div className="container">
          <Link href="/portfolio" className="back-link">← Back to Portfolio</Link>
          
          <div className="portfolio-detail">
            <div className="portfolio-detail-header">
              <span className="portfolio-category">{project.category}</span>
              <h1>{project.title}</h1>
              <p className="portfolio-description">{project.description}</p>
            </div>

            <div className="portfolio-detail-image">
              <img src={project.image} alt={project.title} />
            </div>

            <div className="portfolio-detail-content">
              <div className="project-info">
                <div className="info-item">
                  <h3>Client</h3>
                  <p>{project.details.client}</p>
                </div>
                <div className="info-item">
                  <h3>Year</h3>
                  <p>{project.details.year}</p>
                </div>
                <div className="info-item">
                  <h3>Tools Used</h3>
                  <div className="tools-list">
                    {project.details.tools.map((tool, index) => (
                      <span key={index} className="tool-tag">{tool}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="project-description">
                <h2>Project Overview</h2>
                <p>{project.details.description}</p>
              </div>

              <div className="project-challenges">
                <h2>Challenges</h2>
                <ul>
                  {project.details.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>

              <div className="project-solutions">
                <h2>Solutions</h2>
                <ul>
                  {project.details.solutions.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}