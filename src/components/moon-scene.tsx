"use client";

import { useMemo, useLayoutEffect, useRef, useCallback } from "react";
import {
  Canvas,
  useThree,
  useFrame,
  type ThreeEvent,
} from "@react-three/fiber";
import { useGLTF, Environment, Html } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
  SMAA,
  ChromaticAberration,
  Noise,
  Pixelation,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import {
  createTerrainUniforms,
  patchTerrainMaterial,
  type TerrainUniforms,
} from "./terrain-shader";

const MODEL_PATH = "/3d-models/moon-base.glb";
useGLTF.preload(MODEL_PATH);

const HOVER_EMISSIVE = "#4488cc";

/* ── helpers ──────────────────────────────────────── */

function findBuilding(obj: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (current.name === "Terrain_ROOT" || current.name === "Props_ROOT")
      return null;
    if (current.name.endsWith("_ROOT")) return current.name;
    current = current.parent;
  }
  return null;
}

/* ── building labels ──────────────────────────────── */

/** Per-building label offsets in world units [x, y, z]. Defaults to [0, 0, 0]. */
const LABEL_OFFSETS: Record<string, [number, number, number]> = {
  Core: [2.5, 0, 0],
  Author: [2, 0, 0],
  Monitor: [3, 0.2, 0],
};

function BuildingLabels({ model }: { model: THREE.Group }) {
  const buildings = useMemo(() => {
    const result: {
      name: string;
      position: [number, number, number];
    }[] = [];
    model.traverse((child) => {
      if (
        child.name.endsWith("_ROOT") &&
        child.name !== "Terrain_ROOT" &&
        child.name !== "Props_ROOT"
      ) {
        const center = new THREE.Vector3();
        const box = new THREE.Box3().setFromObject(child);
        child.getWorldPosition(center);
        result.push({
          name: child.name.replace("_ROOT", ""),
          position: [center.x, center.y, center.z],
        });
      }
    });
    return result;
  }, [model]);

  return (
    <>
      {buildings.map((b) => {
        const offset = LABEL_OFFSETS[b.name] ?? [0, 0, 0];
        return (
          <Html
            key={b.name}
            position={[
              b.position[0] + offset[0],
              b.position[1] + offset[1],
              b.position[2] + offset[2],
            ]}
            center
            sprite
            distanceFactor={8}
            occlude={false}
            style={{ pointerEvents: "none" }}
          >
            <span className="building-label">{b.name}</span>
          </Html>
        );
      })}
    </>
  );
}

/* ── camera from GLB ──────────────────────────────── */

/** FOV limits (degrees) – prevents fisheye distortion or tunnel vision */
const MIN_FOV = 18;
const MAX_FOV = 35;

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

  const ORBIT_RADIUS = 25;
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
        shadow-camera-far={60}
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
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
        shadow-radius={30}
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
  terrainHue = -0.45,
  terrainSaturation = 0.7,
  buildingsHue = -0.04,
  buildingsSaturation = 0.8,
}: {
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  terrainHue?: number;
  terrainSaturation?: number;
  buildingsHue?: number;
  buildingsSaturation?: number;
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);
  const originals = useRef<Map<string, THREE.Material>>(new Map());
  const prevHovered = useRef<string | null>(null);

  // shared uniforms for terrain materials
  const terrainUniformsRef = useRef<TerrainUniforms>(createTerrainUniforms());

  // shared uniforms for building / non-terrain materials
  const buildingsUniformsRef = useRef<TerrainUniforms>(createTerrainUniforms());

  // keep uniforms in sync with props
  useLayoutEffect(() => {
    terrainUniformsRef.current.uTerrainHue.value = terrainHue;
    terrainUniformsRef.current.uTerrainSaturation.value = terrainSaturation;
  }, [terrainHue, terrainSaturation]);

  useLayoutEffect(() => {
    buildingsUniformsRef.current.uTerrainHue.value = buildingsHue;
    buildingsUniformsRef.current.uTerrainSaturation.value = buildingsSaturation;
  }, [buildingsHue, buildingsSaturation]);

  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  // material patching (needs refs, so must run in an effect — not during render)
  // terrain gets one set of uniforms, everything else gets another
  useLayoutEffect(() => {
    const root = modelRef.current;
    if (!root) return;
    const terrain = root.getObjectByName("Terrain_ROOT");

    // collect terrain materials so we can skip them in the buildings pass
    const terrainMats = new Set<THREE.Material>();
    if (terrain) {
      terrain.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.raycast = () => {};
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const mat of materials) {
            if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              terrainMats.add(mat);
              patchTerrainMaterial(
                mat as THREE.MeshStandardMaterial,
                terrainUniformsRef.current,
              );
            }
          }
        }
      });
    }

    // patch everything else (buildings, props) with buildings uniforms
    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const mat of materials) {
          if (
            (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial &&
            !terrainMats.has(mat)
          ) {
            patchTerrainMaterial(
              mat as THREE.MeshStandardMaterial,
              buildingsUniformsRef.current,
            );
          }
        }
      }
    });
  }, [model]);

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
    <group>
      <BuildingLabels model={model} />
      <primitive
        ref={modelRef}
        object={model}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          const building = findBuilding(e.object as THREE.Object3D);
          if (building) onSelect(building);
        }}
        onPointerOver={(e: ThreeEvent<MouseEvent>) => {
          const building = findBuilding(e.object as THREE.Object3D);
          if (building) {
            document.body.style.cursor = "pointer";
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
    </group>
  );
}

/* ── canvas ───────────────────────────────────────── */

export function MoonScene({
  onSelect,
  onHover,
  terrainHue,
  terrainSaturation,
  buildingsHue,
  buildingsSaturation,
}: {
  activeId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  terrainHue?: number;
  terrainSaturation?: number;
  buildingsHue?: number;
  buildingsSaturation?: number;
}) {
  const ASPECT_LIMIT = 3.0; // max width/height ratio (allows up to 3:1 landscape / 1:3 portrait)

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxWidth: `min(100vw, calc(100dvh * ${ASPECT_LIMIT}))`,
        maxHeight: `min(100dvh, calc(100vw * ${ASPECT_LIMIT}))`,
        position: "relative",
      }}
    >
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
          preset="city"
          background={false}
          environmentIntensity={0.35}
        />
        <EffectComposer multisampling={0}>
          <ChromaticAberration offset={[0.0007, 0.0003]} />
          <Noise opacity={0.03} />
          <Pixelation granularity={0.5} />
          <Bloom
            luminanceThreshold={0.7}
            luminanceSmoothing={0.02}
            intensity={1.3}
            mipmapBlur
            radius={0.65}
          />
          <ToneMapping
            mode={ToneMappingMode.ACES_FILMIC}
            whitePoint={4.0}
            middleGrey={0.6}
          />
          <Vignette offset={0.35} darkness={0.6} />
          <SMAA />
        </EffectComposer>
        <MoonBase
          onSelect={onSelect}
          onHover={onHover}
          terrainHue={terrainHue}
          terrainSaturation={terrainSaturation}
          buildingsHue={buildingsHue}
          buildingsSaturation={buildingsSaturation}
        />
      </Canvas>
    </div>
  );
}
