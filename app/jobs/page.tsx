'use client';

import { useState } from 'react';
import Link from 'next/link';

interface JobApplication {
  role: string;
  name: string;
  email: string;
  phone: string;
  portfolio: string;
  experience: string;
  availability: string;
  message: string;
  resume: File | null;
}

export default function JobsPage() {
  const [application, setApplication] = useState<JobApplication>({
    role: '',
    name: '',
    email: '',
    phone: '',
    portfolio: '',
    experience: '',
    availability: '',
    message: '',
    resume: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Here you would typically send the application to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApplication(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="page-header">
          <h1>Join Our Team</h1>
          <p>We're always looking for talented professionals to join our creative team</p>
        </div>

        <div className="roles-grid">
          <div className="role-card">
            <div className="role-icon">💻</div>
            <h3>Web Developer</h3>
            <p>Join us in creating cutting-edge web applications and experiences</p>
            <ul>
              <li>React/Next.js expertise</li>
              <li>TypeScript proficiency</li>
              <li>UI/UX best practices</li>
              <li>API integration</li>
            </ul>
          </div>

          <div className="role-card">
            <div className="role-icon">🎨</div>
            <h3>UI/UX Designer</h3>
            <p>Help us craft beautiful and intuitive user experiences</p>
            <ul>
              <li>Figma/Sketch expertise</li>
              <li>User research</li>
              <li>Prototyping</li>
              <li>Design systems</li>
            </ul>
          </div>

          <div className="role-card">
            <div className="role-icon">🎮</div>
            <h3>3D Artist</h3>
            <p>Create stunning 3D visuals and animations</p>
            <ul>
              <li>Blender/Maya expertise</li>
              <li>Character modeling</li>
              <li>Animation skills</li>
              <li>Texture mapping</li>
            </ul>
          </div>

          <div className="role-card">
            <div className="role-icon">🎲</div>
            <h3>Game Developer</h3>
            <p>Join us in creating engaging and immersive gaming experiences</p>
            <ul>
              <li>Unity/Unreal Engine expertise</li>
              <li>Game mechanics design</li>
              <li>Performance optimization</li>
              <li>Cross-platform development</li>
            </ul>
          </div>
        </div>

        <div className="application-form-container">
          <h2>Apply Now</h2>
          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={application.role}
                onChange={(e) => setApplication(prev => ({ ...prev, role: e.target.value }))}
                required
              >
                <option value="">Select a role</option>
                <option value="web-developer">Web Developer</option>
                <option value="ui-ux-designer">UI/UX Designer</option>
                <option value="3d-artist">3D Artist</option>
                <option value="game-developer">Game Developer</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={application.name}
                  onChange={(e) => setApplication(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={application.email}
                  onChange={(e) => setApplication(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  value={application.phone}
                  onChange={(e) => setApplication(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio">Portfolio URL</label>
                <input
                  type="url"
                  id="portfolio"
                  value={application.portfolio}
                  onChange={(e) => setApplication(prev => ({ ...prev, portfolio: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Years of Experience</label>
              <select
                id="experience"
                value={application.experience}
                onChange={(e) => setApplication(prev => ({ ...prev, experience: e.target.value }))}
                required
              >
                <option value="">Select experience level</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-8">5-8 years</option>
                <option value="8+">8+ years</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                value={application.availability}
                onChange={(e) => setApplication(prev => ({ ...prev, availability: e.target.value }))}
                required
              >
                <option value="">Select availability</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="resume">Resume/CV</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                  className="file-input"
                />
                <div className="file-upload-prompt">
                  <span className="upload-icon">📄</span>
                  <p>Drag and drop your resume here or click to browse</p>
                  <small>Accepted formats: PDF, DOC, DOCX</small>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Cover Letter</label>
              <textarea
                id="message"
                value={application.message}
                onChange={(e) => setApplication(prev => ({ ...prev, message: e.target.value }))}
                rows={5}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>

            {submitStatus === 'success' && (
              <div className="success-message">
                Thank you for your application! We'll review it and get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="error-message">
                There was an error submitting your application. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 