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
      <Cloud
        seed={10}
        position={[0.2, 3, 2.8]}
        scale={[0.6, 0.55, 0.65]}
        opacity={1}
        speed={0.1}
        segments={16}
        bounds={[3, 0.5, 0.5]}
        color="#ffffff"
        concentrate="inside"
        volume={5}
        fade={20}
        growth={6}
      />
            <Cloud
        seed={9}
        position={[0.2, 3, 2.8]}
        scale={[0.6, 0.55, 0.65]}
        opacity={0.5}
        speed={0.3}
        segments={16}
        bounds={[3, 0.7, 0.6]}
        color="#d7eefd"
        concentrate="outside"
        volume={6}
        fade={30}
        growth={8}
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
        position: [0, 9.6, 11],
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
      <CloudPlatform />
    </Canvas>
  );
});
