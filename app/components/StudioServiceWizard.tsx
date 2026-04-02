"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Mail, Paperclip, Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { services } from "../services/localDataService";
import CurrencySelector from "./CurrencySelector";

const timelineOptions = [
  { id: "urgent", label: "Urgent ( < 1 month)", description: "Fast track development" },
  { id: "standard", label: "Standard (1-3 months)", description: "Typical project lifecycle" },
  { id: "flexible", label: "Flexible", description: "Long-term partnership" },
];

export default function StudioServiceWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    category: "",
    scope: "",
    description: "",
    budgetAmount: "",
    budgetCurrency: "NGN",
    requirements: "",
    fileUrl: "",
    timeline: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wizardServices = services.filter((s) => s.title !== "Training Services");
  const selectedService = wizardServices.find((s) => s.title === formData.category);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    let uploadedFileUrl = "";

    try {
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("category", "orders");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedFileUrl = data.url;
        }
      }

      const finalData = { ...formData, fileUrl: uploadedFileUrl };
      sessionStorage.setItem("wizardOrderData", JSON.stringify(finalData));

      // Route to contact
      router.push("/studio/contact?fromWizard=true");
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const currentStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">What do you need help with?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wizardServices.map((service, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFormData({ ...formData, category: service.title });
                    handleNext();
                  }}
                  className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-left group ${
                    formData.category === service.title
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-800/50 border-gray-700 hover:border-green-500/50 hover:bg-green-500/5"
                  }`}
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <span className="text-xl font-bold text-white mb-2">{service.title}</span>
                  <span className="text-sm text-gray-400 leading-relaxed">{service.description}</span>
                </button>
              ))}
            </div>
          </>
        );
      case 1:
        return (
          <>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">What's the project scope?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedService?.subServices?.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFormData({ ...formData, scope: sub.name });
                    handleNext();
                  }}
                  className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-left group ${
                    formData.scope === sub.name
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-800/50 border-gray-700 hover:border-green-500/50 hover:bg-green-500/5"
                  }`}
                >
                  <span className="text-xl font-bold text-white mb-2">{sub.name}</span>
                  <span className="text-sm text-gray-400 leading-relaxed">{sub.description}</span>
                </button>
              ))}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">Tell us about your project</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 mb-2 font-medium">Short Description</label>
                <textarea
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  rows={4}
                  placeholder="A brief overview of your business or what you're trying to build..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <button
                onClick={handleNext}
                disabled={!formData.description.trim()}
                className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">What's your project budget?</h2>
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-gray-400 mb-2 font-medium">Currency</label>
                <CurrencySelector
                  selectedCurrency={formData.budgetCurrency as any}
                  onSelect={(currency) => setFormData({ ...formData, budgetCurrency: currency })}
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 font-medium mt-4">Estimated Budget Amount</label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                />
              </div>
              <button
                onClick={handleNext}
                disabled={!formData.budgetAmount}
                className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors mt-6"
              >
                Continue
              </button>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">Detailed Project Requirements</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 mb-2 font-medium">Project Requirements & Expectations</label>
                <textarea
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  rows={5}
                  placeholder="List out the specific features required, competitors to reference, or anything else..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 font-medium">Attach Files (Optional)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-xl cursor-pointer hover:bg-gray-800/50 hover:border-green-500 transition-colors bg-gray-800/20">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-400">
                        {file ? <span className="text-green-500 font-semibold">{file.name}</span> : <><span className="font-semibold text-white">Click to upload</span> or drag and drop</>}
                      </p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG or ZIP (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors mt-4"
              >
                Continue
              </button>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">What's your timeline?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {timelineOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFormData({ ...formData, timeline: opt.label });
                    handleNext();
                  }}
                  className={`flex flex-col items-start p-6 rounded-2xl border transition-all text-left group ${
                    formData.timeline === opt.label
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-800/50 border-gray-700 hover:border-green-500/50 hover:bg-green-500/5"
                  }`}
                >
                  <span className="text-xl font-bold text-white mb-2">{opt.label}</span>
                  <span className="text-sm text-gray-400 leading-relaxed">{opt.description}</span>
                </button>
              ))}
            </div>
          </>
        );
      case 6: // Final step
        return (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-green-500/20">
              <Mail size={40} />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">You're all set!</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-md mx-auto">
              We've gathered the initial details. Let's finalize your custom quote.
            </p>
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-3 w-full max-w-sm mx-auto px-8 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Uploading Details...
                </>
              ) : (
                <>Get Custom Quote <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const maxSteps = 7; // Total steps = 0 to 6

  return (
    <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-800 p-8 sm:p-12 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-grow flex flex-col"
        >
          <div className="flex justify-between items-center mb-12">
            <span className="text-sm font-bold text-green-500 uppercase tracking-widest">
              Step {Math.min(currentStep + 1, maxSteps)} of {maxSteps - 1}
            </span>
            {currentStep > 0 && currentStep < 6 && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft size={18} /> Back
              </button>
            )}
          </div>
          {currentStepContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
