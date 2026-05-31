"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { midPoint, createGlowTexture } from "./helpers";
import { PARTICLE_COUNT } from "./data";

export function ConnectionParticles({
  fromId, toId, worldRefs, color, sequence,
}: {
  fromId: string; toId: string;
  worldRefs: Map<string, THREE.Vector3>;
  color: string;
  sequence: number;
}) {
  const texture = useMemo(() => createGlowTexture(color), [color]);
  const pr = useRef<THREE.Group>(null);

  const startTime = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => -Math.random() * 4 - sequence * 0.48 - i * 1.2)
  );

  useFrame((state) => {
    if (!pr.current) return;
    const from = worldRefs.get(fromId);
    const to = worldRefs.get(toId);
    if (!from || !to) return;
    const ctrl = midPoint(from, to, 0.15);
    const curve = new THREE.CatmullRomCurve3([from.clone(), ctrl, to.clone()]);
    const t = state.clock.elapsedTime;
    const speed = 0.25;
    const cycle = 1 / speed;
    pr.current.children.forEach((c, i) => {
      let elapsed = t - startTime.current[i];
      if (elapsed >= cycle) {
        // new cycle: random short gap before restarting
        const gap = Math.random() * 0.6;
        startTime.current[i] = t - gap;
        elapsed = t - startTime.current[i];
      }
      const raw = Math.max(0, Math.min(1, elapsed / cycle));
      c.position.copy(curve.getPointAt(raw));
      const pulse = 0.7 + Math.sin(t * 1.5 + i * 1.1) * 0.1;
      (c.scale as THREE.Vector3).setScalar(0.6 * pulse);
    });
  });

  return (
    <group ref={pr}>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <sprite key={i} scale={[0.6, 0.6, 1]}>
          <spriteMaterial map={texture} transparent opacity={0.3} depthTest={true} />
        </sprite>
      ))}
    </group>
  );
}
