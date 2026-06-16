import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

const MAX_HIT_DIST = 50;
const SKIP = new Set(["Terrain_ROOT", "Props_ROOT", "Lights_ROOT"]);
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _box = new THREE.Box3();
const _intersection = new THREE.Vector3();

export function HitPlane({
  model,
  onSelect,
}: {
  model: THREE.Group;
  onSelect: (id: string | null) => void;
}) {
  const { camera, gl } = useThree();

  const bounds = useMemo(() => {
    const map = new Map<string, THREE.Box3>();
    model.traverse((child) => {
      if (child.name.endsWith("_ROOT") && !SKIP.has(child.name)) {
        map.set(child.name, new THREE.Box3().setFromObject(child));
      }
    });
    return map;
  }, [model]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    const rect = gl.domElement.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_mouse, camera);

    let best: string | null = null;
    let bestDist = Infinity;

    for (const [name, box] of bounds) {
      if (_raycaster.ray.intersectBox(box, _intersection)) {
        const dist = camera.position.distanceTo(_intersection);
        if (dist < bestDist) {
          bestDist = dist;
          best = name;
        }
      }
    }

    if (best && bestDist < MAX_HIT_DIST) {
      onSelect(best);
    } else {
      onSelect(null);
    }
  };

  return (
    <mesh
      visible={false}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "default"; }}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
