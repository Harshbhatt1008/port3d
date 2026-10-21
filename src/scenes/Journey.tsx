import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Group,
  Vector3,
} from "three";
import { CHROME, DARK, probe, useExperience } from "../state";
import type { SceneProps } from "../state";
import { timeline } from "../content";

// Seven supplied journey landmarks; the rail is illustrative, not measured loss.
// Dates belong to the source timeline: the internships and awards have no invented years.
const ANCHORS = [
  new Vector3(-3.1, 1.8, -0.4),
  new Vector3(-2.25, 1.04, 0.12),
  new Vector3(-1.22, 0.42, 0.45),
  new Vector3(-0.18, -0.22, 0.15),
  new Vector3(0.92, -0.64, -0.27),
  new Vector3(2.02, -0.87, -0.05),
  new Vector3(3.02, -1.02, 0.32),
];
const CURVE = new CatmullRomCurve3(ANCHORS, false, "catmullrom", 0.4);

function makeRibbon() {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= 160; i++) {
    const point = CURVE.getPoint(i / 160);
    positions.push(
      point.x,
      point.y,
      point.z - 0.22,
      point.x,
      point.y,
      point.z + 0.22,
    );
    if (i < 160) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function toolNetwork(mode: number) {
  const nodes = Array.from({ length: 12 }, (_, i) => {
    if (mode === 0) {
      const angle = (i / 12) * Math.PI * 2;
      return new Vector3(
        Math.cos(angle) * 1.37,
        Math.sin(angle) * 0.68,
        Math.sin(angle * 2) * 0.3,
      );
    }
    if (mode === 1)
      return new Vector3(
        (Math.floor(i / 4) - 1) * 1.18,
        ((i % 4) - 1.5) * 0.42,
        (Math.floor(i / 4) % 2) * 0.3,
      );
    const a = (Math.floor(i / 4) / 3) * Math.PI * 2;
    const b = ((i % 4) / 4) * Math.PI * 2;
    return new Vector3(
      Math.cos(a) * 1.12 + Math.cos(b) * 0.38,
      Math.sin(a) * 0.54 + Math.sin(b) * 0.3,
      Math.cos(b) * 0.26,
    );
  });
  const edges: [number, number][] = [];
  if (mode === 0) {
    for (let i = 0; i < 12; i++) {
      edges.push([i, (i + 1) % 12]);
      if (i % 2 === 0) edges.push([i, (i + 6) % 12]);
    }
  } else if (mode === 1) {
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 4; j++)
        if ((i + j) % 2 === 0) edges.push([i, Math.floor(i / 4) * 4 + 4 + j]);
  } else {
    for (let i = 0; i < 12; i++) {
      edges.push([i, Math.floor(i / 4) * 4 + ((i + 1) % 4)]);
      if (i % 4 === 0) edges.push([i, (i + 4) % 12]);
    }
  }
  return { nodes, edges };
}

