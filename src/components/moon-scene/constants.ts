import * as THREE from "three";

/* ── model ───────────────────────────────────────── */

export const MODEL_PATH = "/3d-models/moon-base.glb";

/* ── interaction ─────────────────────────────────── */

export const HOVER_EMISSIVE = "#4488cc";

/* ── camera ──────────────────────────────────────── */

/** FOV limits (degrees) – prevents fisheye distortion or tunnel vision */
export const MIN_FOV = 18;
export const MAX_FOV = 35;

/** Maximum width/height ratio for the canvas container */
export const ASPECT_LIMIT = 3.0;

/* ── building labels ─────────────────────────────── */

/** Per-building label offsets in world units [x, y, z] */
export const LABEL_OFFSETS: Record<string, [number, number, number]> = {
  Core: [2.5, 0, 0],
  Author: [2, 0, 0],
  Monitor: [3, 0.2, 0],
};

/* ── scene lights ────────────────────────────────── */

export const GLOW_TEXTURE_SIZE = 256;

export const GLOW_COLOR_STOPS: [number, string][] = [
  [0, "rgba(255, 255, 220, 1)"],
  [0.015, "rgba(255, 180, 120, 1)"],
  [0.06, "rgba(255, 40, 15, 0.9)"],
  [0.18, "rgba(220, 15, 5, 0.5)"],
  [0.4, "rgba(180, 5, 0, 0.12)"],
  [0.7, "rgba(80, 0, 0, 0.02)"],
  [1, "rgba(0, 0, 0, 0)"],
];

export const LIGHT_COLOR = "#ff3322";

/** Blinking beacon configuration */
export const BEACON = {
  period: 2.0, // seconds between flashes
  decay: 25, // exponential decay rate
  peak: 10, // peak intensity during flash
  distance: 8,
  decayExponent: 2,
  spriteScale: [1.5, 1.5, 1] as [number, number, number],
  /** opacity = (intensity / peak) ^ opacityPower */
  opacityPower: 0.6,
} as const;

/** Platform light (flickering) configuration */
export const PLATFORM_LIGHT = {
  baseIntensity: 1.8,
  intensityDivisor: 4,
  distance: 5,
  decayExponent: 2,
  spriteScale: [0.7, 0.7, 1] as [number, number, number],
  /** opacity = clamp(normalized * maxOpacity, minOpacity, maxOpacity) */
  minOpacity: 0.1,
  maxOpacity: 0.7,
  /** Multi-frequency sine flicker: [frequency, amplitude] */
  flickerComponents: [
    [11.7, 0.25],
    [31.3, 0.15],
    [53.9, 0.1],
  ] as [number, number][],
} as const;

/* ── day / night cycle ───────────────────────────── */

export const SUN = {
  orbitRadius: 25,
  tilt: Math.PI / 2.8,
  inclination: Math.PI / 2,
  yOffset: 0,
  xOffset: 0,
  cycleSeconds: 45,
  maxIntensity: 5,
  color: "#ffe0c0",
} as const;

export const MOON = {
  orbitRadius: 24,
  tilt: Math.PI / 1.3,
  inclination: Math.PI / 3,
  yOffset: 0,
  xOffset: 0,
  cycleSeconds: 16,
  maxIntensity: 2,
  color: "#6688cc",
} as const;

/* ── shadow maps ─────────────────────────────────── */

export const SUN_SHADOW = {
  mapSize: 4096,
  near: 1,
  far: 60,
  left: -20,
  right: 20,
  top: 20,
  bottom: -20,
  bias: -0.0005,
  radius: 3,
} as const;

export const MOON_SHADOW = {
  mapSize: 2048,
  near: 1,
  far: 60,
  left: -20,
  right: 20,
  top: 20,
  bottom: -20,
  bias: -0.0001,
  radius: 50,
} as const;

/* ── post-processing ─────────────────────────────── */

export const POST_PROCESSING = {
  chromaticAberration: [0.0007, 0.0003] as [number, number],
  noiseOpacity: 0.03,
  pixelationGranularity: 0.5,
  bloom: {
    luminanceThreshold: 0.7,
    luminanceSmoothing: 0.02,
    intensity: 1.3,
    radius: 0.65,
  },
  toneMapping: {
    mode: "ACES_FILMIC" as const,
    whitePoint: 4.0,
    middleGrey: 0.6,
  },
  vignette: {
    offset: 0.35,
    darkness: 0.6,
  },
} as const;

/* ── environment ─────────────────────────────────── */

export const ENVIRONMENT = {
  preset: "city" as const,
  intensity: 0.25,
};

/* ── renderer ────────────────────────────────────── */

export const DPR: [number, number] = [1, 1.5];

export const SHADOW_MAP_TYPE = THREE.PCFShadowMap;
