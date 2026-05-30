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
        position={[0, 0, 0]}
        scale={[1, 0.55, 0.65]}
        opacity={0.95}
        speed={0.12}
        segments={30}
        bounds={[3.35, 2.4, 3.5]}
        color="#ffffff"
        concentrate="inside"
      />

      {/* Left lobe */}
      <Cloud
        seed={2}
        position={[-1.2, -0.1, -0.5]}
        scale={[0.65, 0.4, 0.5]}
        opacity={0.75}
        speed={0.1}
        segments={20}
        bounds={[2, 1.86, 2.5]}
        color="#ffffff"
        concentrate="inside"
      />

      {/* Right lobe */}
      <Cloud
        seed={3}
        position={[1.3, 0, -0.4]}
        scale={[0.7, 0.45, 0.55]}
        opacity={0.8}
        speed={0.16}
        segments={22}
        bounds={[2.15, 2, 2.8]}
        color="#ffffff"
        concentrate="inside"
      />

      {/* Top puff */}
      <Cloud
        seed={4}
        position={[0.2, 1.3, 0.1]}
        scale={[0.45, 0.35, 0.4]}
        opacity={0.7}
        speed={0.18}
        segments={16}
        bounds={[2, 1.73, 2]}
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
        position: [0, 0.5, 14],
        fov: 38,
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
