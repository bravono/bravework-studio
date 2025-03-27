'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/Navbar';

export default function Testimonials() {
  const [formData, setFormData] = useState({
    favoritePart: '',
    impact: '',
    recommendation: '',
    name: '',
    companyName: '',
    email: '',
    linkedin: '',
    profilePicture: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
  };

  return (
    <main>
      <Navbar />
      <section className="testimonials-section">
        <div className="container">
          <h1 className="section-title">Share Your Experience</h1>
          <p className="section-subtitle">We value your feedback and would love to hear about your experience working with us.</p>
          
          <form onSubmit={handleSubmit} className="testimonial-form">
            <div className="form-group">
              <label htmlFor="favoritePart">What was your favorite part of working with us?</label>
              <textarea
                id="favoritePart"
                name="favoritePart"
                value={formData.favoritePart}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Tell us what you enjoyed most..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="impact">How did working with us impact your business/life?</label>
              <textarea
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Share the impact we had..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="recommendation">Would you recommend us to others? Why or why not?</label>
              <textarea
                id="recommendation"
                name="recommendation"
                value={formData.recommendation}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Share your thoughts about recommending us..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter your company name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Business Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your business email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="Enter your LinkedIn profile URL"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture</label>
              <div className="file-upload">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                />
                {previewUrl && (
                  <div className="image-preview">
                    <Image
                      src={previewUrl}
                      alt="Profile preview"
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="submit-button">
              Submit Testimonial
            </button>
          </form>
        </div>
      </section>
    </main>
  );
} 