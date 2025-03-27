'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const services = [
  {
    title: '3D Modeling & Animation',
    description: 'Professional 3D modeling, animation, and visualization services for your projects.',
    icon: '🎨',
    acceptedFiles: '.fbx,.obj,.blend,.3ds,.max,.dae',
    budgetRanges: [
      { value: '1000-5000', label: '$1,000 - $5,000' },
      { value: '5000-10000', label: '$5,000 - $10,000' },
      { value: '10000-25000', label: '$10,000 - $25,000' },
      { value: '25000+', label: '$25,000+' }
    ],
    timelines: [
      { value: '1-2months', label: '1-2 months' },
      { value: '2-3months', label: '2-3 months' },
      { value: '3-6months', label: '3-6 months' }
    ]
  },
  {
    title: 'Web Development',
    description: 'Custom web applications and websites built with modern technologies.',
    icon: '🌐',
    acceptedFiles: '.zip,.rar,.pdf,.doc,.docx,.txt',
    budgetRanges: [
      { value: '2000-8000', label: '$2,000 - $8,000' },
      { value: '8000-15000', label: '$8,000 - $15,000' },
      { value: '15000-40000', label: '$15,000 - $40,000' },
      { value: '40000+', label: '$40,000+' }
    ],
    timelines: [
      { value: '2-3months', label: '2-3 months' },
      { value: '3-6months', label: '3-6 months' },
      { value: '6months+', label: '6 months+' }
    ]
  },
  {
    title: 'UI/UX Design',
    description: 'User-centered design solutions that enhance user experience.',
    icon: '✨',
    acceptedFiles: '.psd,.ai,.sketch,.fig,.xd,.pdf',
    budgetRanges: [
      { value: '1500-5000', label: '$1,500 - $5,000' },
      { value: '5000-12000', label: '$5,000 - $12,000' },
      { value: '12000-30000', label: '$12,000 - $30,000' }
    ],
    timelines: [
      { value: '1-2months', label: '1-2 months' },
      { value: '2-3months', label: '2-3 months' },
      { value: '3-4months', label: '3-4 months' }
    ]
  },
  {
    title: 'Game Development',
    description: 'Engaging game development services for various platforms.',
    icon: '🎮',
    acceptedFiles: '.unity,.uproject,.fbx,.obj,.blend',
    budgetRanges: [
      { value: '5000-15000', label: '$5,000 - $15,000' },
      { value: '15000-40000', label: '$15,000 - $40,000' },
      { value: '40000-100000', label: '$40,000 - $100,000' },
      { value: '100000+', label: '$100,000+' }
    ],
    timelines: [
      { value: '3-6months', label: '3-6 months' },
      { value: '6-12months', label: '6-12 months' },
      { value: '12months+', label: '12 months+' }
    ]
  },
  {
    title: 'Voice-Over Services',
    description: 'Professional voice-over services for your videos, games, and multimedia projects.',
    icon: '🎙️',
    acceptedFiles: '.mp3,.wav,.ogg,.aac,.m4a',
    budgetRanges: [
      { value: '500-2000', label: '$500 - $2,000' },
      { value: '2000-5000', label: '$2,000 - $5,000' },
      { value: '5000-10000', label: '$5,000 - $10,000' }
    ],
    timelines: [
      { value: '1-2weeks', label: '1-2 weeks' },
      { value: '2-4weeks', label: '2-4 weeks' },
      { value: '1-2months', label: '1-2 months' }
    ]
  }
];

export default function OrderPage() {
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectDetails: '',
    budget: '',
    timeline: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Get the service from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceTitle = params.get('service');
    if (serviceTitle) {
      setSelectedService(decodeURIComponent(serviceTitle));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', { selectedService, ...formData, files });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const selectedServiceData = services.find(s => s.title === selectedService);
      
      // Filter files based on accepted extensions
      const validFiles = newFiles.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return selectedServiceData?.acceptedFiles.split(',').includes(extension);
      });

      setFiles(prev => [...prev, ...validFiles]);
      
      // Create previews for valid files
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getSelectedService = () => {
    return services.find(service => service.title === selectedService);
  };

  return (
    <main>
      <Navbar />
      <section className="order-section">
        <div className="container">
          <h1 className="section-title">Order a Service</h1>
          <p className="section-subtitle">Fill out the form below to get started with your project</p>
          
          <div className="order-content">
            <div className="service-selection">
              <h2>Select a Service</h2>
              <div className="service-options">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className={`service-option ${selectedService === service.title ? 'selected' : ''}`}
                    onClick={() => setSelectedService(service.title)}
                  >
                    <div className="service-option-icon">{service.icon}</div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div className="accepted-files">
                      <small>Accepted files: {service.acceptedFiles}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectDetails">Project Details</label>
                <textarea
                  id="projectDetails"
                  name="projectDetails"
                  value={formData.projectDetails}
                  onChange={handleInputChange}
                  required
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget">Budget Range</label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                  disabled={!selectedService}
                >
                  <option value="">Select a budget range</option>
                  {getSelectedService()?.budgetRanges.map((range, index) => (
                    <option key={index} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timeline">Project Timeline</label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                  disabled={!selectedService}
                >
                  <option value="">Select a timeline</option>
                  {getSelectedService()?.timelines.map((timeline, index) => (
                    <option key={index} value={timeline.value}>
                      {timeline.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group file-upload-group">
                <label>Project Files</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept={getSelectedService()?.acceptedFiles}
                    className="file-input"
                    disabled={!selectedService}
                  />
                  <div className="file-upload-prompt">
                    <span className="upload-icon">📁</span>
                    <p>Drag and drop files here or click to browse</p>
                    <small>Accepted formats: {getSelectedService()?.acceptedFiles}</small>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    <div className="file-list">
                      {files.map((file, index) => (
                        <div key={index} className="file-item">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <button
                            type="button"
                            className="remove-file"
                            onClick={() => removeFile(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-order-btn"
                disabled={!selectedService}
              >
                Submit Order
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
} 