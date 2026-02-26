import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans } from "next/font/google";
import { Suspense } from "react";
import NextAuthSessionProvider from "./components/SessionProider";
import { ToastContainer } from "react-toastify";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GtmEventHandler from "./components/GtmEventHandler";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: {
    default: "Bravework Studio | Empowering Nigerian Digital Creators",
    template: "%s | Bravework Studio", // For child pages: e.g., "Academy | Bravework Studio"
  },
  description:
    "Lagos-based creative powerhouse offering practical web/mobile/3D services, certified digital skills courses, kids edutainment, and affordable hardware rentals. Learn, create, and grow without barriers – built for African innovation.",
  keywords: [
    "Bravework Studio",
    "digital skills training Lagos",
    "3D animation courses Nigeria",
    "web development services Lagos",
    "UI/UX design Nigeria",
    "hardware rental for students",
    "kids tech edutainment",
    "affordable 3D training",
    "Nigerian digital economy",
  ],
  openGraph: {
    title:
      "Bravework Studio – Empowering Creativity Through Digital Excellence",
    description:
      "From professional web/mobile/3D solutions and niche Academy courses to fun Kids programs and hourly PC rentals. Break barriers, build skills, launch projects – all under one roof in Lagos, Nigeria.",
    url: "https://www.braveworkstudio.com",
    siteName: "Bravework Studio",
    images: [
      {
        url: "/assets/bws_white_logo-black_bg.png", 
        width: 1200,
        height: 630,
        alt: "Bravework Studio – Empowering Nigerian Digital Creators",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bravework Studio | Built for African Innovation",
    description:
      "Practical digital training, pro services, kids edutainment & hardware access – empowering Lagos creators.",
    images: ["/assets/bws_white_logo-black_bg.png"],
  },
  // Optional extras for better SEO/local relevance
  alternates: {
    canonical: "https://www.braveworkstudio.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  // If you have verification later
  // verification: { google: "your-google-verification-code" },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const env = process.env.NODE_ENV;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Google Tag Manager Script (in Head) */}
      {/* Use Next.js Script component for better performance */}
      {GTM_ID && env !== "development" && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      )}
      {/* End Google Tag Manager Script */}
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="50x50"
          href="assets/bws_white_logo_black_bg.png"
        ></link>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        {/* SEO Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Bravework Studio",
              url: "https://braveworkstudio.com",
              logo: "https://braveworkstudio.com/assets/bws_white_logo_black_bg.png",
              description:
                "We are your one-stop shop for bringing your ideas to life, from stunning animation to seamless web development.",
              sameAs: [
                "https://www.facebook.com/BraveworkStudio?mibextid=ZbWKwL",
                "https://www.instagram.com/bravework_studio?igsh=bzJjZDlxNTZnY2h4",
                "https://www.linkedin.com/company/braveworkstudio/",
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  whatsapp: "+234-902-322-4596",
                  contactType: "customer service",
                  areaServed: "Worldwide",
                  availableLanguage: ["English"],
                },
              ],
            }),
          }}
        />
        {/* End SEO Schema.org JSON-LD */}
      </head>
      <body className={dmSans.className}>
        {/* Google Tag Manager (noscript) (immediately after body tag) */}
        {GTM_ID && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `
                <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
              `,
            }}
          />
        )}
        {/* End Google Tag Manager (noscript) */}
        <NextAuthSessionProvider>
          <ToastContainer position="bottom-right" theme="colored" />
          <Navbar />
          <main className="min-h-screen pt-24 transition-all duration-300">
            {children}
          </main>
        </NextAuthSessionProvider>
        <Footer />
        <Suspense fallback={null}>
          <GtmEventHandler />
        </Suspense>
      </body>
    </html>
  );
}
