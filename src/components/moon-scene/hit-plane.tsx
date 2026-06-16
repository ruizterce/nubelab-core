import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { buildBuildingBounds } from "./building-utils";

const MAX_HIT_DIST = 50;
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _intersection = new THREE.Vector3();

export function HitPlane({
  model,
  onSelect,
}: {
  model: THREE.Group;
  onSelect: (id: string | null) => void;
}) {
  const { camera, gl } = useThree();
  const bounds = useMemo(() => buildBuildingBounds(model), [model]);

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
