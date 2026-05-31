"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { midPoint, createGlowTexture } from "./helpers";
import { PARTICLE_COUNT } from "./data";

export function ConnectionParticles({
  fromId, toId, worldRefs, color,
}: {
  fromId: string; toId: string;
  worldRefs: Map<string, THREE.Vector3>;
  color: string;
}) {
  const texture = useMemo(() => createGlowTexture(color), [color]);
  const pr = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!pr.current) return;
    const from = worldRefs.get(fromId);
    const to = worldRefs.get(toId);
    if (!from || !to) return;
    const ctrl = midPoint(from, to, 0.15);
    const curve = new THREE.CatmullRomCurve3([from.clone(), ctrl, to.clone()]);
    const t = state.clock.elapsedTime;
    pr.current.children.forEach((c, i) => {
      const raw = ((t * 0.3 + i / PARTICLE_COUNT) % 1 + 1) % 1;
      c.position.copy(curve.getPointAt(raw));
      const pulse = 0.7 + Math.sin(t * 1.5 + i * 1.1) * 0.1;
      (c.scale as THREE.Vector3).setScalar(0.6 * pulse);
    });
  });

  return (
    <group ref={pr}>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <sprite key={i} scale={[0.6, 0.6, 1]}>
          <spriteMaterial map={texture} transparent opacity={0.85} depthTest={true} depthWrite={true} />
        </sprite>
      ))}
    </group>
  );
}
