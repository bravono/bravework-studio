"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { orders } from "../services/localDataService"; // Assuming you have a data file with service details

export default function OrderPage() {
  const [selectedService, setSelectedService] = useState("");
  const [uploadUrls, setUploadUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    projectDescription: "",
    budget: "",
    timeline: "",
    projectFiles: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get the service from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceTitle = params.get("service");
    if (serviceTitle) {
      setSelectedService(decodeURIComponent(serviceTitle));
    }
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploaded: string[] = [];
    const errors: string[] = [];

    const newFiles = Array.from(files);
    const selectedServiceData = orders.find((s) => s.title === selectedService);

    // Filter files based on accepted extensions
    const validFiles = newFiles.filter((file) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return selectedServiceData?.acceptedFiles.split(",").includes(extension);
    });
    setFiles((prev) => [...prev, ...validFiles]);

    // Create previews for valid files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploaded.push(data.url);
        } else {
          const errorData = await response.json();
          errors.push(
            `Error uploading ${file.name}: ${errorData.error || "Failed"}`
          );
        }
      } catch (err: any) {
        errors.push(
          `Network error uploading ${file.name}: ${err.message || "Unknown"}`
        );
      }
    }

    setUploadUrls(uploaded);
    setError(errors.length > 0 ? errors.join(", ") : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("service", selectedService);
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    files.forEach((file, index) => {
      formDataToSend.append(`file_${index}`, file);
    });

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();

        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Could not submit order");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }

    // Reset form data and files after submission
    setFormData({
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      phone: "",
      projectDescription: "",
      budget: "",
      timeline: "",
      projectFiles: "",
    });
    setFiles([]);
    setFilePreviews([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const getSelectedService = () => {
    return orders.find((service) => service.title === selectedService);
  };

  return (
    <main>
      <Navbar />
      <section className="order-section">
        <div className="container">
          <h1 className="section-title">Order a Service</h1>
          <p className="section-subtitle">
            Fill out the form below to get started with your project
          </p>

          <div className="order-content">
            <div className="service-selection">
              <h2>Select a Service</h2>
              <div className="service-options">
                {orders.map((service, index) => (
                  <div
                    key={index}
                    className={`service-option ${
                      selectedService === service.title ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedService(service.title);
                      window.history.pushState(
                        null,
                        "",
                        `/order?service=${encodeURIComponent(service.title)}`
                      );
                    }}
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
                <label htmlFor="name">First Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Last Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Company Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.companyName}
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
              <div className="form-group">
                <label htmlFor="projectDetails">Project Description</label>
                <textarea
                  id="projectDetails"
                  name="projectDetails"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  required
                  rows={2}
                />
              </div>
              <div className="form-group file-upload-group">
                <label>Project Files</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept={getSelectedService()?.acceptedFiles}
                    className="file-input"
                    disabled={!selectedService}
                  />
                  <div className="file-upload-prompt">
                    <span className="upload-icon">📁</span>
                    <p>Drag and drop files here or click to browse</p>
                    <small>
                      Accepted formats: {getSelectedService()?.acceptedFiles}
                    </small>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    <div className="file-list">
                      {files.map((file, index) => (
                        <div key={index} className="file-item">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
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
