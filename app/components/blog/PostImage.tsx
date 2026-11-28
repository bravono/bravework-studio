"use client";

import React, { useState, useEffect } from "react";

interface PostImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function PostImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/assets/Bravework_Studio-Logo-Color.png",
}: PostImageProps) {
  const [imgSrc, setImgSrc] = useState(src || "/assets/DOF0160.png");

  useEffect(() => {
    setImgSrc(src || "/assets/DOF0160.png");
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}
