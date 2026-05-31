"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Outlines, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { createGradientMap, TOON_COLORS } from "./helpers";
/* ── geometry config ──────────────────────────────── */

export const NODE_GEOMETRY: Record<string, { geo: string; args: [number, ...number[]]; rotSpeed: [number, number, number] }> = {
  core: { geo: "glb", args: [0], rotSpeed: [0, 0.003, 0] },
  author: { geo: "glb", args: [0], rotSpeed: [0, 0.003, 0] },
  lab: { geo: "torusKnot", args: [0.22, 0.05, 64, 8, 2, 3], rotSpeed: [0.003, 0.01, 0.005] },
  infra: { geo: "glb", args: [0], rotSpeed: [0, 0.004, 0] },
  ops: { geo: "glb", args: [0], rotSpeed: [0, 0.005, 0] },
};

/* ── GLB ──────────────────────────────────────────── */

const DRILL_PATH = "/3d-models/Drill.glb";
const ASTRONAUT_PATH = "/3d-models/Astronaut.glb";
const LANDER_PATH = "/3d-models/Lander-A.glb";
const CARGO_PATH = "/3d-models/Cargo-Depot.glb?v=2";
useGLTF.preload(DRILL_PATH);
useGLTF.preload(ASTRONAUT_PATH);
useGLTF.preload(LANDER_PATH);
useGLTF.preload(CARGO_PATH);

const NODE_MODEL: Record<string, string> = { ops: DRILL_PATH, author: ASTRONAUT_PATH, core: LANDER_PATH, infra: CARGO_PATH };
const NODE_MODEL_SCALE: Record<string, number> = { ops: 0.28, author: 0.15, core: 0.5, infra: 0.3 };
const NODE_MODEL_OFFSET: Record<string, [number, number, number]> = { ops: [0, -0.2, 0], author: [0, -0.35, 0], core: [0, -0.2, 0] };

function GltfModel({ url, scale: s, offset, gradientMap }: { url: string; scale: number; offset?: [number, number, number]; gradientMap: THREE.CanvasTexture }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((ch) => { if ((ch as THREE.Mesh).isMesh) (ch as THREE.Mesh).material = new THREE.MeshToonMaterial({ color: "#ffffff", gradientMap }); });
    return c;
  }, [scene, gradientMap]);

  const pos = offset ?? [0, 0, 0];
  return <primitive object={model} scale={s} position={pos} />;
}

/* ── node mesh ────────────────────────────────────── */

export function NodeMesh({
  id, isHovered, onClick, onPointerOver, onPointerOut,
}: {
  id: string;
  isHovered: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver: () => void; onPointerOut: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const rotRef = useRef<THREE.Group>(null);
  const [gradientMap] = useState(() => createGradientMap(TOON_COLORS));
  const cfg = NODE_GEOMETRY[id] ?? NODE_GEOMETRY.core;

  useFrame(() => {
    if (!rotRef.current) return;
    rotRef.current.rotation.x += cfg.rotSpeed[0];
    rotRef.current.rotation.y += cfg.rotSpeed[1];
    rotRef.current.rotation.z += cfg.rotSpeed[2];
    if (groupRef.current) {
      const t = isHovered ? 1.2 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(t, t, t), 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>
      <group ref={rotRef}>
        {cfg.geo === "glb" ? (
          <GltfModel url={NODE_MODEL[id] ?? DRILL_PATH} scale={NODE_MODEL_SCALE[id] ?? 0.65} offset={NODE_MODEL_OFFSET[id]} gradientMap={gradientMap} />
        ) : (
          <mesh ref={ref}>
            {cfg.geo === "sphere" && <sphereGeometry args={cfg.args as [number, number, number]} />}
            {cfg.geo === "box" && <boxGeometry args={cfg.args as [number, number, number]} />}
            {cfg.geo === "octahedron" && <octahedronGeometry args={cfg.args as [number, number]} />}
            {cfg.geo === "torus" && <torusGeometry args={cfg.args as [number, number, number, number]} />}
            {cfg.geo === "torusKnot" && <torusKnotGeometry args={cfg.args as [number, number, number, number, number, number]} />}
            {cfg.geo === "capsule" && <capsuleGeometry args={cfg.args as [number, number, number, number]} />}
            <meshToonMaterial color="#ffffff" gradientMap={gradientMap} toneMapped={false} />
            <Outlines thickness={0.05} color="#1a3a5c" opacity={0.8} angle={Math.PI / 3} />
          </mesh>
        )}
      </group>
      {/* bloom trigger on hover — emissive pushes values above threshold */}
      {isHovered && (
        <mesh renderOrder={-1}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#000000" emissive="#88aaff" emissiveIntensity={6} toneMapped={false} roughness={1} metalness={0} transparent opacity={0.1}/>
        </mesh>
      )}
    </group>
  );
}
