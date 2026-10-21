import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  ShaderMaterial,
  TextureLoader,
} from "three";
import { probe, useExperience } from "../state";
import type { SceneProps } from "../state";

const PHOTO = "/images/harsh-hero-906.webp";
// Cache the readback, so responsive particle counts never reread image pixels.
const pixelCache = new WeakMap<
  object,
  { pixels: Uint8ClampedArray; width: number; height: number }
>();
// Independent integer hashes keep the jitter deterministic without diagonal correlation.
function cellJitter(index: number, seed: number) {
  let value = (index ^ seed) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}
function photoPixels(image: HTMLImageElement) {
  const cached = pixelCache.get(image);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(520, image.naturalWidth || image.width);
  canvas.height = Math.round(
    (canvas.width * (image.naturalHeight || image.height)) /
      (image.naturalWidth || image.width),
  );
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context)
    throw new Error(
      "Portrait sampling needs a 2D canvas. The original photo remains in the reading view.",
    );
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const value = {
    pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
    width: canvas.width,
    height: canvas.height,
  };
  pixelCache.set(image, value);
  return value;
}
const vertexShader = `
  attribute vec3 aScatter;
  attribute float aLuminance;
  uniform float uResolved;
  uniform float uPointSize;
  varying float vLuminance;
  void main() {
    vLuminance = aLuminance;
    vec3 p = mix(aScatter, position, uResolved);
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(uPointSize * (12.0 / max(1.0, -viewPosition.z)), 1.0, 5.0);
  }
`;
const fragmentShader = `
  varying float vLuminance;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    // Image values are sRGB: linearize before the output conversion so shadows
    // retain photographic contrast instead of receiving a second gamma lift.
    float light = clamp((vLuminance - 0.035) / 0.93, 0.0, 1.0);
    vec3 ink = mix(vec3(0.005,0.005,0.004),vec3(0.84,0.82,0.76),pow(light,2.2));
    float opacity = (1.0 - smoothstep(0.35,0.5,d)) * 0.97;
    gl_FragColor = vec4(ink,opacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function Portrait({ active, mobile, reduced }: SceneProps) {
  const texture = useLoader(TextureLoader, PHOTO);
  const resolved = useExperience((s) => s.portraitResolved);
  const material = useRef<ShaderMaterial>(null);
  const group = useRef<Group>(null);
  const sample = useMemo(() => {
    const { pixels, width, height } = photoPixels(
      texture.image as HTMLImageElement,
    );
    const count = mobile ? 15000 : 60000;
    const positions = new Float32Array(count * 3);
    const scatter = new Float32Array(count * 3);
    const luminance = new Float32Array(count);
    const physicalHeight = 5.1;
    const physicalWidth = (physicalHeight * width) / height;
    // Equal-height image strata distribute every sample; alternating row counts
    // retain exactly 60K / 15K points and independent jitter removes scan lines.
    const rows = Math.max(1, Math.round(Math.sqrt((count * height) / width)));
    const baseColumns = Math.floor(count / rows);
    const extraColumns = count % rows;
    let row = 0;
    let rowStart = 0;
    let columns = baseColumns + (extraColumns > 0 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      if (i >= rowStart + columns) {
        rowStart += columns;
        row++;
        columns = baseColumns + (row < extraColumns ? 1 : 0);
      }
      const u =
        (i - rowStart + 0.04 + cellJitter(i, 0x2187ad31) * 0.92) / columns;
      const v = (row + 0.04 + cellJitter(i, 0x6db14c85) * 0.92) / rows;
      const pixel =
        (Math.min(height - 1, Math.floor(v * height)) * width +
          Math.min(width - 1, Math.floor(u * width))) *
        4;
      const l =
        (pixels[pixel] * 0.2126 +
          pixels[pixel + 1] * 0.7152 +
          pixels[pixel + 2] * 0.0722) /
        255;
      positions.set(
        [
          (u - 0.5) * physicalWidth,
          (0.5 - v) * physicalHeight,
          (l - 0.5) * 0.63,
        ],
        i * 3,
      );
      luminance[i] = l;
      const angle = i * 2.3999632;
      const radius = 1.2 + ((i % 997) / 997) * 2.4;
      scatter.set(
        [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.83,
          Math.sin(i * 1.618) * 1.65,
        ],
        i * 3,
      );
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aScatter", new BufferAttribute(scatter, 3));
    geometry.setAttribute("aLuminance", new BufferAttribute(luminance, 1));
    geometry.computeBoundingSphere();
    return { geometry, width: physicalWidth, height: physicalHeight };
  }, [texture, mobile]);
  const uniforms = useMemo(
    () => ({
      uResolved: { value: resolved ? 1 : 0 },
      uPointSize: { value: mobile ? 3.7 : 3.1 },
    }),
    [mobile],
  );
  useEffect(() => () => sample.geometry.dispose(), [sample]);
  useEffect(() => {
    if (material.current && (reduced || !active))
      material.current.uniforms.uResolved.value = resolved ? 1 : 0;
  }, [resolved, reduced, active]);
  useFrame((state, delta) => {
    if (!active || useExperience.getState().paused || !material.current) return;
    const target = useExperience.getState().portraitResolved ? 1 : 0;
    material.current.uniforms.uResolved.value = reduced
      ? target
      : material.current.uniforms.uResolved.value +
        (target - material.current.uniforms.uResolved.value) *
          (1 - Math.exp(-delta * 4.8));
    if (group.current && !reduced) {
      // Maximum ~8 CSS px at the authored camera, not a large face rotation.
      group.current.rotation.y +=
        (state.pointer.x * 0.016 - group.current.rotation.y) *
        (1 - Math.exp(-delta * 4));
      group.current.rotation.x +=
        (-state.pointer.y * 0.012 - group.current.rotation.x) *
        (1 - Math.exp(-delta * 4));
    }
  });
  const x = sample.width / 2 + 0.16;
  const y = sample.height / 2 + 0.16;
  return (
    <group
      position={mobile ? [0, 1.05, 0] : [2.2, 0, 0]}
      scale={mobile ? 0.57 : 0.95}
    >
      <group
        ref={group}
        {...probe(
          "Harsh Bhatt · authentic portrait sampled into monochrome points",
        )}
      >
        <points
          geometry={sample.geometry}
          frustumCulled={false}
          renderOrder={2}
        >
          <shaderMaterial
            ref={material}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </points>
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sy) => (
            <Line
              key={`${sx}-${sy}`}
              points={[
                [sx * (x - 0.35), sy * y, -0.5],
                [sx * x, sy * y, -0.5],
                [sx * x, sy * (y - 0.35), -0.5],
              ]}
              color="#a9a796"
              lineWidth={1.1}
            />
          )),
        )}
        <Line
          points={[
            [-x, -y - 0.24, -0.5],
            [x, -y - 0.24, -0.5],
          ]}
          color="#5f6253"
          lineWidth={1}
        />
      </group>
    </group>
  );
}
