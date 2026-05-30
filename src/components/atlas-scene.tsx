"use client";

import { useRef, useMemo, type MutableRefObject } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Sphere, Html } from "@react-three/drei";
import * as THREE from "three";

/* ── data ─────────────────────────────────────────── */

const ORBIT_RADIUS = 2.33;
const CORE_Z = 2.5;

const NODE_BASE: Record<string, [number, number, number]> = {
  core: [0, 3, CORE_Z],
  infra: [0, 3, CORE_Z - ORBIT_RADIUS],   // back
  author: [-ORBIT_RADIUS, 3, CORE_Z],     // left
  lab: [ORBIT_RADIUS, 3, CORE_Z],         // right
  ops: [0, 3, CORE_Z + ORBIT_RADIUS],     // front
};

const CORE_POS = new THREE.Vector3(0, 3, CORE_Z);
const ORBIT_SPEED = 0.075;

const VARIANT_COLOR: Record<string, string> = {
  core: "#1a6b52",
  author: "#5a5476",
  lab: "#b85c28",
  infra: "#1b4d6b",
  ops: "#3d4a52",
};

const FLOW_COLOR: Record<string, string> = {
  core: "#7ae8c0",
  author: "#b0a8e8",
  lab: "#f0b878",
  infra: "#78b8f0",
  ops: "#b0bcc8",
};

const CONNECTIONS = [
  { from: "core", to: "author" },
  { from: "core", to: "infra" },
  { from: "core", to: "lab" },
  { from: "core", to: "ops" },
];

const PARTICLE_COUNT = 5;

/* ── helpers ──────────────────────────────────────── */

function midPoint(a: THREE.Vector3, b: THREE.Vector3, lift: number) {
  const m = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  m.y += lift;
  return m;
}

function createGlowTexture(color: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;

  // stacked circles for natural light falloff
  const stops = [
    { r: 0.00, a: 1.0 },
    { r: 0.03, a: 0.95 },
    { r: 0.08, a: 0.75 },
    { r: 0.18, a: 0.40 },
    { r: 0.35, a: 0.12 },
    { r: 0.55, a: 0.03 },
    { r: 0.78, a: 0.005 },
    { r: 1.00, a: 0.0 },
  ];

  for (let i = stops.length - 1; i >= 0; i--) {
    const r = stops[i].r * half;
    ctx.beginPath();
    ctx.arc(half, half, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = stops[i].a;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  return new THREE.CanvasTexture(canvas);
}

/* ── connection curve + data particles ────────────── */

function ConnectionParticles({
  fromId,
  toId,
  worldRefs,
  color,
}: {
  fromId: string;
  toId: string;
  worldRefs: MutableRefObject<Map<string, THREE.Vector3>>;
  color: string;
}) {
  const texture = useMemo(() => createGlowTexture(color), [color]);
  const particleRefs = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!particleRefs.current) return;
    const from = worldRefs.current.get(fromId);
    const to = worldRefs.current.get(toId);
    if (!from || !to) return;

    const ctrl = midPoint(from, to, 0.15);
    const curve = new THREE.CatmullRomCurve3([from.clone(), ctrl, to.clone()]);

    const t = state.clock.elapsedTime;
    particleRefs.current.children.forEach((child, i) => {
      const offset = i / PARTICLE_COUNT;
      const raw = ((t * 0.22 + offset) % 1 + 1) % 1;
      const pt = curve.getPointAt(raw);
      child.position.copy(pt);

      const pulse = 0.7 + Math.sin(t * 3 + offset * Math.PI * 2) * 0.3;
      const s = child.scale as THREE.Vector3;
      s.setScalar(0.6 * pulse);
    });
  });

  return (
    <group ref={particleRefs}>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <sprite key={i} scale={[0.6, 0.6, 1]}>
          <spriteMaterial
            map={texture}
            transparent
            opacity={0.85}
            depthTest={false}
          />
        </sprite>
      ))}
    </group>
  );
}

/* ── node sphere ──────────────────────────────────── */

