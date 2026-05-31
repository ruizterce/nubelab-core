"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGlowTexture } from "./helpers";

export function GlowSprite({ color, scale: s, opacity: o }: { color: string; scale: number; opacity: number }) {
  const ref = useRef<THREE.Sprite>(null);
  const [tex] = useState(() => createGlowTexture(color));

  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 2.5) * 0.4;
    ref.current.scale.setScalar(s + pulse * s * 0.5);
    (ref.current.material as THREE.SpriteMaterial).opacity = o + pulse * 0.3;
  });

  return (
    <sprite ref={ref} scale={[s, s, 1]}>
      <spriteMaterial map={tex} transparent opacity={o} depthTest={false} />
    </sprite>
  );
}
