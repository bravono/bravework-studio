"use client";

import React, { useState, useEffect, use } from "react";
import { Suspense } from "react";
import { toast, ToastContainer } from "react-toastify";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import Navbar from "../components/Navbar";
import FilesToUpload from "../components/FilesToUpload";
import { fetchExchangeRates } from "lib/utils/fetchExchangeRate";
import { getCurrencySymbol } from "lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import { ExchangeRates } from "app/types/app";

function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

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
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null
  );
  const [fileInfos, setFileInfos] = useState<
    { fileName: string; fileSize: string; fileUrl: string }[]
  >([]);
  const icons = ["🎨", "🌐", "📱", "✨", "🎮", "🎙️", "🤼‍♂️"];
  const searchParams = useSearchParams();
  const currencies = ["NGN", "USD", "GBP", "EUR"];

  // Get the service from URL parameters
  useEffect(() => {
    const serviceTitle = searchParams.get("service");
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

  // Effect to fetch exchange rates
  useEffect(() => {
    const getRates = async () => {
      setRatesLoading(true);
      try {
        const rates = await fetchExchangeRates();
        console.log("Rates", rates);
        setExchangeRates(rates);
        setRatesError(null);
      } catch (err) {
        console.error("Error fetching exchange rates:", err);
        setRatesError("Failed to load exchange rates.");
      } finally {
        setRatesLoading(false);
      }
    };
    getRates();
  }, []);

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
        formData.append("category", "orders");

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
          toast.success(`File ${file.name} uploaded successfully!`);
        } else {
          const errorData = await response.json();

          toast.error(`Error uploading ${file.name}`);
          setSubmitStatus("error");
        }
      } catch (err: any) {
        toast.error(`Network error uploading ${file.name}`);
        setSubmitStatus("error");
      }
    }

    const formDataToSend = new FormData();

    const selectedServiceData = productCategories.find(
      (product) => product.category_name === selectedService
    );
    if (selectedServiceData) {
      formDataToSend.append("serviceId", selectedServiceData.category_id);
    }

    if (user) {
      // Append fields for logged-in users, using session data for personal info
      formDataToSend.append("first_name", user.name.split(" ")[0] || "");
      formDataToSend.append("last_name", user.name.split(" ")[1] || "");
      formDataToSend.append("companyName", user.companyName || "");
      formDataToSend.append("phone", user.phone || "");
      formDataToSend.append("email", user.email || "");
      formDataToSend.append("budget", formData.budget);
      formDataToSend.append("timeline", formData.timeline);
      formDataToSend.append("projectDescription", formData.projectDescription);
      formDataToSend.append("files", JSON.stringify(fileInfos));
    } else {
      // Append all fields for guests
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("files", JSON.stringify(fileInfos));
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Your order has been submitted!`);
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
      toast.error("An error occurred. Please try again.");
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
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formspreeData),
      });
    } catch (err) {
      console.log("Couldn't post to Formspree");
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
      files: "",
    });
    setFiles([]);
    setFilePreviews([]);
    setTimeout(() => {
      router.push("/order/success");
    }, 2000);
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

  return (
    <main>
      <ToastContainer />
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
            <div className="grid grid-cols-2 gap-3">
              {currencies.map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
                                      ${
                                        selectedCurrency === currency
                                          ? "bg-blue-600 text-white shadow-md"
                                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                                      }`}
                >
                  {currency} - {getCurrencySymbol(currency)}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="order-form">
              {!user ? (
                <>
                  {/* All fields for guests */}
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
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
                    <label htmlFor="lastName">Last Name</label>
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
                    <label htmlFor="companyName">Company Name</label>
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
                  {/* The 4 fields below are also shown for guests */}
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
                      {getSelectedService()?.budget_ranges.map(
                        (range, index) => (
                          <option key={index} value={range.range_value}>
                            {range.range_label}
                          </option>
                        )
                      )}
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
                      {getSelectedService()?.timelines.map(
                        (timeline, index) => (
                          <option key={index} value={timeline.timeline_value}>
                            {timeline.timeline_label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="projectDescription">
                      Project Description
                    </label>
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
                          Accepted formats:{" "}
                          {getSelectedService()?.accepted_files}
                        </small>
                      </div>
                    </div>
                    {files.length > 0 && (
                      <FilesToUpload files={files} removeFile={removeFile} />
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Only these 4 fields for logged-in users */}
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
                      {getSelectedService()?.budget_ranges.map(
                        (range, index) => {
                          const convertedLabel = convertCurrency(
                            range.range_value,
                            exchangeRates &&
                              exchangeRates[selectedCurrency || "NGN"],
                            getCurrencySymbol(selectedCurrency)
                          );

                          return (
                            <option key={index} value={range.range_value}>
                              {convertedLabel}
                            </option>
                          );
                        }
                      )}
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
                      {getSelectedService()?.timelines.map(
                        (timeline, index) => (
                          <option key={index} value={timeline.timeline_value}>
                            {timeline.timeline_label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="projectDescription">
                      Project Description
                    </label>
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
                          Accepted formats:{" "}
                          {getSelectedService()?.accepted_files}
                        </small>
                      </div>
                    </div>
                    {files.length > 0 && (
                      <FilesToUpload files={files} removeFile={removeFile} />
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={!selectedService || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : " Submit Order"}
              </button>
              {submitStatus === "error" && (
                <div className="error-message">
                  There was an error submitting your order. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Page />
    </Suspense>
  );
}
