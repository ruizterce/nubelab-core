import * as THREE from "three";

/* ───────────────────────────────────────────────────────
 * GLSL: RGB ↔ HSL conversion + hue/saturation adjustment
 *
 * Functions go at global scope (before `void main()`).
 * The adjustment block goes inside `main()`, right after
 * `#include <color_fragment>` so `diffuseColor` is
 * adjusted before entering the PBR lighting equations.
 * ──────────────────────────────────────────────────── */

/* ── injected at global scope, before void main() ──── */
const GLOBAL_FUNCTIONS = /* glsl */ `

// RGB to HSL (hue in 0..1 range)
vec3 nubelab_rgb2hsl(vec3 c) {
    float maxC = max(max(c.r, c.g), c.b);
    float minC = min(min(c.r, c.g), c.b);
    float l   = (maxC + minC) * 0.5;
    float s   = 0.0;
    float h   = 0.0;
    float d   = maxC - minC;
    if (d > 0.0) {
        s = (l > 0.5) ? d / (2.0 - maxC - minC) : d / (maxC + minC);
        if (maxC == c.r) {
            h = mod((c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0), 6.0);
        } else if (maxC == c.g) {
            h = (c.b - c.r) / d + 2.0;
        } else {
            h = (c.r - c.g) / d + 4.0;
        }
    }
    return vec3(h / 6.0, s, l);
}

// HSL (hue 0..1) back to RGB
vec3 nubelab_hsl2rgb(vec3 hsl) {
    vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}
`;

/* ── injected inside main(), after color_fragment ──── */
const ADJUST_AFTER_COLOR = /* glsl */ `

// Apply hue shift and saturation multiplier to diffuseColor
{
    vec3 _hsl = nubelab_rgb2hsl(diffuseColor.rgb);
    _hsl.x = mod(_hsl.x + uTerrainHue, 1.0);
    _hsl.y = clamp(_hsl.y * uTerrainSaturation, 0.0, 1.0);
    diffuseColor.rgb = nubelab_hsl2rgb(_hsl);
}
`;

/* ── prepended to the very top of the fragment shader ─ */
const UNIFORM_DECL = /* glsl */ `
uniform float uTerrainHue;
uniform float uTerrainSaturation;
`;

/* ───────────────────────────────────────────────────────
 * Public API
 * ──────────────────────────────────────────────────── */

export interface TerrainUniforms {
  uTerrainHue: THREE.Uniform<number>;
  uTerrainSaturation: THREE.Uniform<number>;
}

/** Create shared uniforms initialised to identity values. */
export function createTerrainUniforms(): TerrainUniforms {
  return {
    uTerrainHue: new THREE.Uniform(0),
    uTerrainSaturation: new THREE.Uniform(1),
  };
}

/**
 * Install `onBeforeCompile` on a MeshStandardMaterial so its
 * fragment shader applies a hue shift and saturation multiplier
 * to `diffuseColor`.
 */
export function patchTerrainMaterial(
  material: THREE.MeshStandardMaterial,
  uniforms: TerrainUniforms,
): void {
  material.onBeforeCompile = (
    shader: THREE.WebGLProgramParametersWithUniforms,
    _renderer: THREE.WebGLRenderer,
  ) => {
    // 1. Register uniforms so Three.js uploads them to the GPU
    shader.uniforms.uTerrainHue = uniforms.uTerrainHue;
    shader.uniforms.uTerrainSaturation = uniforms.uTerrainSaturation;

    // 2. Inject uniform declarations at the top of the shader
    shader.fragmentShader = UNIFORM_DECL + shader.fragmentShader;

    // 3. Inject function definitions at global scope (before void main)
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main()",
      `${GLOBAL_FUNCTIONS}\nvoid main()`,
    );

    // 4. Inject the HSL adjustment inside main(), right after diffuseColor
    //    is finalised (before lighting)
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>${ADJUST_AFTER_COLOR}`,
    );
  };

  // Ensure terrain materials get a distinct program cache key
  material.customProgramCacheKey = () => {
    return "nubelab-terrain-hsl";
  };
}
