"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Outfit } from "next/font/google";
import { useSearchParams } from "next/navigation";
import StudioSubNavBar from "../../components/StudioSubNavBar";
import ContactForm from "../../components/ContactForm";
import Breadcrumbs from "../../components/Breadcrumbs";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

function StudioContactContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const getPreFilledMessage = () => {
    const category = searchParams.get("category");
    const scope = searchParams.get("scope");
    const timeline = searchParams.get("timeline");

    if (searchParams.get("fromWizard") === "true") {
      return "";
    }

    if (category || scope || timeline) {
      let msg = "I'm interested in a project with the following details:\n";
      if (category) msg += `- Category: ${category}\n`;
      if (scope) msg += `- Scope: ${scope}\n`;
      if (timeline) msg += `- Timeline: ${timeline}\n`;
      return msg;
    }
    return "";
  };

  const [wizardData, setWizardData] = useState<any>(null);

    useEffect(() => {
          if (!wizardData) return;
      
          window.dataLayer = window.dataLayer || [];
      
          window.dataLayer.push({
            event: "studio_quote_request",
            service_name: wizardData.title,
            service_id: wizardData.id,
            price: wizardData.budgetAmount,
            currency: wizardData.budgetCurrency,
            page: ""
          });
        }, [wizardData]);

  useEffect(() => {
    if (searchParams.get("fromWizard") === "true") {
      const stored = sessionStorage.getItem("wizardOrderData");
      if (stored) {
        setWizardData(JSON.parse(stored));
      }
    }
  }, [searchParams]);

  return (
    <main className="bg-black min-h-screen">
      <StudioSubNavBar />

      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Studio", href: "/studio" },
              { label: "Contact", href: "/studio/contact" },
            ]}
          />

          <div className="text-center mb-16 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-5xl sm:text-7xl font-black text-white mb-6 ${outfit.className}`}
            >
              Start a <span className="text-green-500">Conversation</span>
            </motion.h1>
            <p className="text-xl text-gray-400">
              Have a project in mind? Whether you're in Lagos, Abuja, or
              anywhere globally, our specialized team is ready to bring your
              vision to life.
            </p>
            {wizardData && (
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl">
                <h2 className="text-xl font-bold text-green-400 mb-2">
                  Wizard Details Saved
                </h2>
                <p className="text-gray-300">
                  Your project details have been recorded safely. Please complete this final form with your contact information to finalize and submit your quote request.
                </p>
              </div>
            )}
          </div>

          <ContactForm
            defaultDepartment="Studio"
            showDepartmentSelector={false}
            title={wizardData ? "Finalize Your Quote" : "Studio Inquiry"}
            description={wizardData ? "Please provide your contact information to proceed." : "Our specialized team typically responds within 12-24 hours. Tell us about your vision, and let's build something elite."}
            accentColor="green"
            wizardData={wizardData}
            defaultEmail={session?.user?.email ?? undefined}
          />
        </div>
      </section>
    </main>
  );
}

export default function StudioContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <StudioContactContent />
    </Suspense>
  );
}
