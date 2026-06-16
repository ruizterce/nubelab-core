import * as THREE from "three";

/* ── model ───────────────────────────────────────── */

export const MODEL_PATH = "/3d-models/moon-base.glb";

/* ── interaction ─────────────────────────────────── */

export const HOVER_EMISSIVE = "#dbb474";
export const HOVER_EMISSIVE_INTENSITY = 0.6;
export const HOVER_LIFT = 0.05;
export const HOVER_LERP_SPEED = 6;

/** Non-interactive building groups excluded from selection and hit-testing */
export const NON_INTERACTIVE_ROOTS = new Set([
  "Terrain_ROOT",
  "Props_ROOT",
  "Lights_ROOT",
]);

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
  Founder: [2, 0, 0],
  Monitor: [3, 0.2, 0],
};

/* ── scene lights ────────────────────────────────── */

export const GLOW_TEXTURE_SIZE = 256;

/** Parse a hex color (e.g. "#ff3322") into [r, g, b] in 0-255 range */
function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
}

/**
 * Build radial glow color stops derived from a single base color.
 * Center is white-hot, transitioning through the base hue at decreasing
 * lightness / opacity until fully transparent at the edge.
 */
export function buildGlowColorStops(hex: string): [number, string][] {
  const [r, g, b] = hexToRgb(hex);
  return [
    [0, `rgba(${r}, ${g}, ${b}, 1)`],
    [0.015, `rgba(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)}, 1)`],
    [0.06, `rgba(${r}, ${g}, ${b}, 0.9)`],
    [0.18, `rgba(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)}, 0.5)`],
    [0.4, `rgba(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)}, 0.12)`],
    [0.7, `rgba(${Math.floor(r * 0.15)}, ${Math.floor(g * 0.15)}, ${Math.floor(b * 0.15)}, 0.02)`],
    [1, "rgba(0, 0, 0, 0)"],
  ];
}

export const LIGHT_COLOR = "#ff3322";

/** Blinking beacon configuration */
export const BEACON = {
  period: 2.5, // seconds between flashes
  decay: 30, // exponential decay rate
  peak: 40, // peak intensity during flash
  distance: 8,
  decayExponent: 2,
  spriteScale: [2.5, 2.5, 1] as [number, number, number],
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
  maxIntensity: 1,
  color: "#849dce",
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
    luminanceThreshold: 0.55,
    luminanceSmoothing: 0.02,
    intensity: 1.3,
    radius: 0.66,
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
