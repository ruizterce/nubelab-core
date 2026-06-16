import { useMemo, useLayoutEffect, useRef, useCallback } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  createTerrainUniforms,
  patchTerrainMaterial,
  type TerrainUniforms,
} from "../terrain-shader";
import { MODEL_PATH, HOVER_EMISSIVE } from "./constants";
import { resolveBuilding } from "./helpers";
import { BuildingLabels } from "./building-labels";
import { SceneLights } from "./scene-lights";
import { CameraOrbit } from "./camera-orbit";
import { HitPlane } from "./hit-plane";

function MoonBase({
  onSelect,
  onHover,
  cameraTarget,
  terrainHue = -0.45,
  terrainSaturation = 0.7,
  buildingsHue = -0.04,
  buildingsSaturation = 0.8,
}: {
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  cameraTarget?: string | null;
  terrainHue?: number;
  terrainSaturation?: number;
  buildingsHue?: number;
  buildingsSaturation?: number;
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);
  const originals = useRef<Map<string, THREE.Material>>(new Map());
  const prevHovered = useRef<string | null>(null);
  const origPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const hoverBuilding = useRef<THREE.Object3D | null>(null);
  const hoverActive = useRef(false);

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

  // tight bounding boxes per building — validated on pointer events
  const buildingBounds = useRef<Map<string, THREE.Box3>>(new Map());

  const model = useMemo(() => {
    const c = scene.clone(true);

    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.geometry) {
          mesh.geometry.computeBoundingSphere();
          mesh.geometry.computeBoundingBox();
        }
        if (!mesh.visible) {
          mesh.raycast = () => {};
        }
      }
    });

    return c;
  }, [scene]);

  useLayoutEffect(() => {
    const bounds = new Map<string, THREE.Box3>();
    model.traverse((child) => {
      if (
        child.name.endsWith("_ROOT") &&
        child.name !== "Terrain_ROOT" &&
        child.name !== "Props_ROOT" &&
        child.name !== "Lights_ROOT"
      ) {
        bounds.set(child.name, new THREE.Box3().setFromObject(child));
      }
    });
    buildingBounds.current = bounds;
  }, [model]);

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

  useFrame((_, delta) => {
    if (!modelRef.current) return;

    // save original positions on first frame
    if (origPositions.current.size === 0) {
      modelRef.current.traverse((child) => {
        if (child.name.endsWith("_ROOT") && !["Terrain_ROOT", "Props_ROOT", "Lights_ROOT"].includes(child.name)) {
          origPositions.current.set(child.name, child.position.clone());
        }
      });
    }

    // lerp hovered building
    if (hoverBuilding.current) {
      const name = hoverBuilding.current.name;
      const orig = origPositions.current.get(name);
      if (orig) {
        const goal = hoverActive.current ? orig.z + 0.05 : orig.z;
        const t = 1 - Math.exp(-6 * delta);
        hoverBuilding.current.position.z += (goal - hoverBuilding.current.position.z) * t;
      }
    }
  });

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
      hoverActive.current = false;
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
        hoverBuilding.current = building;
        hoverActive.current = true;
        prevHovered.current = buildingName;
      }
    }
  }, []);

  return (
    <group>
      <CameraOrbit target={cameraTarget ?? null} model={model} />
      <BuildingLabels model={model} />
      <SceneLights model={model} />
      <HitPlane model={model} onSelect={onSelect} />
      <primitive
        ref={modelRef}
        object={model}
        onPointerOver={(e: ThreeEvent<MouseEvent>) => {
          const building = resolveBuilding(e.object as THREE.Object3D, e.point, buildingBounds.current);
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

export { MoonBase };
