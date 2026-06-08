import { useMemo, useLayoutEffect, useRef, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  createTerrainUniforms,
  patchTerrainMaterial,
  type TerrainUniforms,
} from "../terrain-shader";
import { MODEL_PATH, HOVER_EMISSIVE } from "./constants";
import { findBuilding } from "./helpers";
import { BuildingLabels } from "./building-labels";
import { SceneLights } from "./scene-lights";

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
      <SceneLights model={model} />
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

export { MoonBase };
