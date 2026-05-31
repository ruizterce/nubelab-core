"use client";

import { useMemo, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { NODE_BASE, FLOW_COLOR, CONNECTIONS } from "./data";
import { ConnectionParticles } from "./connections";
import { OrbitalNode } from "./OrbitalNode";
import { NodeMesh } from "./NodeMesh";

type SceneProps = {
  activeNodeId: string;
  hoveredNodeId: string | null;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
  disabledNodes: string[];
};

function Scene({ activeNodeId, hoveredNodeId, onSelectNode, onHoverNode }: SceneProps) {
  const [worldRefs] = useState(() => {
    const m = new Map<string, THREE.Vector3>();
    for (const [id, pos] of Object.entries(NODE_BASE)) {
      m.set(id, new THREE.Vector3(pos[0], pos[1], pos[2]));
    }
    return m;
  });

  const bases = useMemo(() => {
    const m = new Map<string, THREE.Vector3>();
    for (const [id, pos] of Object.entries(NODE_BASE)) m.set(id, new THREE.Vector3(pos[0], pos[1], pos[2]));
    return m;
  }, []);

  const clickHandlers = useMemo(() => {
    const h: Record<string, {
      onClick: (e: ThreeEvent<MouseEvent>) => void;
      onPointerOver: () => void;
      onPointerOut: () => void;
    }> = {};
    for (const id of Object.keys(NODE_BASE)) {
      h[id] = {
        onClick: () => onSelectNode(id),
        onPointerOver: () => onHoverNode(id),
        onPointerOut: () => onHoverNode(null),
      };
    }
    return h;
  }, [onSelectNode, onHoverNode]);

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={2.5} />

      {CONNECTIONS.map(({ from, to }) => (
        <ConnectionParticles key={`${from}-${to}`}
          fromId={from} toId={to} worldRefs={worldRefs}
          color={FLOW_COLOR[to] ?? "#9bb8cc"} />
      ))}

      {Array.from(bases.entries()).map(([id, pos]) => (
        <OrbitalNode key={id} id={id} basePos={pos} worldRefs={worldRefs} paused={hoveredNodeId !== null}>
          <NodeMesh id={id} isHovered={id === hoveredNodeId} {...clickHandlers[id]} />
        </OrbitalNode>
      ))}
    </>
  );
}

export function AtlasScene(props: SceneProps) {
  return (
    <Canvas
      flat
      gl={{ alpha: true, antialias: true, premultipliedAlpha: true, toneMapping: THREE.NoToneMapping }}
      camera={{ position: [0, 8, 11], fov: 42, near: 0.1, far: 80 }}
      style={{ position: "absolute", inset: 0, zIndex: 3 }}
      dpr={[1, 1.5]} performance={{ min: 0.5 }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
