import * as THREE from "three";

export function midPoint(a: THREE.Vector3, b: THREE.Vector3, lift: number) {
  const m = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  m.y += lift;
  return m;
}

export function createGradientMap(colors: string[]): THREE.CanvasTexture {
  const width = colors.length * 64;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 4;
  const ctx = canvas.getContext("2d")!;
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * 64, 0, 64, 4);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createGlowTexture(color: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const stops = [
    { r: 0.0, a: 1.0 },
    { r: 0.03, a: 0.95 },
    { r: 0.08, a: 0.75 },
    { r: 0.18, a: 0.4 },
    { r: 0.35, a: 0.12 },
    { r: 0.55, a: 0.03 },
    { r: 0.78, a: 0.005 },
    { r: 1.0, a: 0.0 },
  ];
  for (let i = stops.length - 1; i >= 0; i--) {
    const r = stops[i].r * half;
    ctx.beginPath();
    ctx.arc(half, half, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = stops[i].a;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const TOON_COLORS = ["#0a1f2e", "#1a4a66", "#0285c7", "#81c8f0", "#d8f0ff"];
