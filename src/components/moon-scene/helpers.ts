import * as THREE from "three";

/**
 * Walk up the object hierarchy to find the root building group.
 * Returns the `*_ROOT` group name, or null if the object belongs to
 * Terrain_ROOT, Props_ROOT, or Lights_ROOT (non-interactive).
 */
export function findBuilding(obj: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (
      current.name === "Terrain_ROOT" ||
      current.name === "Props_ROOT" ||
      current.name === "Lights_ROOT"
    ) {
      return null;
    }
    if (current.name.endsWith("_ROOT")) return current.name;
    current = current.parent;
  }
  return null;
}
