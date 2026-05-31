"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CORE_POS, ORBIT_SPEED } from "./data";
import { NodeLabel } from "./NodeLabel";

export function OrbitalNode({
  id, basePos, worldRefs, paused, children,
}: {
  id: string; basePos: THREE.Vector3;
  worldRefs: Map<string, THREE.Vector3>;
  paused: boolean;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isCore = id === "core";
  const pauseStart = useRef(0);
  const pauseOffset = useRef(0);
  const orbitRadius = useMemo(() => {
    if (isCore) return 0;
    return Math.sqrt((basePos.x-CORE_POS.x)**2 + (basePos.z-CORE_POS.z)**2);
  }, [isCore, basePos]);
  const orbitAngle = useMemo(() => {
    if (isCore) return 0;
    return Math.atan2(basePos.z-CORE_POS.z, basePos.x-CORE_POS.x);
  }, [isCore, basePos]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    if (paused && pauseStart.current === 0) {
      pauseStart.current = t;
    } else if (!paused && pauseStart.current !== 0) {
      pauseOffset.current += t - pauseStart.current;
      pauseStart.current = 0;
    }
    const et = t - pauseOffset.current - (pauseStart.current ? t - pauseStart.current : 0);
    if (isCore) {
      groupRef.current.position.set(
        CORE_POS.x + Math.cos(t*0.5)*0.06,
        CORE_POS.y + Math.sin(t*0.6)*0.1,
        CORE_POS.z + Math.sin(t*0.4)*0.06,
      );
    } else {
      const a = orbitAngle + et * ORBIT_SPEED;
      groupRef.current.position.set(
        CORE_POS.x + Math.cos(a)*orbitRadius,
        basePos.y,
        CORE_POS.z + Math.sin(a)*orbitRadius,
      );
    }
    worldRefs.get(id)?.copy(groupRef.current.position);
  });

  return (
    <group ref={groupRef} position={[basePos.x, basePos.y, basePos.z]}>
      {children}
      <NodeLabel id={id} />
    </group>
  );
}
