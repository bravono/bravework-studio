"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Code,
  Clapperboard,
  Briefcase,
  Mail,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    id: "category",
    title: "What do you need help with?",
    options: [
      {
        id: "web",
        label: "Web/Mobile App",
        icon: Code,
        description: "Next.js, React, Mobile Apps",
      },
      {
        id: "3d",
        label: "3D Modeling & Animation",
        icon: Clapperboard,
        description: "Characters, Assets, Explainer Videos",
      },
      {
        id: "uiux",
        label: "UI/UX Design",
        icon: Briefcase,
        description: "Styleguides, Prototypes, User Research",
      },
    ],
  },
  {
    id: "complexity",
    title: "What's the project scope?",
    options: [
      {
        id: "mvp",
        label: "MVP / Startup Idea",
        description: "Get to market quickly",
      },
      {
        id: "enterprise",
        label: "Enterprise Solution",
        description: "Scalable, robust systems",
      },
      {
        id: "asset",
        label: "Single Asset / Animation",
        description: "Quick turnaround specialized work",
      },
    ],
  },
  {
    id: "timeline",
    title: "What's your timeline?",
    options: [
      {
        id: "urgent",
        label: "Urgent ( < 1 month)",
        description: "Fast track development",
      },
      {
        id: "standard",
        label: "Standard (1-3 months)",
        description: "Typical project lifecycle",
      },
      {
        id: "flexible",
        label: "Flexible",
        description: "Long-term partnership",
      },
    ],
  },
];

export default function StudioServiceWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleSelect = (optionId: string) => {
    const newSelections = { ...selections, [steps[currentStep].id]: optionId };
    setSelections(newSelections);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step reached
      setCurrentStep(steps.length);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-800 p-8 sm:p-12 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
      <AnimatePresence mode="wait">
        {currentStep < steps.length ? (
          <motion.div
            key={steps[currentStep].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-grow flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-sm font-bold text-green-500 uppercase tracking-widest">
                Step {currentStep + 1} of {steps.length}
              </span>
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">
              {steps[currentStep].title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps[currentStep].options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className="flex flex-col items-start p-6 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left group"
                >
                  {option.icon && (
                    <div className="p-3 bg-gray-700 rounded-xl mb-4 group-hover:bg-green-500/20 group-hover:text-green-500 transition-colors">
                      <option.icon size={24} />
                    </div>
                  )}
                  <span className="text-xl font-bold text-white mb-2">
                    {option.label}
                  </span>
                  <span className="text-sm text-gray-400 leading-relaxed">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-grow flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-green-500/20">
              <Mail size={40} />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              You're all set!
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-md">
              We've gathered the initial details. Let's finalize your custom
              quote and get started.
            </p>
            <Link
              href={`/studio/contact?category=${selections.category}&scope=${selections.complexity}&timeline=${selections.timeline}`}
              className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
            >
              Get Custom Quote <ArrowRight size={20} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
