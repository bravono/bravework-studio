'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { OrbitControls } from '@react-three/drei';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Hero3D from '../components/Hero3D';
import TestimonialCarousel from './components/TestimonialCarousel';
import ProjectCarousel from './components/ProjectCarousel';

// Dynamically import the 3D component to avoid SSR issues
const Hero3DComponent = dynamic(() => import('../components/Hero3D'), { ssr: false });

const services = [
  {
    title: '3D Modeling & Animation',
    description: 'Professional 3D modeling, animation, and visualization services for your projects.',
    icon: '🎨'
  },
  {
    title: 'Web Development',
    description: 'Custom web applications and websites built with modern technologies.',
    icon: '🌐'
  },
  {
    title: 'UI/UX Design',
    description: 'User-centered design solutions that enhance user experience.',
    icon: '✨'
  },
  {
    title: 'Game Development',
    description: 'Engaging game development services for various platforms.',
    icon: '🎮'
  },
  {
    title: 'Voice-Over Services',
    description: 'Professional voice-over services for your videos, games, and multimedia projects.',
    icon: '🎙️'
  },
  {
    title: '3D Training Services',
    description: 'Your kids will love to learn 3D modeling and animation with our simple and easy to understand training services.',
    icon: '🤼‍♂️'
  }
];

export default function Home() {
  return (
    <main>
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 10] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls enableZoom={true} />
            <Hero3DComponent />
          </Canvas>
        </div>
        
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            Bravework Studio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Vitalizing Your Vision With 3D Animation and Web Solutions
          </motion.p>
          <div className="hero-buttons">
            <a href="/order" className="hero-cta">Get Started</a>
            <a href="/payment?service=3D%20Modeling&amount=50000" className="hero-cta" style={{ marginLeft: '1rem' }}>
              Test Payment
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialCarousel />

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href={`/order?service=${encodeURIComponent(service.title)}`} className="order-service-btn">
                  Order Service
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ProjectCarousel />
    </main>
  );
} 