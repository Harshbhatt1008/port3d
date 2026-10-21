import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Shape,
  ShaderMaterial,
} from "three";
import type { Group } from "three";
import { datasetSamples } from "../content";
import { CHROME, DARK, probe, useExperience } from "../state";
import type { SceneProps } from "../state";
import { particleFragment, particleVertex, Rod } from "./researchGeometry";
import type { Point } from "./researchGeometry";

const risks = ["LOW", "MEDIUM", "HIGH"] as const;
const spectrum = ["#6ab77d", "#dfb64d", "#d87c65"];
const destinations: Point[] = [
  [3.2, 1.16, 0.08],
  [3.2, 0.12, 0.12],
  [3.2, -0.92, 0.16],
];

function PromptFlow({ mobile, active, reduced }: SceneProps) {
  const material = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const count = mobile ? 110 : 260;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Deterministic points keep the illustration stable after a chapter revisit.
      const u = ((i * 47) % count) / count;
      positions[i * 3 + 1] = 0.18 + (u - 0.5) * 0.19;
      positions[i * 3 + 2] = (((i * 23) % count) / count - 0.5) * 0.19;
      seeds[i] = i / count;
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(positions, 3));
    result.setAttribute("seed", new BufferAttribute(seeds, 1));
    return result;
  }, [mobile]);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSize: { value: mobile ? 2.5 : 3 } }),
    [mobile],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    const state = useExperience.getState();
    if (
      !active ||
      reduced ||
      state.paused ||
      document.hidden ||
      !material.current
    )
      return;
    material.current.uniforms.uTime.value += Math.min(delta, 0.05);
  });
  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

