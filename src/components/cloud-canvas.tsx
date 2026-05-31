"use client";

import { memo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Cloud, Clouds } from "@react-three/drei";
import * as THREE from "three";

function CloudPlatform() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.3) * 0.12;
    groupRef.current.position.x = Math.cos(t * 0.2) * 0.06;
  });

  return (
    <Clouds material={THREE.MeshBasicMaterial} ref={groupRef}>
      {/* Main cloud body — chunky toon style */}
      <Cloud
        seed={1}
        position={[0, 3, 2.5]}
        scale={[1, 0.55, 0.65]}
        opacity={1}
        speed={0.05}
        segments={16}
        bounds={[2.6, 1.8, 2.8]}
        color="#ffffff"
        concentrate="inside"
      />

      {/* Left lobe */}
      <Cloud
        seed={2}
        position={[-1, 2.9, 2.2]}
        scale={[0.55, 0.4, 0.45]}
        opacity={0.85}
        speed={0.04}
        segments={10}
        bounds={[1.6, 1.5, 1.8]}
        color="#f8fafc"
        concentrate="inside"
      />

      {/* Right lobe */}
      <Cloud
        seed={3}
        position={[1, 3, 2.1]}
        scale={[0.55, 0.4, 0.45]}
        opacity={0.85}
        speed={0.04}
        segments={10}
        bounds={[1.6, 1.5, 1.8]}
        color="#f4f6f8"
        concentrate="inside"
      />
    </Clouds>
  );
}

export const CloudCanvas = memo(function CloudCanvas() {
  return (
    <Canvas
      flat
      gl={{
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        toneMapping: THREE.NoToneMapping,
      }}
      camera={{
        position: [0, 8, 11],
        fov: 42,
        near: 0.1,
        far: 80,
      }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
      }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={3.5} color="#ffffff" />
      <directionalLight
        position={[0, 12, 1]}
        intensity={3.0}
        color="#ffffff"
      />
      <CloudPlatform />
    </Canvas>
  );
});
