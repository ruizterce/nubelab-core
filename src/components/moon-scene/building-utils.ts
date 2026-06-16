import * as THREE from "three";
import { NON_INTERACTIVE_ROOTS } from "./constants";

/** Check if an object is a building root (interactive, non-terrain/props/lights) */
export function isBuildingRoot(obj: THREE.Object3D): boolean {
  return (
    obj.name.endsWith("_ROOT") && !NON_INTERACTIVE_ROOTS.has(obj.name)
  );
}

/** Traverse a model and collect all building root groups */
export function findBuildingRoots(model: THREE.Object3D): THREE.Object3D[] {
  const roots: THREE.Object3D[] = [];
  model.traverse((child) => {
    if (isBuildingRoot(child)) roots.push(child);
  });
  return roots;
}

/** Compute bounding boxes for all buildings in a model */
export function buildBuildingBounds(model: THREE.Object3D): Map<string, THREE.Box3> {
  const bounds = new Map<string, THREE.Box3>();
  model.traverse((child) => {
    if (isBuildingRoot(child)) {
      bounds.set(child.name, new THREE.Box3().setFromObject(child));
    }
  });
  return bounds;
}
