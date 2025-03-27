'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export default function Hero3D() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[5, 5, 5]} />
      <meshStandardMaterial 
        color="#008751"
        metalness={0.7}
        roughness={0.2}
        emissive="#008751"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
} 