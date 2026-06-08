import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { LABEL_OFFSETS } from "./constants";

function BuildingLabels({ model }: { model: THREE.Group }) {
  const buildings = useMemo(() => {
    const result: {
      name: string;
      position: [number, number, number];
    }[] = [];
    model.traverse((child) => {
      if (
        child.name.endsWith("_ROOT") &&
        child.name !== "Terrain_ROOT" &&
        child.name !== "Props_ROOT" &&
        child.name !== "Lights_ROOT"
      ) {
        const center = new THREE.Vector3();
        child.getWorldPosition(center);
        result.push({
          name: child.name.replace("_ROOT", ""),
          position: [center.x, center.y, center.z],
        });
      }
    });
    return result;
  }, [model]);

  return (
    <>
      {buildings.map((b) => {
        const offset = LABEL_OFFSETS[b.name] ?? [0, 0, 0];
        return (
          <Html
            key={b.name}
            position={[
              b.position[0] + offset[0],
              b.position[1] + offset[1],
              b.position[2] + offset[2],
            ]}
            center
            sprite
            distanceFactor={8}
            occlude={false}
            style={{ pointerEvents: "none" }}
          >
            <span className="building-label">{b.name}</span>
          </Html>
        );
      })}
    </>
  );
}

export { BuildingLabels, LABEL_OFFSETS };
