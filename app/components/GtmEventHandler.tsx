// components/GtmEventHandler.tsx
'use client'; // Mark this as a Client Component

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Define a type for the dataLayer item
interface DataLayerEvent {
    event: string;
    page: string;
    [key: string]: any; // Allow other properties
}

// Define the dataLayer on the window object if it doesn't exist
declare global {
    interface Window {
    dataLayer: DataLayerEvent[];
    }
}

// Function to push pageview event
const pageview = (url: string) => {
    window.dataLayer = window.dataLayer || []; // Ensure dataLayer exists
    window.dataLayer.push({
    event: 'pageview',
    page: url,
    });
    console.log(`GTM Pageview: ${url}`); // Optional: for debugging
};

export default function GtmEventHandler() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Initialize dataLayer on first load if GTM is present
        // GTM snippet in layout should handle the initial setup,
        // but ensure dataLayer array exists for subsequent pushes.
        const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
        if (GTM_ID) {
            window.dataLayer = window.dataLayer || [];
        }
    }, []); // Runs only once on component mount


    useEffect(() => {
        const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
        if (GTM_ID) {
            const url = pathname + searchParams.toString();
            pageview(url);
        }
        // Note: GTM's built-in History Change trigger might also work here,
        // depending on your GTM setup. This manual push ensures it fires.
    }, [pathname, searchParams]); // Trigger effect when path or search params change

    return null; // This component doesn't render anything visual
}