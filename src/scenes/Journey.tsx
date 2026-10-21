import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  Vector3,
} from "three";
import { CHROME, useExperience, type SceneProps } from "../state";
import { JOURNEY_CURVE, JOURNEY_ANCHORS } from "./journeyGeometry";
import { OpticalGlass, FineLines, curveSegments } from "./optics";
import { SceneLabel } from "./SceneLabel";

function ribbonGeometry() {
  const vertices: number[] = [],
    indices: number[] = [],
    edges = [[], []] as Vector3[][];
  for (let i = 0; i <= 160; i++) {
    const t = i / 160,
      p = JOURNEY_CURVE.getPoint(t);
    const normal = new Vector3(p.x, 0, p.z).normalize().multiplyScalar(0.23);
    const a = p.clone().sub(normal),
      b = p.clone().add(normal);
    vertices.push(...a.toArray(), ...b.toArray());
    edges[0].push(a);
    edges[1].push(b);
    if (i < 160) {
      const n = i * 2;
      indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return { geometry: g, edges: edges.flatMap(curveSegments) };
}
export default function Journey({ active, reduced, mobile }: SceneProps) {
  const index = useExperience((s) => s.nodeIndex);
  const root = useRef<Group>(null),
    pulse = useRef<Mesh>(null),
    clock = useRef(0);
  const { geometry, edges } = useMemo(ribbonGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ pointer }, delta) => {
    if (!active || reduced || useExperience.getState().paused) return;
    clock.current += Math.min(delta, 0.05);
    if (root.current) root.current.rotation.y = -0.24 + pointer.x * 0.065;
    pulse.current?.position.copy(
      JOURNEY_CURVE.getPoint((clock.current * 0.075) % 1),
    );
  });
  return (
    <group ref={root} rotation={[0.06, -0.24, -0.16]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#bac9dc"
          metalness={0.65}
          roughness={0.16}
          clearcoat={1}
          envMapIntensity={1.7}
          side={DoubleSide}
        />
      </mesh>
      <FineLines segments={edges} opacity={0.75} />
      {JOURNEY_ANCHORS.map((p, i) => (
        <group key={i} position={p}>
          <mesh scale={[0.23, 0.23, 0.12]}>
            <icosahedronGeometry args={[1, 2]} />
            <OpticalGlass opacity={i === index ? 0.85 : 0.45} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} scale={i === index ? 1.15 : 1}>
            <torusGeometry args={[0.28, 0.016, 6, 32]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
          {!mobile && (
            <SceneLabel
              active={active}
              position={[0, 0.44, 0.1]}
              className="no-surface"
            >
              {String(i + 1).padStart(2, "0")}
            </SceneLabel>
          )}
        </group>
      ))}
      <mesh ref={pulse} position={JOURNEY_ANCHORS[0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshBasicMaterial color="#f2f7ff" />
      </mesh>
    </group>
  );
}
