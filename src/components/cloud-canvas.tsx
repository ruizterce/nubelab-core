"use client";

import { memo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Cloud } from "@react-three/drei";
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
    <group ref={groupRef}>
      {/* Main cloud body */}
      <Cloud
        seed={1}
        position={[0, 3, 2.5]}
        scale={[1, 0.55, 0.65]}
        opacity={0.95}
        speed={0.08}
        segments={35}
        bounds={[2.6, 1.8, 2.8]}
        color="#ffffff"
        concentrate="inside"
      />

      {/* Left lobe */}
      <Cloud
        seed={2}
        position={[-0.9, 2.9, 2.3]}
        scale={[0.55, 0.35, 0.4]}
        opacity={0.7}
        speed={0.06}
        segments={22}
        bounds={[1.6, 1.4, 1.8]}
        color="#ffffff"
        concentrate="inside"
      />

      {/* Right lobe */}
      <Cloud
        seed={3}
        position={[0.9, 3, 2.2]}
        scale={[0.55, 0.35, 0.4]}
        opacity={0.7}
        speed={0.06}
        segments={22}
        bounds={[1.6, 1.4, 1.8]}
        color="#ffffff"
        concentrate="inside"
      />
    </group>
  );
}

export const CloudCanvas = memo(function CloudCanvas() {
  return (
    <Canvas
      gl={{
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
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
      <ambientLight intensity={4.0} color="#ffffff" />
      <directionalLight
        position={[0, 12, 1]}
        intensity={2.5}
        color="#ffffff"
      />
      <CloudPlatform />
    </Canvas>
  );
});