export default function Journey({ active, mobile, reduced }: SceneProps) {
  const nodeIndex = useExperience((s) => s.nodeIndex);
  const toolIndex = useExperience((s) => s.toolIndex);
  const focus = useRef<Group>(null);
  const network = useRef<Group>(null);
  const ribbon = useMemo(makeRibbon, []);
  const topology = useMemo(() => toolNetwork(toolIndex), [toolIndex]);
  const selected = ANCHORS[Math.max(0, Math.min(6, nodeIndex))];
  useEffect(() => () => ribbon.dispose(), [ribbon]);
  useEffect(() => {
    if (focus.current && reduced) focus.current.position.copy(selected);
  }, [selected, reduced]);
  useFrame((_, delta) => {
    if (!active || useExperience.getState().paused || reduced) return;
    focus.current?.position.lerp(selected, 1 - Math.exp(-delta * 7));
    // The network settles on a topology change; it does not spin while being read.
    if (network.current)
      network.current.rotation.y +=
        (0.06 - network.current.rotation.y) * (1 - Math.exp(-delta * 6));
  });
  const rail = useMemo(() => CURVE.getPoints(100), []);
  return (
    <group
      position={mobile ? [0, 1.05, 0] : [2.2, -0.05, 0]}
      scale={mobile ? 0.55 : 0.93}
      rotation={[0.06, -0.14, 0]}
    >
      <mesh
        geometry={ribbon}
        {...probe(
          "Illustrative descending loss curve · journey from 2020 to 2026",
        )}
      >
        <meshStandardMaterial {...CHROME} side={DoubleSide} roughness={0.29} />
      </mesh>
      {[-0.24, 0.24].map((offset) => (
        <Line
          key={offset}
          points={rail.map(
            (p) => [p.x, p.y + 0.045, p.z + offset] as [number, number, number],
          )}
          color="#e2ddcf"
          lineWidth={1.1}
        />
      ))}
      {ANCHORS.map((p, i) => (
        <group
          key={i}
          position={p}
          {...probe(`${timeline[i].year} · ${timeline[i].title}`)}
        >
          <mesh position={[0, (-2.05 - p.y) / 2, 0]}>
            <cylinderGeometry args={[0.025, 0.05, p.y + 2.05, 10]} />
            <meshStandardMaterial
              color="#626459"
              metalness={0.8}
              roughness={0.33}
            />
          </mesh>
          <mesh position={[0, -2.05 - p.y, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.09, 20]} />
            <meshStandardMaterial {...DARK} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.035, 8, 28]} />
            <meshStandardMaterial
              color={nodeIndex === i ? "#e6e1d3" : "#9b9b8d"}
              metalness={1}
              roughness={0.21}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.085, 14, 12]} />
            <meshStandardMaterial
              color={nodeIndex === i ? "#eee8da" : "#4b4d43"}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          <Line
            points={[
              [0, 0, 0],
              [0, 0.31, 0],
              [0.2, 0.43, 0],
            ]}
            color="#8b8d7c"
            lineWidth={1}
          />
          {[0, 1, 2].map((n) => (
            <mesh key={n} position={[0.24 + n * 0.1, 0.43, 0]}>
              <boxGeometry args={[0.045, 0.05 + n * 0.03, 0.06]} />
              <meshStandardMaterial {...CHROME} />
            </mesh>
          ))}
        </group>
      ))}
      <group ref={focus} position={selected}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.014, 6, 44]} />
          <meshBasicMaterial color="#eee7d7" />
        </mesh>
        <mesh position={[0, 0.32, 0]} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.095]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      </group>
      <Line
        points={[
          [-3.35, -2.06, 0.5],
          [3.35, -2.06, 0.5],
        ]}
        color="#626456"
        lineWidth={0.8}
      />
      <group
        ref={network}
        position={[0.85, 1.44, -0.38]}
        {...probe(
          "Tool constellation · topology follows the selected tool group",
        )}
      >
        {topology.edges.map(([a, b], i) => (
          <Line
            key={`${toolIndex}-${i}`}
            points={[topology.nodes[a], topology.nodes[b]]}
            color="#a9aa9a"
            transparent
            opacity={0.43}
            lineWidth={0.85}
          />
        ))}
        {topology.nodes.map((p, i) => (
          <group key={i} position={p}>
            <mesh rotation={[i * 0.21, i * 0.37, 0]}>
              {i % 3 === 0 ? (
                <octahedronGeometry args={[0.11]} />
              ) : i % 3 === 1 ? (
                <boxGeometry args={[0.13, 0.13, 0.13]} />
              ) : (
                <sphereGeometry args={[0.085, 12, 10]} />
              )}
              <meshStandardMaterial
                {...CHROME}
                roughness={i % 3 === 1 ? 0.42 : 0.19}
              />
            </mesh>
            {i % 4 === 0 && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.2, 0.009, 6, 24]} />
                <meshStandardMaterial
                  color="#7f8372"
                  metalness={0.8}
                  roughness={0.3}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
