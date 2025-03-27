'use client';

import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const comments = await dataService.getComments();
        // Transform comments into testimonials
        const transformedTestimonials = comments.map(comment => ({
          id: comment.id,
          name: comment.name,
          email: comment.email,
          content: comment.body,
          company: comment.email.split('@')[1].split('.')[0],
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=random`
        }));
        setTestimonials(transformedTestimonials);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return <div className="loading">Loading testimonials...</div>;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>
        <p className="section-subtitle">
          Discover how we've helped businesses transform their digital presence
        </p>

        <div className="testimonials-carousel">
          <div className="carousel-container">
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  width={100}
                  height={100}
                />
              </div>
              <div className="testimonial-content">
                <p className="testimonial-text">{currentTestimonial.content}</p>
                <div className="testimonial-info">
                  <span className="testimonial-name">{currentTestimonial.name}</span>
                  <span className="company-name">{currentTestimonial.company}</span>
                </div>
              </div>
            </div>

            <div className="carousel-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 