function NodeSphere({
  id,
  basePos,
  worldRefs,
  variant,
  disabled,
  isActive,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  id: string;
  basePos: THREE.Vector3;
  worldRefs: MutableRefObject<Map<string, THREE.Vector3>>;
  variant: string;
  disabled?: boolean;
  isActive: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const color = disabled ? "#88949e" : VARIANT_COLOR[variant] ?? "#556c78";

  // orbit params (non-core only)
  const isCore = id === "core";
  const orbitRadius = useMemo(() => {
    if (isCore) return 0;
    const dx = basePos.x - CORE_POS.x;
    const dz = basePos.z - CORE_POS.z;
    return Math.sqrt(dx * dx + dz * dz);
  }, [isCore, basePos]);
  const orbitInitialAngle = useMemo(() => {
    if (isCore) return 0;
    return Math.atan2(basePos.z - CORE_POS.z, basePos.x - CORE_POS.x);
  }, [isCore, basePos]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (isCore) {
      // core stays centered with gentle bob
      groupRef.current.position.x = CORE_POS.x + Math.cos(t * 0.5) * 0.06;
      groupRef.current.position.y = CORE_POS.y + Math.sin(t * 0.6) * 0.1;
      groupRef.current.position.z = CORE_POS.z + Math.sin(t * 0.4) * 0.06;
    } else {
      // orbit around core in XZ plane (all nodes same Y plane)
      const angle = orbitInitialAngle + t * ORBIT_SPEED;
      groupRef.current.position.x = CORE_POS.x + Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = CORE_POS.z + Math.sin(angle) * orbitRadius;
      groupRef.current.position.y = basePos.y;
    }

    // update world ref
    worldRefs.current.get(id)?.copy(groupRef.current.position);
  });

  return (
    <group ref={groupRef} position={[basePos.x, basePos.y, basePos.z]}>
      {/* outer glow */}
      <Sphere args={[isActive ? 0.45 : 0.32, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.25 : 0.1}
        />
      </Sphere>
      {/* core sphere */}
      <Sphere args={[0.22, 32, 32]} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <meshBasicMaterial color={color} />
      </Sphere>
      {/* label */}
      <Html position={[0, -0.38, 0]} center style={{ pointerEvents: "none" }}>
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#131a20",
            background: "rgba(255,255,255,0.85)",
            padding: "3px 7px",
            whiteSpace: "nowrap",
            borderRadius: 3,
          }}
        >
          {id}
        </span>
      </Html>
    </group>
  );
}

/* ── full scene ───────────────────────────────────── */

type SceneProps = {
  activeNodeId: string;
  hoveredNodeId: string | null;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
  disabledNodes: string[];
};

function Scene({ activeNodeId, hoveredNodeId, onSelectNode, onHoverNode, disabledNodes }: SceneProps) {
  const worldRefs = useRef<Map<string, THREE.Vector3>>(new Map());

  // init world refs
  useMemo(() => {
    for (const [id, pos] of Object.entries(NODE_BASE)) {
      if (!worldRefs.current.has(id)) {
        worldRefs.current.set(id, new THREE.Vector3(pos[0], pos[1], pos[2]));
      }
    }
  }, []);

  const nodeBasePositions = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    for (const [id, pos] of Object.entries(NODE_BASE)) {
      map.set(id, new THREE.Vector3(pos[0], pos[1], pos[2]));
    }
    return map;
  }, []);

  return (
    <>
      {CONNECTIONS.map(({ from, to }) => (
        <ConnectionParticles
          key={`${from}-${to}`}
          fromId={from}
          toId={to}
          worldRefs={worldRefs}
          color={FLOW_COLOR[to] ?? "#e8eaed"}
        />
      ))}

      {Array.from(nodeBasePositions.entries()).map(([id, pos]) => (
        <NodeSphere
          key={id}
          id={id}
          basePos={pos}
          worldRefs={worldRefs}
          variant={id}
          disabled={disabledNodes.includes(id)}
          isActive={id === activeNodeId}
          onClick={() => onSelectNode(id)}
          onPointerOver={() => onHoverNode(id)}
          onPointerOut={() => onHoverNode(null)}
        />
      ))}
    </>
  );
}

/* ── canvas wrapper ───────────────────────────────── */

export function AtlasScene(props: SceneProps) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true, premultipliedAlpha: true }}
      camera={{ position: [0, 8, 11], fov: 42, near: 0.1, far: 80 }}
      style={{ position: "absolute", inset: 0, zIndex: 3 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