export default function Prism(props: SceneProps) {
  const { mobile, active, reduced } = props;
  const sampleIndex = useExperience((state) => state.sampleIndex);
  const risk =
    datasetSamples[sampleIndex % datasetSamples.length]?.risk ?? "LOW";
  const selected = risks.indexOf(risk);
  const prism = useRef<Group>(null);
  const glass = useMemo(() => {
    const triangle = new Shape();
    triangle.moveTo(-0.94, -0.69);
    triangle.lineTo(0.94, -0.69);
    triangle.lineTo(0, 1.08);
    triangle.closePath();
    const geometry = new ExtrudeGeometry(triangle, {
      depth: 1.35,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    });
    geometry.translate(0, 0, -0.675);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => glass.dispose(), [glass]);
  useFrame(({ pointer }, delta) => {
    if (!active || !prism.current) return;
    const state = useExperience.getState();
    if (reduced || state.paused || document.hidden) return;
    prism.current.rotation.y +=
      (-0.35 + pointer.x * 0.055 - prism.current.rotation.y) *
      Math.min(1, delta * 4);
  });
  return (
    <group
      position={mobile ? [0, 0.95, 0] : [2.12, 0, 0]}
      scale={mobile ? 0.53 : 0.89}
    >
      {/* A compact optical bench leaves the prism's silhouette and refraction legible. */}
      <mesh position={[0, -1.27, 0.02]}>
        <boxGeometry args={[7.25, 0.14, 1.56]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0, -1.183, 0.02]}>
        <boxGeometry args={[7.1, 0.025, 1.4]} />
        <meshStandardMaterial {...CHROME} roughness={0.3} />
      </mesh>
      {[-2.85, 2.85].map((x) => (
        <mesh key={x} position={[x, -1.55, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.5, 12]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
      ))}
      {Array.from({ length: 25 }, (_, i) => (
        <mesh key={i} position={[-3.25 + i * 0.27, -1.159, 0.59]}>
          <boxGeometry args={[0.012, 0.008, i % 5 === 0 ? 0.13 : 0.065]} />
          <meshBasicMaterial color="#55554b" />
        </mesh>
      ))}
      <group
        ref={prism}
        position={[0, 0.15, 0.06]}
        rotation={[0.08, -0.35, 0]}
        {...probe("PRISM · physical glass")}
      >
        <mesh geometry={glass}>
          <meshPhysicalMaterial
            color="#fffdf2"
            transmission={1}
            roughness={0.07}
            metalness={0}
            thickness={1.35}
            ior={1.5}
            dispersion={0.6}
            clearcoat={1}
            clearcoatRoughness={0.025}
            envMapIntensity={3}
            attenuationColor="#eeece3"
            attenuationDistance={12}
          />
        </mesh>
      </group>
      {/* Optical calibration bars sit BEHIND the physical glass. Their displaced
          spacing makes real transmission/refraction readable against obsidian.
          Tune target distance (-1.15) and IOR above together, not with CSS glow. */}
      <group position={[0, 0.15, -1.15]}>
        <mesh position={[0, 0, -0.055]}>
          <boxGeometry args={[2.28, 2.12, 0.06]} />
          <meshStandardMaterial {...DARK} roughness={0.65} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[-0.94 + i * 0.235, 0, 0]}>
            <boxGeometry args={[i % 2 ? 0.018 : 0.055, 1.86, 0.018]} />
            <meshBasicMaterial color={i % 2 ? "#9e9b8e" : "#e7e4d7"} />
          </mesh>
        ))}
        {[-0.62, 0, 0.62].map((y) => (
          <mesh key={y} position={[0, y, 0.012]}>
            <boxGeometry args={[2.02, 0.018, 0.012]} />
            <meshBasicMaterial color="#b8b4a6" />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -0.89, 0]}>
        <cylinderGeometry args={[0.52, 0.58, 0.28, 40]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh
        position={[-3.14, 0.18, 0]}
        rotation={[0, 0, Math.PI / 2]}
        {...probe("Prelabelled prompt enters the prism")}
      >
        <cylinderGeometry args={[0.16, 0.16, 0.34, 24]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <Rod from={[-3.14, -1.1, 0]} to={[-3.14, 0.01, 0]} radius={0.035} />
      <Rod
        from={[-2.96, 0.18, 0]}
        to={[-0.65, 0.18, 0]}
        radius={0.018}
        color="#e8e5d8"
        opacity={0.46}
        glow={0.6}
      />
      <PromptFlow {...props} />
      {[-2.55, -1.89, -1.23].map((x, i) => (
        <group
          key={x}
          position={[x, 0.45, 0.18]}
          rotation={[0, 0, 0.04 * (i - 1)]}
        >
          <mesh>
            <boxGeometry args={[0.42, 0.23, 0.035]} />
            <meshStandardMaterial {...DARK} roughness={0.4} />
          </mesh>
          {[0, 1, 2].map((line) => (
            <mesh key={line} position={[-0.02, 0.065 - line * 0.06, 0.019]}>
              <boxGeometry args={[line === 2 ? 0.2 : 0.3, 0.01, 0.004]} />
              <meshBasicMaterial color="#a6a398" />
            </mesh>
          ))}
        </group>
      ))}
      {destinations.map((destination, i) => (
        <group key={risks[i]}>
          <Rod
            from={[0.58, 0.18, 0]}
            to={destination}
            radius={selected === i ? 0.026 : 0.009}
            color={spectrum[i]}
            opacity={selected === i ? 0.8 : 0.14}
            glow={selected === i ? 1.7 : 0.12}
          />
          <Rod
            from={[destination[0], -1.1, destination[2]]}
            to={[destination[0], destination[1] - 0.15, destination[2]]}
            radius={0.025}
            color="#79796e"
          />
          <mesh
            position={destination}
            {...probe(`${risks[i]} · prelabelled route`)}
          >
            <boxGeometry args={[0.26, 0.4, 0.22]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
          <mesh
            position={[destination[0] - 0.142, destination[1], destination[2]]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.15, 0.29]} />
            <meshBasicMaterial
              color={spectrum[i]}
              transparent
              opacity={selected === i ? 1 : 0.19}
              side={DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
