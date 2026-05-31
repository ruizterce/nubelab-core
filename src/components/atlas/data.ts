import * as THREE from "three";

export const ORBIT_RADIUS = 2.33;
export const CORE_Z = 2.5;

export const NODE_BASE: Record<string, [number, number, number]> = {
  core: [0, 3, CORE_Z],
  infra: [0, 3, CORE_Z - ORBIT_RADIUS],
  author: [-ORBIT_RADIUS, 3, CORE_Z],
  lab: [ORBIT_RADIUS, 3, CORE_Z],
  ops: [0, 3, CORE_Z + ORBIT_RADIUS],
};

export const CORE_POS = new THREE.Vector3(0, 3, CORE_Z);
export const ORBIT_SPEED = 0.055;

export const FLOW_COLOR: Record<string, string> = {
  core: "#1ea1dd",
  author: "#1ea1dd",
  lab: "#1ea1dd",
  infra: "#1ea1dd",
  ops: "#1ea1dd",
};

export const CONNECTIONS = [
  { from: "core", to: "infra" },
  { from: "core", to: "lab" },
  { from: "core", to: "ops" },
  { from: "infra", to: "core" },
  { from: "infra", to: "lab" },
  { from: "author", to: "core" },
  { from: "author", to: "infra" },
  { from: "author", to: "ops" },
];

export const PARTICLE_COUNT = 1.7;
