import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { LABEL_OFFSETS } from "./constants";
import { findBuildingRoots } from "./building-utils";

function BuildingLabels({ model }: { model: THREE.Group }) {
  const buildings = useMemo(() => {
    return findBuildingRoots(model).map((child) => {
      const center = new THREE.Vector3();
      child.getWorldPosition(center);
      return {
        name: child.name.replace("_ROOT", ""),
        position: [center.x, center.y, center.z] as [number, number, number],
      };
    });
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

export { BuildingLabels };
