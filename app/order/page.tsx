"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../components/Navbar";
import Progress from "../components/Progress";

export default function OrderPage() {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    projectDescription: "",
    budget: "",
    timeline: "",
    files: "",
  });
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileInfos, setFileInfos] = useState<
    { fileName: string; fileSize: string; fileUrl: string }[]
  >([]);
  const icons = ["🎨", "🌐", "📱", "✨", "🎮", "🎙️", "🤼‍♂️"];

  // Get the service from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceTitle = params.get("service");
    if (serviceTitle) {
      setSelectedService(decodeURIComponent(serviceTitle));
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("/api/categories");
      const categories = await response.json();
      setProductCategories(categories);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("File Infos:", fileInfos);
    console.log("Files:", files);
  }, [files, fileInfos]);

  const getSelectedService = () => {
    return productCategories.find(
      (product) => product.category_name === selectedService
    );
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const errors: string[] = [];

    const newFiles = Array.from(files);
    const selectedServiceData = productCategories.find(
      (p) => p.category_name === selectedService
    );

    // Filter files based on accepted extensions
    const validFiles = newFiles.filter((file) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return selectedServiceData?.accepted_files.split(",").includes(extension);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Upload files first
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
          const blobDataRaw = await response.json();
          const blobData = {
            url: blobDataRaw.url,
            pathname: blobDataRaw.pathname || new URL(blobDataRaw.url).pathname,
            size: blobDataRaw.size || files[i].size,
          };
          setFileInfos((prev) => [
            ...prev,
            {
              fileUrl: blobData.url,
              fileName: blobData.pathname,
              fileSize: String(blobData.size),
            },
          ]);
          toast(`File ${file.name} uploaded successfully!`);
        } else {
          const errorData = await response.json();

          toast(
            `Error uploading ${file.name}: ${
              errorData.error.message || "Failed"
            }`
          );
          setSubmitStatus("error");
        }
      } catch (err: any) {
        toast(
          `Network error uploading ${file.name}: ${err.message || "Unknown"}`
        );
        setSubmitStatus("error");
      }
    }

    const formDataToSend = new FormData();

    // We need the Id of the selected service not name
    const selectedServiceData = productCategories.find(
      (product) => product.category_name === selectedService
    );
    if (selectedServiceData) {
      formDataToSend.append("serviceId", selectedServiceData.category_id);
    }
    const entries = Object.entries(formData);
    entries.slice(0, -1).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    formDataToSend.append("files", JSON.stringify(fileInfos));

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          body: formDataToSend,
        });

        if (response.ok) {
          const data = await response.json();
          toast(`Order submitted successfully!`);
          setSubmitStatus("success");
          setError(null); // Clear any previous errors
        } else {
          const errorData = await response.json();
          toast(
            `Error submitting order: ${
              errorData.message || "Could not submit order"
            }`
          );
          setError(errorData.error);
          setSubmitStatus("error");
        }
      } catch (error) {
        toast("An error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
    }
    
    try {
      // Prepare data for Formspree (exclude files)
      const formspreeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        projectDescription: formData.projectDescription,
        budget: formData.budget,
        timeline: formData.timeline,
        service: selectedService,
      };

      await fetch("https://formspree.io/f/mblykjkv", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formspreeData),
      });
    } catch (err) {
      // Optionally handle Formspree errors
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    console.log("Input changed:", e.target.name, e.target.value);
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

  return (
    <main>
      <ToastContainer />
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
                {productCategories.map((product, index) => (
                  <div
                    key={index}
                    className={`service-option ${
                      selectedService === product.category_name
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedService(product.category_name);
                      window.history.pushState(
                        null,
                        "",
                        `/order?service=${encodeURIComponent(
                          product.category_name
                        )}`
                      );
                    }}
                  >
                    <div className="service-option-icon">{icons[index]}</div>
                    <h3>{product.category_name}</h3>
                    <p>{product.category_description}</p>
                    <div className="accepted-files">
                      <small>Accepted files: {product.accepted_files}</small>
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
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
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
                  {getSelectedService()?.budget_ranges.map((range, index) => (
                    <option key={index} value={range.range_value}>
                      {range.range_label}
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
                    <option key={index} value={timeline.timeline_value}>
                      {timeline.timeline_label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="projectDescription">Project Description</label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
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
                    accept={getSelectedService()?.accepted_files}
                    className="file-input"
                    disabled={!selectedService}
                  />
                  <div className="file-upload-prompt">
                    <span className="upload-icon">📁</span>
                    <p>Drag and drop files here or click to browse</p>
                    <small>
                      Accepted formats: {getSelectedService()?.accepted_files}
                    </small>
                  </div>
                </div>
                {files.length > 0 &&
                isSubmitting &&
                files.length > fileInfos.length ? (
                  <div className="uploading-indicator">
                    <span>Uploading files...</span>
                    <Progress
                      value={Math.round(
                        (fileInfos.length / files.length) * 100
                      )}
                    />
                  </div>
                ) : files.length > 0 &&
                  isSubmitting &&
                  files.length === fileInfos.length ? (
                  <div className="uploading-indicator">
                    <span>File Uploaded</span>
                    <Progress value={100} />
                  </div>
                ) : null}
                {files.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Files To Upload:</h4>
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
                className="submit-button"
                disabled={!selectedService || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : " Submit Order"}
              </button>
              {submitStatus === "success" && (
                <div className="success-message">
                  Thank you for your order! We'll review it and get back
                  to you via email.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="error-message">
                  There was an error submitting your order. Please try
                  again.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
