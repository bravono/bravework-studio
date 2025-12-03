"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import FilesToUpload from "../components/FilesToUpload";
import { getCurrencySymbol } from "lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import { FileUpIcon } from "lucide-react";

// Hooks
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import useExchangeRates from "@/hooks/useExchangeRates";
import CurrencySelector from "../components/CurrencySelector";

// Import the icons we will use as inline SVG.
// This is an example of a simple SVG icon for a forward arrow.
const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 ml-2"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

// A spinner icon for loading states
const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

interface ProductCategory {
  category_id: number;
  category_name: string;
  category_description: string;
  accepted_files: string;
  budget_ranges: { range_label: string; range_value: string }[];
  timelines: { timeline_label: string; timeline_value: string }[];
}

function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const user = session?.user;

  const { exchangeRates, ratesLoading } = useExchangeRates();
  const [step, setStep] = useState(1);
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
  });
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [files, setFiles] = useState<File[]>([]);
  const [fileInfos, setFileInfos] = useState<
    { fileName: string; fileSize: string; fileUrl: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();

  // Get the service from URL parameters and fetch categories
  useEffect(() => {
    const serviceTitle = searchParams.get("service");
    if (serviceTitle) {
      setSelectedService(decodeURIComponent(serviceTitle));
    }
  }, [searchParams, formData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const categories = await response.json();
        setProductCategories(categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const getSelectedService = useCallback(() => {
    return productCategories.find(
      (product) => product.category_name === selectedService
    );
  }, [productCategories, selectedService]);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;

      const newFiles = Array.from(selectedFiles);
      const selectedServiceData = getSelectedService();

      const validFiles = newFiles.filter((file) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        return selectedServiceData?.accepted_files
          .split(",")
          .includes(extension);
      });

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [getSelectedService]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

  const handleNextStep = () => {
    if (step === 1 && !selectedService) {
      toast.error("Please select a service before proceeding.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // File upload logic
    const fileUploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "orders");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error uploading ${file.name}: ${errorData.message}`);
      }
      return response.json();
    });

    try {
      const uploadedFiles = await Promise.all(fileUploadPromises);
      const newFileInfos = uploadedFiles.map((blobDataRaw, index) => ({
        fileUrl: blobDataRaw.url,
        fileName: blobDataRaw.pathname || new URL(blobDataRaw.url).pathname,
        fileSize: blobDataRaw.size || files[index].size,
      }));
      setFileInfos(newFileInfos);

      // Submit order to API
      const formDataToSend = new FormData();
      const selectedServiceData = getSelectedService();
      if (selectedServiceData) {
        formDataToSend.append(
          "serviceId",
          String(selectedServiceData.category_id)
        );
      }

      if (user) {
        formDataToSend.append("first_name", user.name.split(" ")[0]);
        formDataToSend.append("last_name", user.name.split(" ")[1]);
        formDataToSend.append("companyName", user.companyName || "");
        formDataToSend.append("phone", user.phone || "");
        formDataToSend.append("email", user.email);
      } else {
        Object.entries(formData).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });
      }
      formDataToSend.append("budget", formData.budget);
      formDataToSend.append("timeline", formData.timeline);
      formDataToSend.append("projectDescription", formData.projectDescription);
      formDataToSend.append("files", JSON.stringify(newFileInfos));

      const orderResponse = await fetch("/api/user/orders", {
        method: "POST",
        body: formDataToSend,
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(`Error submitting order: ${errorData.message}`);
      }

      toast.success("Your order has been submitted!");
      if (files.length > 0) toast.success("Files uploaded successfully!");

      setTimeout(() => {
        router.push("/order/success");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "An error occurred. Please try again.");
      setError(err.message || "Unknown error");
    } finally {
      setIsSubmitting(false);
    }

    // Formspree submission (kept outside try/catch as per original logic)
    try {
      const formspreeData = {
        ...formData,
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

    // Reset form fields
    setFormData({
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      phone: "",
      projectDescription: "",
      budget: "",
      timeline: "",
    });
    setFiles([]);
  };

  const renderStep = () => {
    const selectedServiceData = getSelectedService();
    const serviceIcons = ["🎨", "🌐", "📱", "✨", "🎮", "🎙️", "🤼‍♂️"];

    switch (step) {
      case 1:
        // Step 1: Service Selection
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              1. Choose a Service
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productCategories.map((product, index) => (
                <div
                  key={index}
                  className={`flex flex-col p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    selectedService === product.category_name
                      ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]"
                      : "border-gray-200 hover:border-blue-400 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedService(product.category_name)}
                >
                  <div className="text-4xl mb-4">
                    {serviceIcons[index % serviceIcons.length]}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {product.category_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {product.category_description}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedService}
                className={`flex items-center px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Next <ArrowRightIcon />
              </button>
            </div>
          </>
        );

      case 2:
        // Step 2: Contact Info (for guests) or Project Details (for logged-in users)
        if (!user) {
          // Guest form
          return (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                2. Your Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 rounded-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={`flex items-center px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Next <ArrowRightIcon />
                </button>
              </div>
            </>
          );
        }
      // Fall through to the next step if user is logged in
      // eslint-disable-next-line no-fallthrough
      case 3:
      default:
        // Step 3: Project Details
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {user ? "2. Project Details" : "3. Project Details"}
            </h2>
            <div className="flex flex-col gap-6">
              {/* Currency selection */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Select Currency
                </p>
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onSelect={(currency) => updateSelectedCurrency(currency)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="budget"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    disabled={!selectedServiceData || ratesLoading}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a budget range</option>
                    {ratesLoading ? (
                      <option disabled>Loading rates...</option>
                    ) : (
                      selectedServiceData?.budget_ranges.map((range, index) => {
                        const convertedLabel = convertCurrency(
                          range.range_value,
                          exchangeRates?.[selectedCurrency],
                          getCurrencySymbol(selectedCurrency)
                        );
                        return (
                          <option key={index} value={range.range_value}>
                            {convertedLabel}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="timeline"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Timeline
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    required
                    disabled={!selectedServiceData}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a timeline</option>
                    {selectedServiceData?.timelines.map((timeline, index) => (
                      <option key={index} value={timeline.timeline_value}>
                        {timeline.timeline_label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="projectDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Description
                </label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Files
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-md p-6 text-center transition-colors duration-200 hover:border-gray-400">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept={selectedServiceData?.accepted_files}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={!selectedServiceData}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <FileUpIcon />
                    <p className="mt-2 text-gray-500">
                      Drag and drop files here or{" "}
                      <span className="text-blue-600 font-medium">
                        click to browse
                      </span>
                    </p>
                    {selectedServiceData && (
                      <small className="mt-1 text-xs text-gray-400">
                        Accepted formats: {selectedServiceData.accepted_files}
                      </small>
                    )}
                  </div>
                </div>
                {files.length > 0 && (
                  <FilesToUpload files={files} removeFile={removeFile} />
                )}
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 rounded-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedServiceData}
                className="flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Submitting...
                  </>
                ) : (
                  "Submit Order"
                )}
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased flex flex-col items-center p-4">
      <main className="w-full max-w-4xl mx-auto py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Order a Service
          </h1>
          <p className="text-lg text-gray-500">
            Fill out the form to get started on your project.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
        >
          {renderStep()}
        </form>
      </main>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
          Loading...
        </div>
      }
    >
      <Page />
    </Suspense>
  );
}
