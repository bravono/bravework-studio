"use client";

import { useState, useEffect, useRef } from "react";

export function useCountUp(end: number, duration: number) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const progressRatio = Math.min(progress / duration, 1);
      const newCount = Math.floor(progressRatio * end);

      setCount(newCount);

      if (progressRatio < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          frameId = requestAnimationFrame(animate);
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      });
    };

    // Safe fallback for server environments or when IntersectionObserver is not defined
    if (typeof window !== "undefined" && window.IntersectionObserver) {
      observerRef.current = new IntersectionObserver(handleIntersect, {
        threshold: 0.5,
      });

      if (ref.current) {
        observerRef.current.observe(ref.current);
      }
    } else {
      // Fallback if no window or IntersectionObserver
      setCount(end);
    }

    return () => {
      cancelAnimationFrame(frameId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [end, duration]);

  return { count, ref };
}
