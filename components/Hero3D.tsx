"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { useGLTF } from "@react-three/drei";

export default function Hero3D() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <primitive
      object={useGLTF("assets/Isometric-Office.glb").scene}
      scale={2.5}
      position={[1, -1.3, 5]}
      rotation={[0, -0.55, 0]}
    />
  );
}
