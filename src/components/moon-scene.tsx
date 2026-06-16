"use client";

import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
  SMAA,
  ChromaticAberration,
  Noise,
  Pixelation,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import {
  ASPECT_LIMIT,
  DPR,
  ENVIRONMENT,
  POST_PROCESSING,
  SHADOW_MAP_TYPE,
} from "./moon-scene/constants";
import { SceneCamera } from "./moon-scene/scene-camera";
import { DayNightCycle } from "./moon-scene/day-night-cycle";
import { MoonBase } from "./moon-scene/moon-base";

/* ── canvas ───────────────────────────────────────── */

export function MoonScene({
  onSelect,
  onHover,
  cameraTarget,
  terrainHue,
  terrainSaturation,
  buildingsHue,
  buildingsSaturation,
}: {
  activeId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  cameraTarget?: string | null;
  terrainHue?: number;
  terrainSaturation?: number;
  buildingsHue?: number;
  buildingsSaturation?: number;
}) {
  const { chromaticAberration, noiseOpacity, pixelationGranularity, bloom, toneMapping, vignette } =
    POST_PROCESSING;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxWidth: `min(100vw, calc(100dvh * ${ASPECT_LIMIT}))`,
        maxHeight: `min(100dvh, calc(100vw * ${ASPECT_LIMIT}))`,
        position: "relative",
      }}
    >
      <Canvas
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = SHADOW_MAP_TYPE;
        }}
        style={{ position: "absolute", inset: 0 }}
        dpr={DPR}
      >
        <SceneCamera />
        <DayNightCycle />
        <Environment
          preset={ENVIRONMENT.preset}
          background={false}
          environmentIntensity={ENVIRONMENT.intensity}
        />
        <EffectComposer multisampling={0}>
          <ChromaticAberration offset={chromaticAberration} />
          <Noise opacity={noiseOpacity} />
          <Pixelation granularity={pixelationGranularity} />
          <Bloom
            luminanceThreshold={bloom.luminanceThreshold}
            luminanceSmoothing={bloom.luminanceSmoothing}
            intensity={bloom.intensity}
            mipmapBlur
            radius={bloom.radius}
          />
          <ToneMapping
            mode={ToneMappingMode.ACES_FILMIC}
            whitePoint={toneMapping.whitePoint}
            middleGrey={toneMapping.middleGrey}
          />
          <Vignette offset={vignette.offset} darkness={vignette.darkness} />
          <SMAA />
        </EffectComposer>
        <MoonBase
          onSelect={onSelect}
          onHover={onHover}
          cameraTarget={cameraTarget}
          terrainHue={terrainHue}
          terrainSaturation={terrainSaturation}
          buildingsHue={buildingsHue}
          buildingsSaturation={buildingsSaturation}
        />
      </Canvas>
    </div>
  );
}
