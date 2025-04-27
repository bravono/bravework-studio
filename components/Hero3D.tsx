"use client";

import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, AnimationMixer } from "three";
import { useGLTF } from "@react-three/drei";

export default function Hero3D() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  const { scene, animations } = useGLTF("assets/Isometric-Office.glb");
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (animations && animations.length > 0) {
      mixerRef.current = new AnimationMixer(scene);
      const action = mixerRef.current.clipAction(animations[0]);
      action.play();
    }

    return () => {
      mixerRef.current?.stopAllAction();
    };
  }, [scene, animations]);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);
  });

  return (
    <primitive
      object={scene}
      scale={isMobile ? 8 : 2.5}
      position={isMobile ? [0, -8, 0] : [1, -1.3, 5]}
      rotation={isMobile ? [0, -0.7, 0] : [0, -0.55, 0]}
    />
  );
}
