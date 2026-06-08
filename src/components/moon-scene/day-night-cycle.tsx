import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUN, MOON, SUN_SHADOW, MOON_SHADOW } from "./constants";

function DayNightCycle() {
  const sunRef = useRef<THREE.DirectionalLight>(null!);
  const moonRef = useRef<THREE.DirectionalLight>(null!);
  const sunDotRef = useRef<THREE.Mesh>(null!);
  const moonDotRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() % SUN.cycleSeconds) / SUN.cycleSeconds;
    const angle = t * Math.PI * 2;

    // sun: Z is up, XY is ground
    const v = Math.sin(angle) * SUN.orbitRadius;
    const h = Math.cos(angle) * SUN.orbitRadius;
    const sx = Math.cos(SUN.tilt) * h + SUN.xOffset;
    const sy = Math.sin(SUN.tilt) * h + SUN.yOffset;
    const sz = v * Math.sin(SUN.inclination);
    sunRef.current.position.set(sx, sy, sz);
    sunRef.current.target.position.set(-sx, -sy, -sz);

    // moon — independent orbit
    const mt = (clock.getElapsedTime() % MOON.cycleSeconds) / MOON.cycleSeconds;
    const moonAngle = mt * Math.PI * 2;
    const mz = Math.sin(moonAngle) * MOON.orbitRadius;
    const mh = Math.cos(moonAngle) * MOON.orbitRadius;
    const mx = Math.cos(MOON.tilt) * mh + MOON.xOffset;
    const my = Math.sin(MOON.tilt) * mh + MOON.yOffset;
    const mw = mz * Math.sin(MOON.inclination);
    moonRef.current.position.set(mx, my, mw);
    moonRef.current.target.position.set(-mx, -my, -mw);

    // debug dots
    sunDotRef.current.position.copy(sunRef.current.position);
    moonDotRef.current.position.copy(moonRef.current.position);

    // intensity
    sunRef.current.intensity =
      THREE.MathUtils.smoothstep(Math.sin(angle), -0.1, 0.3) * SUN.maxIntensity;
    moonRef.current.intensity =
      THREE.MathUtils.smoothstep(Math.sin(moonAngle), -0.1, 0.3) *
      MOON.maxIntensity;
  });

  return (
    <>
      <directionalLight
        ref={sunRef}
        color={SUN.color}
        castShadow
        shadow-mapSize-width={SUN_SHADOW.mapSize}
        shadow-mapSize-height={SUN_SHADOW.mapSize}
        shadow-camera-near={SUN_SHADOW.near}
        shadow-camera-far={SUN_SHADOW.far}
        shadow-camera-left={SUN_SHADOW.left}
        shadow-camera-right={SUN_SHADOW.right}
        shadow-camera-top={SUN_SHADOW.top}
        shadow-camera-bottom={SUN_SHADOW.bottom}
        shadow-bias={SUN_SHADOW.bias}
        shadow-radius={SUN_SHADOW.radius}
      />
      <directionalLight
        ref={moonRef}
        color={MOON.color}
        castShadow
        shadow-mapSize-width={MOON_SHADOW.mapSize}
        shadow-mapSize-height={MOON_SHADOW.mapSize}
        shadow-camera-near={MOON_SHADOW.near}
        shadow-camera-far={MOON_SHADOW.far}
        shadow-camera-left={MOON_SHADOW.left}
        shadow-camera-right={MOON_SHADOW.right}
        shadow-camera-top={MOON_SHADOW.top}
        shadow-camera-bottom={MOON_SHADOW.bottom}
        shadow-bias={MOON_SHADOW.bias}
        shadow-radius={MOON_SHADOW.radius}
      />
      <mesh ref={sunDotRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
      <mesh ref={moonDotRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color={MOON.color} />
      </mesh>
    </>
  );
}

export { DayNightCycle };
