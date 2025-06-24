import React, { useEffect } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Nosifer, DM_Sans } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GtmEventHandler from "./components/GtmEventHandler";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { auth } from "./api/auth/[...nextauth]/route"; 
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Bravework Studio",
  description:
    "We are your one-stop shop for bringing your ideas to life, from stunning animation to seamless web development.",
  openGraph: {
    images: [
      {
        url: "/assets/DOF0160.png",
        width: 800,
        height: 600,
        alt: "Bravework Studio Logo",
      },
    ],
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  
  const session = await auth(); // Get session on the server
  return (
    <html lang="en">
      {/* Google Tag Manager Script (in Head) */}
      {/* Use Next.js Script component for better performance */}
      {GTM_ID && (
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
          href="/Bravework_Studio-Logo-Color.png"
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
              logo: "https://braveworkstudio.com/Bravework_Studio-Logo-Color.png",
              description:
                "We are your one-stop shop for bringing your ideas to life, from stunning animation to seamless web development.",
              sameAs: [
                "https://www.facebook.com/BraveworkStudio?mibextid=ZbWKwL",
                "https://www.instagram.com/https://www.instagram.com/bravework_studio?igsh=bzJjZDlxNTZnY2h4",
                "https://www.linkedin.com/https://www.linkedin.com/in/ahbideen-yusuf-74a232179",
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
        <Navbar />
        <SessionProvider session={session}>{children}</SessionProvider>
        <Footer />
        <Suspense fallback={null}>
          <GtmEventHandler />
        </Suspense>
      </body>
    </html>
  );
}
