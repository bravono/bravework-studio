'use client';

import React from 'react';
import Navbar from '../components/Navbar';

const trainingPrograms = [
  {
    title: '3D for Kids',
    description: 'Learn the basics of 3D modeling and animation in a fun, kid-friendly environment.',
    icon: '🎨',
    ageGroup: 'Ages 8-12',
    duration: '8 weeks',
    level: 'Beginner'
  },
  {
    title: 'Web Development for Kids',
    description: 'Introduction to web development through interactive and engaging projects.',
    icon: '🌐',
    ageGroup: 'Ages 10-14',
    duration: '10 weeks',
    level: 'Beginner'
  },
  {
    title: 'UI/UX Design for Kids',
    description: 'Creative design thinking and user interface basics for young designers.',
    icon: '✨',
    ageGroup: 'Ages 8-12',
    duration: '8 weeks',
    level: 'Beginner'
  },
  {
    title: 'Game Development for Kids',
    description: 'Learn to create simple games using kid-friendly development tools.',
    icon: '🎮',
    ageGroup: 'Ages 10-14',
    duration: '12 weeks',
    level: 'Beginner'
  }
];

export default function TrainingPage() {
  return (
    <main>
      <Navbar />
      <section className="training-section">
        <div className="container">
          <h1 className="section-title">Kids Training Programs</h1>
          <p className="section-subtitle">Empowering young minds with technology education</p>
          <div className="training-grid">
            {trainingPrograms.map((program, index) => (
              <div key={index} className="training-card">
                <div className="training-icon">{program.icon}</div>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <div className="training-details">
                  <span className="age-group">{program.ageGroup}</span>
                  <span className="duration">{program.duration}</span>
                  <span className="level">{program.level}</span>
                </div>
                <a href="/contact" className="enroll-button">Enroll Now</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 