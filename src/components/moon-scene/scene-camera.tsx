import { useLayoutEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MODEL_PATH, MIN_FOV, MAX_FOV } from "./constants";

function SceneCamera() {
  const { scene } = useGLTF(MODEL_PATH);
  const { set, size } = useThree();
  const design = useRef<{ fov: number; aspect: number } | null>(null);

  useLayoutEffect(() => {
    const cam = scene.getObjectByName("Camera-1") as
      | THREE.PerspectiveCamera
      | undefined;
    if (!cam?.isCamera) return;

    // capture the original Blender framing on first run
    if (!design.current) {
      design.current = { fov: cam.fov, aspect: cam.aspect };
    }

    const { fov: designFov, aspect: designAspect } = design.current;
    const currentAspect = size.width / size.height;

    // compute the horizontal FOV that looked good in Blender…
    const targetHFov =
      2 *
      Math.atan(
        Math.tan(THREE.MathUtils.degToRad(designFov) / 2) * designAspect,
      );

    // …and derive the vertical FOV needed to keep it at the current aspect
    let newVFov = 2 * Math.atan(Math.tan(targetHFov / 2) / currentAspect);

    // clamp so things don't go crazy on extreme viewports
    newVFov = THREE.MathUtils.clamp(
      newVFov,
      THREE.MathUtils.degToRad(MIN_FOV),
      THREE.MathUtils.degToRad(MAX_FOV),
    );

    cam.fov = THREE.MathUtils.radToDeg(newVFov);
    cam.aspect = currentAspect;
    cam.updateProjectionMatrix();
    set({ camera: cam });
  }, [scene, set, size]);

  return null;
}

export { SceneCamera };
