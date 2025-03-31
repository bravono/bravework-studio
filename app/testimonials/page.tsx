'use client';

import React from 'react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  content: string;
  rating: number;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'CEO',
    company: 'Tech Solutions Inc.',
    image: '/testimonials/john-smith.jpg',
    content: 'Bravework Studio transformed our digital presence. Their expertise in web development and UI/UX design helped us create a stunning website that perfectly represents our brand.',
    rating: 5,
    date: '2024-03-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'Creative Minds Agency',
    image: '/testimonials/sarah-johnson.jpg',
    content: 'The 3D modeling and animation services provided by Bravework Studio exceeded our expectations. Their attention to detail and creative approach brought our vision to life.',
    rating: 5,
    date: '2024-03-10'
  },
  {
    id: '3',
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'Innovation Labs',
    image: '/testimonials/michael-chen.jpg',
    content: 'Working with Bravework Studio was a game-changer for our project. Their team\'s technical expertise and collaborative approach made the development process smooth and efficient.',
    rating: 5,
    date: '2024-03-05'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    role: 'Design Director',
    company: 'Design Co.',
    image: '/testimonials/emily-rodriguez.jpg',
    content: 'The UI/UX design work by Bravework Studio was exceptional. They understood our brand identity perfectly and created an intuitive, beautiful interface for our users.',
    rating: 5,
    date: '2024-02-28'
  },
  {
    id: '5',
    name: 'David Kim',
    role: 'CTO',
    company: 'StartupX',
    image: '/testimonials/david-kim.jpg',
    content: 'Bravework Studio\'s training programs are top-notch. Their instructors are knowledgeable and passionate about teaching, making complex topics easy to understand.',
    rating: 5,
    date: '2024-02-20'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    role: 'Project Manager',
    company: 'Digital Solutions',
    image: '/testimonials/lisa-thompson.jpg',
    content: 'The corporate training sessions conducted by Bravework Studio were engaging and informative. Our team learned valuable skills that have improved our workflow significantly.',
    rating: 5,
    date: '2024-02-15'
  }
];

export default function TestimonialsPage() {
  return (
    <div className="testimonials-page">
      <div className="container">
        <div className="page-header">
          <h1>Client Testimonials</h1>
          <p>Read what our clients have to say about their experience with Bravework Studio</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-image">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
                <div className="testimonial-info">
                  <h3>{testimonial.name}</h3>
                  <p className="role">{testimonial.role}</p>
                  <p className="company">{testimonial.company}</p>
                </div>
              </div>
              <div className="testimonial-content">
                <p>{testimonial.content}</p>
                <div className="rating">
                  {[...Array(testimonial.rating)].map((_, index) => (
                    <span key={index} className="star">★</span>
                  ))}
                </div>
                <p className="date">{new Date(testimonial.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 