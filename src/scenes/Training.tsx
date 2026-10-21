import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  ShaderMaterial,
  Vector3,
} from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { useExperience } from "../state";
import { createMonogramGeometry } from "./monogram";

// Shared elapsed clock remains live after the training UI and solid HB have gone.
export const trainingClock = { elapsed: 0 };
type ParticleArrays = {
  noise: Float32Array;
  cluster: Float32Array;
  surface: Float32Array;
  star: Float32Array;
  seed: Float32Array;
};
const samples = new Map<number, ParticleArrays>();
function randomSource() {
  let seed = 1234567;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
function sampleMonogram(count: number) {
  const cached = samples.get(count);
  if (cached) return cached;
  const random = randomSource();
  const gaussian = () =>
    Math.sqrt(-2 * Math.log(Math.max(0.000001, random()))) *
    Math.cos(2 * Math.PI * random());
  const source = createMonogramGeometry();
  const sampler = new MeshSurfaceSampler(new Mesh(source));
  // Runtime supports deterministic sampling; the installed type declaration lags.
  (
    sampler as MeshSurfaceSampler & {
      setRandomGenerator: (generator: () => number) => MeshSurfaceSampler;
    }
  ).setRandomGenerator(random);
  sampler.build();
  const point = new Vector3();
  const arrays: ParticleArrays = {
    noise: new Float32Array(count * 3),
    cluster: new Float32Array(count * 3),
    surface: new Float32Array(count * 3),
    star: new Float32Array(count * 3),
    seed: new Float32Array(count),
  };
  for (let i = 0; i < count; i++) {
    const j = i * 3;
    const cluster = i % 3;
    arrays.noise.set([gaussian() * 4.8, gaussian() * 3.2, gaussian() * 3.1], j);
    arrays.cluster.set(
      [
        (cluster - 1) * 3.1 + gaussian() * 0.55,
        (cluster === 1 ? 0.75 : -0.4) + gaussian() * 0.58,
        gaussian() * 0.65,
      ],
      j,
    );
    sampler.sample(point);
    arrays.surface.set([point.x, point.y, point.z], j);
    // Stars fill the complete seven-room world, rather than following the camera.
    arrays.star.set(
      [(random() - 0.5) * 56, (random() - 0.5) * 35, 20 - random() * 180],
      j,
    );
    arrays.seed[i] = 0.0001 + random() * 0.9999;
  }
  arrays.seed[0] = 0;
  arrays.noise.set([0, 0, 0], 0);
  source.dispose();
  samples.set(count, arrays);
  return arrays;
}

const vertex = /* glsl */ `
  attribute vec3 aCluster;
  attribute vec3 aSurface;
  attribute vec3 aStar;
  attribute float aSeed;
  uniform float uTime;
  uniform float uElapsed;
  uniform float uProgress;
  uniform float uFinished;
  uniform float uReduced;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vLight;
  // Analytic curl of a trigonometric vector potential: divergence-free GPU flow.
  vec3 curlField(vec3 p, float t) {
    vec3 s=sin(p+vec3(t,t*.83,t*.71));
    vec3 c=cos(p);
    return vec3(-s.x*sin(p.y)-cos(p.z+t*.71)*c.x,-s.y*sin(p.z)-cos(p.x+t)*c.y,-s.z*sin(p.x)-cos(p.y+t*.83)*c.z);
  }
  void main() {
    float clusters = smoothstep(0.9, 2.05, uTime);
    float convergence = smoothstep(2.25, 3.65, uTime) * smoothstep(0.55, 1.0, uProgress);
    vec3 noise = position;
    noise += curlField(noise*.65,uTime*.45)*.22;
    vec3 p = mix(noise, aCluster, clusters);
    p = mix(p, aSurface, convergence);
    float eject = max(smoothstep(4.82, 6.25, uTime), uFinished);
    p = mix(p, aStar, 1.0 - pow(1.0 - eject, 3.0));
    // Very small ambient drift stops exactly for pause / reduced motion.
    p.x += sin(uElapsed * 0.035 + aSeed * 40.0) * eject * 0.12 * (1.0 - uReduced);
    float reveal = smoothstep(0.5, 1.15, uTime);
    float onePoint = 1.0 - step(0.000009, aSeed);
    float visiblePoint = mix(onePoint, 1.0, reveal);
    float chromeFade = 1.0 - smoothstep(3.4, 3.8, uTime);
    float sparseStar = 1.0 - step(0.065, aSeed);
    vAlpha = visiblePoint * mix(chromeFade * 0.62, sparseStar * 0.22, eject);
    vAlpha *= 1.0 - uReduced;
    vLight = 0.5 + aSeed * 0.5;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((17.0 + aSeed * 10.0) * uPixelRatio / max(2.0, -mv.z), 0.7, 3.0)+onePoint*3.0*(1.0-reveal);
  }
`;
const fragment = /* glsl */ `
  varying float vAlpha;
  varying float vLight;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if(d > 0.5 || vAlpha < 0.001) discard;
    float core = 1.0 - smoothstep(0.04, 0.5, d);
    gl_FragColor = vec4(vec3(0.88, 0.865, 0.82) * vLight, core * vAlpha);
  }
`;
const smooth = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export function Training({
  mobile,
  reduced,
}: {
  mobile: boolean;
  reduced: boolean;
}) {
  const chrome = useRef<Mesh>(null);
  const solid = useRef<Group>(null);
  const shockwave = useRef<Mesh>(null);
  const wallTime = useRef(0);
  const wasRunning = useRef(useExperience.getState().introRunning);
  const liquid = useMemo(
    () => ({ time: { value: 0 }, strength: { value: 0 } }),
    [],
  );
  const geometry = useMemo(() => createMonogramGeometry(), []);
  const particles = useMemo(() => {
    const array = sampleMonogram(mobile ? 30000 : 120000);
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(array.noise, 3));
    result.setAttribute("aCluster", new BufferAttribute(array.cluster, 3));
    result.setAttribute("aSurface", new BufferAttribute(array.surface, 3));
    result.setAttribute("aStar", new BufferAttribute(array.star, 3));
    result.setAttribute("aSeed", new BufferAttribute(array.seed, 1));
    return result;
  }, [mobile]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uElapsed: { value: 0 },
          uProgress: { value: 0 },
          uFinished: { value: 0 },
          uReduced: { value: reduced ? 1 : 0 },
          uPixelRatio: { value: 1 },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );
  const chromeMaterial = useMemo(() => {
    const result = new MeshPhysicalMaterial({
      color: new Color("#bdbbb2"),
      metalness: 1,
      roughness: 0.17,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      transparent: true,
    });
    result.onBeforeCompile = (shader) => {
      shader.uniforms.uLiquidTime = liquid.time;
      shader.uniforms.uLiquidStrength = liquid.strength;
      shader.vertexShader = `uniform float uLiquidTime; uniform float uLiquidStrength;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        float wave = sin(position.y * 7.0 + uLiquidTime * 3.0) * cos(position.x * 5.0 - uLiquidTime * 2.0);
        transformed += normal * wave * uLiquidStrength;
      `,
      );
    };
    result.customProgramCacheKey = () => "latent-liquid-hb-v1";
    return result;
  }, [liquid]);

  useEffect(() => () => particles.dispose(), [particles]);
  useEffect(
    () => () => {
      material.dispose();
      geometry.dispose();
      chromeMaterial.dispose();
    },
    [material, geometry, chromeMaterial],
  );
  useFrame((frame, delta) => {
    const state = useExperience.getState();
    const hidden = document.hidden;
    const dt = Math.min(delta, 0.08);
    if (!hidden && !state.paused) {
      trainingClock.elapsed += dt;
      if (state.introRunning) {
        wallTime.current += delta;
        let time = state.introTime + dt;
        if (!reduced && !state.assetsReady && wallTime.current < 6.8)
          time = Math.min(time, 2.65);
        const finished = reduced
          ? time >= 1.2
          : time >= 6.6 || wallTime.current >= 8;
        state.set({
          introTime: finished && !reduced ? 6.6 : time,
          introRunning: !finished,
        });
      }
    }
    const now = useExperience.getState();
    const time = now.introTime;
    const running = now.introRunning;
    // A skipped intro is a permanent state transition, including a time-zero skip.
    if (wasRunning.current && !running) material.uniforms.uFinished.value = 1;
    wasRunning.current = running;
    material.uniforms.uTime.value = time;
    material.uniforms.uElapsed.value = trainingClock.elapsed;
    material.uniforms.uProgress.value = Math.min(1, now.assetProgress / 100);
    material.uniforms.uFinished.value = running ? 0 : 1;
    material.uniforms.uReduced.value = reduced ? 1 : 0;
    material.uniforms.uPixelRatio.value = frame.gl.getPixelRatio();
    liquid.time.value = time;
    liquid.strength.value = reduced ? 0 : 0.045 * (1 - smooth(3.6, 4.4, time));
    if (solid.current) {
      solid.current.visible = running && (reduced || time > 3.35);
      const chromeIn = reduced
        ? (1 - smooth(0.15, 1.2, time)) * 0.65
        : smooth(3.35, 3.85, time) * (1 - smooth(6.0, 6.5, time));
      chromeMaterial.opacity = chromeIn;
      // The short frozen interval gives the industrial stamp one precise impact.
      const stampTime = time > 4.7 && time < 4.77 ? 4.7 : time;
      solid.current.position.z = reduced
        ? 0
        : 0.95 *
          smooth(4.48, 4.7, stampTime) *
          (1 - smooth(4.77, 5.03, stampTime));
      chromeMaterial.roughness = reduced
        ? 0.23
        : 0.13 + 0.13 * (1 - smooth(3.5, 4.25, time));
    }
    if (chrome.current) {
      chrome.current.rotation.y = reduced
        ? 0
        : 0.045 * Math.sin(time * 2.5) * (1 - smooth(4.2, 4.65, time));
    }
    if (shockwave.current) {
      const ring = smooth(4.7, 5.3, time);
      shockwave.current.visible =
        running && !reduced && time > 4.7 && time < 5.3;
      shockwave.current.scale.setScalar(0.65 + ring * 7);
      (shockwave.current.material as MeshPhysicalMaterial).opacity =
        (1 - ring) * 0.48;
    }
  });
  return (
    <group>
      <points geometry={particles} material={material} frustumCulled={false} />
      <group ref={solid} visible={false}>
        <mesh ref={chrome} geometry={geometry} material={chromeMaterial} />
        <rectAreaLight
          position={[0, 3, 4]}
          rotation={[-0.45, 0, 0]}
          width={8}
          height={1.5}
          color="#ede9df"
          intensity={9}
        />
      </group>
      <mesh ref={shockwave} visible={false} position={[0, 0, 0.35]}>
        <ringGeometry args={[1, 1.012, 128]} />
        <meshBasicMaterial
          color="#dedbd2"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
