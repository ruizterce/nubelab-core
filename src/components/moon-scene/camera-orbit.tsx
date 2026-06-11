import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const LERP_SPEED = 3;

// ── AJUSTA ESTE OFFSET ────────────────────────────
// Compensación en XY cuando el sidebar lateral está visible.
// Cambia los valores hasta que el edificio no quede tapado.
const _offset = new THREE.Vector3(1, 5, -1);
// ───────────────────────────────────────────────────

const _buildingPos = new THREE.Vector3();
const SKIP = new Set(["Terrain_ROOT", "Props_ROOT", "Lights_ROOT"]);

export function CameraOrbit({
  target,
  model,
}: {
  target: string | null;
  model: THREE.Group;
}) {
  const { camera } = useThree();
  const originalPos = useRef(new THREE.Vector3());
  const positions = useRef<Map<string, THREE.Vector3>>(new Map());
  const targetPos = useRef(new THREE.Vector3());
  const hasInit = useRef(false);
  const moving = useRef(false);

  useFrame((_, delta) => {
    if (!hasInit.current) {
      hasInit.current = true;
      originalPos.current.copy(camera.position);

      model.traverse((child) => {
        if (child.name.endsWith("_ROOT") && !SKIP.has(child.name)) {
          child.getWorldPosition(_buildingPos);
          positions.current.set(
            child.name,
            originalPos.current.clone().add(_buildingPos).add(_offset)
          );
        }
      });
    }

    const wantMove = target !== null;
    const goal = wantMove
      ? positions.current.get(target.endsWith("_ROOT") ? target : `${target}_ROOT`) ?? originalPos.current
      : originalPos.current;

    if (wantMove) {
      targetPos.current.copy(goal);
      moving.current = true;
    } else if (camera.position.distanceTo(originalPos.current) > 0.005) {
      targetPos.current.copy(originalPos.current);
      moving.current = true;
    } else {
      moving.current = false;
    }

    if (moving.current) {
      const t = 1 - Math.exp(-LERP_SPEED * delta);
      camera.position.lerp(targetPos.current, t);
    }
  });

  return null;
}
