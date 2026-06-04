"use client";

import { useMemo, useLayoutEffect, useRef, useCallback } from "react";
import {
  Canvas,
  useThree,
  useFrame,
  type ThreeEvent,
} from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";

const MODEL_PATH = "/3d-models/moon-base.glb";
useGLTF.preload(MODEL_PATH);


const BUILDINGS = ["Core_ROOT", "Author_ROOT", "Monitor_ROOT"] as const;
const HOVER_EMISSIVE = "#4488cc";

/* ── helpers ──────────────────────────────────────── */

function findBuilding(obj: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (current.name === "Terrain_ROOT") return null;
    if (current.name.endsWith("_ROOT")) return current.name;
    current = current.parent;
  }
  return null;
}

/* ── camera from GLB ──────────────────────────────── */

/** FOV limits (degrees) – prevents fisheye distortion or tunnel vision */
const MIN_FOV = 5;
const MAX_FOV = 80;

function SceneCamera() {
  const { scene } = useGLTF(MODEL_PATH);
  const { set, size } = useThree();
  const design = useRef<{ fov: number; aspect: number } | null>(null);

  useLayoutEffect(() => {
    const cam = scene.getObjectByName("Camera-1") as
      | THREE.PerspectiveCamera
      | undefined;
    if (!cam?.isCamera) return;

    // capture the original Blender framing on first run
    if (!design.current) {
      design.current = { fov: cam.fov, aspect: cam.aspect };
    }

    const { fov: designFov, aspect: designAspect } = design.current;
    const currentAspect = size.width / size.height;

    // compute the horizontal FOV that looked good in Blender…
    const targetHFov =
      2 *
      Math.atan(
        Math.tan(THREE.MathUtils.degToRad(designFov) / 2) * designAspect,
      );

    // …and derive the vertical FOV needed to keep it at the current aspect
    let newVFov = 2 * Math.atan(Math.tan(targetHFov / 2) / currentAspect);

    // clamp so things don't go crazy on extreme viewports
    newVFov = THREE.MathUtils.clamp(
      newVFov,
      THREE.MathUtils.degToRad(MIN_FOV),
      THREE.MathUtils.degToRad(MAX_FOV),
    );

    cam.fov = THREE.MathUtils.radToDeg(newVFov);
    cam.aspect = currentAspect;
    cam.updateProjectionMatrix();
    set({ camera: cam });
  }, [scene, set, size]);

  return null;
}

/* ── day / night cycle ───────────────────────────── */

function DayNightCycle() {
  const sunRef = useRef<THREE.DirectionalLight>(null!);
  const moonRef = useRef<THREE.DirectionalLight>(null!);
  const sunDotRef = useRef<THREE.Mesh>(null!);
  const moonDotRef = useRef<THREE.Mesh>(null!);

  const ORBIT_RADIUS = 15;
  const TILT = Math.PI / 2;
  const INCLINATION = Math.PI / 2;
  const Y_OFFSET = 0;
  const X_OFFSET = 0;
  const CYCLE = 10;
  const SUN_MAX = 6;
  const MOON_MAX = 3;

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() % CYCLE) / CYCLE;
    const angle = t * Math.PI * 2;

    // sun: Z is up, XY is ground
    const v = Math.sin(angle) * ORBIT_RADIUS;
    const h = Math.cos(angle) * ORBIT_RADIUS;
    const sx = Math.cos(TILT) * h + X_OFFSET;
    const sy = Math.sin(TILT) * h + Y_OFFSET;
    const sz = v * Math.sin(INCLINATION);
    sunRef.current.position.set(sx, sy, sz);
    sunRef.current.target.position.set(-sx, -sy, -sz);

    // moon (opposite)
    const ma = angle + Math.PI;
    const mv = Math.sin(ma) * ORBIT_RADIUS;
    const mh = Math.cos(ma) * ORBIT_RADIUS;
    const mx = Math.cos(TILT) * mh + X_OFFSET;
    const my = Math.sin(TILT) * mh + Y_OFFSET;
    const mz = mv * Math.sin(INCLINATION);
    moonRef.current.position.set(mx, my, mz);
    moonRef.current.target.position.set(-mx, -my, -mz);

    // debug dots
    sunDotRef.current.position.copy(sunRef.current.position);
    moonDotRef.current.position.copy(moonRef.current.position);

    // intensity
    sunRef.current.intensity =
      THREE.MathUtils.smoothstep(Math.sin(angle), -0.1, 0.3) * SUN_MAX;
    moonRef.current.intensity =
      THREE.MathUtils.smoothstep(Math.sin(ma), -0.1, 0.3) * MOON_MAX;
  });

  return (
    <>
      <directionalLight
        ref={sunRef}
        color="#ffe0c0"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
        shadow-radius={3}
      />
      <directionalLight
        ref={moonRef}
        color="#6688cc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0001}
        shadow-radius={40}
      />
      <mesh ref={sunDotRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
      <mesh ref={moonDotRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color="#6688cc" />
      </mesh>
    </>
  );
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

  const model = useMemo(() => {
    const c = scene.clone(true);
    const terrain = c.getObjectByName("Terrain_ROOT");
    if (terrain) {
      terrain.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.raycast = () => {};
          mesh.receiveShadow = true;
        }
      });
    }
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

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
            const mat = mesh.material as THREE.Material | THREE.Material[];
            const singleMat = Array.isArray(mat) ? mat[0] : mat;
            if (singleMat && "emissive" in singleMat) {
              const key = `${buildingName}/${mesh.uuid}`;
              if (!originals.current.has(key)) {
                originals.current.set(key, singleMat);
              }
              const cloned = (
                singleMat as unknown as THREE.MeshStandardMaterial
              ).clone();
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
      shadows
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.5]}
    >
      <SceneCamera />
      <ambientLight intensity={0.05} />
      <DayNightCycle />
      <Environment
        preset="night"
        background={false}
        environmentIntensity={1.5}
      />
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.7}
          luminanceSmoothing={0.02}
          intensity={1.6}
          mipmapBlur
          radius={0.65}
        />
        <ToneMapping
          mode={ToneMappingMode.ACES_FILMIC}
          whitePoint={4.0}
          middleGrey={0.6}
        />
        <Vignette offset={0.35} darkness={0.6} />
      </EffectComposer>
      <MoonBase onSelect={onSelect} onHover={onHover} />
    </Canvas>
  );
}
