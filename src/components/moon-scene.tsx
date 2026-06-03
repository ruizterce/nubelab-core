"use client";

import { useMemo, useLayoutEffect, useRef, useCallback } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/3d-models/moon-base.glb";
useGLTF.preload(MODEL_PATH);

const BUILDINGS = ["Core_ROOT", "Author_ROOT", "Monitor_ROOT"] as const;
const HOVER_EMISSIVE = "#4488cc";

/* ── helpers ──────────────────────────────────────── */

function findBuilding(obj: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (current.name.endsWith("_ROOT")) return current.name;
    current = current.parent;
  }
  return null;
}

/* ── camera from GLB ──────────────────────────────── */

function SceneCamera() {
  const { scene } = useGLTF(MODEL_PATH);
  const { set, size } = useThree();

  useLayoutEffect(() => {
    const cam = scene.getObjectByName("Camera-1") as THREE.PerspectiveCamera | undefined;
    if (cam && cam.isCamera) {
      cam.aspect = size.width / size.height;
      cam.updateProjectionMatrix();
      set({ camera: cam });
    }
  }, [scene, set, size]);

  return null;
}

/* ── model ────────────────────────────────────────── */

function MoonBase({
  onSelect,
  onHover,
}: {
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);
  const originals = useRef<Map<string, THREE.Material>>(new Map());
  const prevHovered = useRef<string | null>(null);

  const model = useMemo(() => scene.clone(true), [scene]);

  const applyHover = useCallback((buildingName: string | null) => {
    const root = modelRef.current;
    if (!root) return;

    // restore previous
    if (prevHovered.current) {
      const prev = root.getObjectByName(prevHovered.current);
      if (prev) {
        prev.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const key = `${prevHovered.current}/${child.uuid}`;
            const orig = originals.current.get(key);
            if (orig) (child as THREE.Mesh).material = orig;
          }
        });
      }
      prevHovered.current = null;
    }

    // apply new — clone material per mesh so shared materials don't bleed
    if (buildingName) {
      const building = root.getObjectByName(buildingName);
      if (building) {
        building.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material;
            if (mat && "emissive" in mat) {
              const key = `${buildingName}/${mesh.uuid}`;
              if (!originals.current.has(key)) {
                originals.current.set(key, mat);
              }
              const cloned = (mat as THREE.MeshStandardMaterial).clone();
              cloned.emissive = new THREE.Color(HOVER_EMISSIVE);
              cloned.emissiveIntensity = 0.6;
              mesh.material = cloned;
            }
          }
        });
        prevHovered.current = buildingName;
      }
    }
  }, []);

  return (
    <primitive
      ref={modelRef}
      object={model}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        const building = findBuilding(e.object as THREE.Object3D);
        if (building) onSelect(building);
      }}
      onPointerOver={(e: ThreeEvent<MouseEvent>) => {
        document.body.style.cursor = "pointer";
        const building = findBuilding(e.object as THREE.Object3D);
        if (building) {
          applyHover(building);
          onHover(building);
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
        applyHover(null);
        onHover(null);
      }}
    />
  );
}

/* ── canvas ───────────────────────────────────────── */

export function MoonScene({
  activeId,
  hoveredId,
  onSelect,
  onHover,
}: {
  activeId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.5]}
    >
      <SceneCamera />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#8899cc" />
      <MoonBase onSelect={onSelect} onHover={onHover} />
    </Canvas>
  );
}
