import * as THREE from "three";
import { NON_INTERACTIVE_ROOTS } from "./constants";

/** Small margin added to building AABBs so borderline hits aren't rejected */
const BOUNDS_MARGIN = 0.5;

/**
 * Walk up the object hierarchy to find the root building group.
 * Returns the `*_ROOT` group name, or null if the object belongs to
 * a non-interactive group (Terrain, Props, Lights).
 */
export function findBuilding(obj: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (NON_INTERACTIVE_ROOTS.has(current.name)) return null;
    if (current.name.endsWith("_ROOT")) return current.name;
    current = current.parent;
  }
  return null;
}

/**
 * Resolve which building was hit, verifying the intersection point
 * lies within the building's pre-computed bounding box (+ margin).
 * Returns the building name or null if the hit is too far from the
 * building's geometry bounds.
 */
export function resolveBuilding(
  obj: THREE.Object3D,
  point: THREE.Vector3,
  bounds: Map<string, THREE.Box3>,
): string | null {
  const building = findBuilding(obj);
  if (!building) return null;

  const box = bounds.get(building);
  if (!box) return building;

  const expanded = box.clone().expandByScalar(BOUNDS_MARGIN);
  return expanded.containsPoint(point) ? building : null;
}
