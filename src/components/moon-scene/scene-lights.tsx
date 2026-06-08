import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  GLOW_TEXTURE_SIZE,
  GLOW_COLOR_STOPS,
  LIGHT_COLOR,
  BEACON,
  PLATFORM_LIGHT,
} from "./constants";

/* ── shared glow texture (singleton) ─────────────── */

let _glowTex: THREE.Texture | null = null;

function getGlowTexture(): THREE.Texture {
  if (!_glowTex) {
    const size = GLOW_TEXTURE_SIZE;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const h = size / 2;
    const g = ctx.createRadialGradient(h, h, 0, h, h, h);
    for (const [stop, color] of GLOW_COLOR_STOPS) {
      g.addColorStop(stop, color);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    _glowTex = tex;
  }
  return _glowTex;
}

/* ── container: finds lights in the GLB ──────────── */

function SceneLights({ model }: { model: THREE.Group }) {
  const lights = useMemo(() => {
    const lightsGroup = model.getObjectByName("Lights_ROOT");
    if (!lightsGroup) return { blinking: null, platforms: [] as THREE.Vector3[] };

    const platforms: THREE.Vector3[] = [];
    let blinking: THREE.Vector3 | null = null;

    lightsGroup.traverse((child) => {
      if (child.name.startsWith("BlinkingLight")) {
        blinking = new THREE.Vector3();
        child.getWorldPosition(blinking);
      } else if (child.name.startsWith("PlatformLight")) {
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        platforms.push(pos);
      }
    });

    return { blinking, platforms };
  }, [model]);

  if (!lights.blinking && !lights.platforms.length) return null;

  return (
    <>
      {lights.blinking && <BlinkingPointLight position={lights.blinking} />}
      {lights.platforms.map((pos, i) => (
        <PlatformPointLight key={i} position={pos} phase={i * 1.7} />
      ))}
    </>
  );
}

/* ── beacon: exponential-decay flash every N seconds ─ */

function BlinkingPointLight({ position }: { position: THREE.Vector3 }) {
  const lightRef = useRef<THREE.PointLight>(null!);
  const spriteMatRef = useRef<THREE.SpriteMaterial>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const phase = (t % BEACON.period) / BEACON.period;
    const intensity =
      BEACON.peak * Math.exp(-phase * BEACON.period * BEACON.decay);
    lightRef.current.intensity = intensity;

    // sprite opacity follows intensity smoothly — no boolean toggle
    spriteMatRef.current.opacity = Math.pow(
      intensity / BEACON.peak,
      BEACON.opacityPower,
    );
  });

  return (
    <group position={position}>
      <pointLight
        ref={lightRef}
        color={LIGHT_COLOR}
        intensity={0}
        distance={BEACON.distance}
        decay={BEACON.decayExponent}
        castShadow={false}
      />
      <sprite scale={BEACON.spriteScale}>
        <spriteMaterial
          ref={spriteMatRef}
          map={getGlowTexture()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/* ── platform light: multi-frequency sine flicker ─── */

function PlatformPointLight({
  position,
  phase,
}: {
  position: THREE.Vector3;
  phase: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null!);
  const spriteMatRef = useRef<THREE.SpriteMaterial>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;

    // sum multi-frequency sine components for organic flicker
    let flicker = 0;
    for (const [freq, amp] of PLATFORM_LIGHT.flickerComponents) {
      flicker += Math.sin(t * freq) * amp;
    }

    const intensity = Math.max(
      0,
      PLATFORM_LIGHT.baseIntensity + flicker,
    );
    lightRef.current.intensity = intensity / PLATFORM_LIGHT.intensityDivisor;

    // sprite opacity follows intensity proportionally
    const norm = intensity / PLATFORM_LIGHT.baseIntensity;
    spriteMatRef.current.opacity = THREE.MathUtils.clamp(
      norm * PLATFORM_LIGHT.maxOpacity,
      PLATFORM_LIGHT.minOpacity,
      PLATFORM_LIGHT.maxOpacity,
    );
  });

  return (
    <group position={position}>
      <pointLight
        ref={lightRef}
        color={LIGHT_COLOR}
        intensity={PLATFORM_LIGHT.baseIntensity}
        distance={PLATFORM_LIGHT.distance}
        decay={PLATFORM_LIGHT.decayExponent}
        castShadow={false}
      />
      <sprite scale={PLATFORM_LIGHT.spriteScale}>
        <spriteMaterial
          ref={spriteMatRef}
          map={getGlowTexture()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

export { SceneLights, BlinkingPointLight, PlatformPointLight, getGlowTexture };
