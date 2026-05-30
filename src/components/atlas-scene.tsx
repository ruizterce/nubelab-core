"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";

/* ── data ─────────────────────────────────────────── */

const NODE_3D: Record<string, [number, number, number]> = {
  core: [0, 0.2, 3],
  infra: [0, 2.2, -1],
  author: [-2.5, 0.8, 1.8],
  lab: [2.8, 0.5, 2],
  ops: [-0.8, -0.8, 4],
};

const VARIANT_COLOR: Record<string, string> = {
  core: "#1a6b52",
  author: "#5a5476",
  lab: "#b85c28",
  infra: "#1b4d6b",
  ops: "#3d4a52",
};

const CONNECTIONS = [
  { from: "core", to: "author" },
  { from: "core", to: "infra" },
  { from: "core", to: "lab" },
  { from: "core", to: "ops" },
];

const PARTICLE_COUNT = 4;

/* ── helpers ──────────────────────────────────────── */

function midPoint(a: THREE.Vector3, b: THREE.Vector3, lift: number) {
  const m = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  m.y += lift;
  return m;
}

/* ── connection curve + data particles ────────────── */

function ConnectionParticles({
  from,
  to,
  color,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
}) {
  const curve = useMemo(() => {
    const ctrl = midPoint(from, to, 0.8);
    return new THREE.CatmullRomCurve3([from, ctrl, to]);
  }, [from, to]);

  const particleRefs = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!particleRefs.current) return;
    const t = state.clock.elapsedTime;
    particleRefs.current.children.forEach((child, i) => {
      const offset = i / PARTICLE_COUNT;
      const raw = ((t * 0.25 + offset) % 1 + 1) % 1;
      const pt = curve.getPointAt(raw);
      child.position.copy(pt);
    });
  });

  return (
    <>
      <Line
        points={curve.getPoints(40)}
        color={color}
        lineWidth={1}
        transparent
        opacity={0.2}
      />
      <group ref={particleRefs}>
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <Sphere key={i} args={[0.06, 8, 8]}>
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </Sphere>
        ))}
      </group>
    </>
  );
}

/* ── node sphere ──────────────────────────────────── */

function NodeSphere({
  id,
  position,
  variant,
  disabled,
  isActive,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  id: string;
  position: THREE.Vector3;
  variant: string;
  disabled?: boolean;
  isActive: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const baseY = position.y;
  const color = disabled ? "#88949e" : VARIANT_COLOR[variant] ?? "#556c78";

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const phase = position.x * 0.5 + position.z * 0.3;
    groupRef.current.position.y =
      baseY + Math.sin(t * 0.6 + phase) * 0.15 + Math.cos(t * 0.4 + phase) * 0.08;
    groupRef.current.position.x =
      position.x + Math.cos(t * 0.5 + phase) * 0.08;
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
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
  const nodePositions3D = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    for (const [id, pos] of Object.entries(NODE_3D)) {
      map.set(id, new THREE.Vector3(pos[0], pos[1], pos[2]));
    }
    return map;
  }, []);

  return (
    <>
      {CONNECTIONS.map(({ from, to }) => {
        const a = nodePositions3D.get(from);
        const b = nodePositions3D.get(to);
        if (!a || !b) return null;
        return (
          <ConnectionParticles
            key={`${from}-${to}`}
            from={a}
            to={b}
            color={VARIANT_COLOR[to] ?? "#556c78"}
          />
        );
      })}

      {Array.from(nodePositions3D.entries()).map(([id, pos]) => (
        <NodeSphere
          key={id}
          id={id}
          position={pos}
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
      camera={{ position: [0, 0.5, 14], fov: 38, near: 0.1, far: 80 }}
      style={{ position: "absolute", inset: 0, zIndex: 3 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
