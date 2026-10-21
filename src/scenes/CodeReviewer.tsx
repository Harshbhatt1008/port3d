import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  Vector3,
} from "three";
import { CHROME, DARK, useExperience, type SceneProps } from "../state";
import { retrievalFiles, sceneCopy } from "../content";
import { chamferedGeometry, Chamfer } from "./instrumentGeometry";
import { OpticalGlass, FineLines, curveSegments } from "./optics";
import { SceneLabel } from "./SceneLabel";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const source = (i: number) =>
  new Vector3(
    -1.55 + ((i % 4) - 1.5) * 0.64,
    ((Math.floor(i / 4) % 4) - 1.5) * 0.64,
    (Math.floor(i / 16) - 1) * 0.72,
  );
const selectedIndices = (file: number) => [
  file * 4 + 1,
  file * 4 + 16,
  file * 4 + 34,
];

export default function CodeReviewer({ active, mobile, reduced }: SceneProps) {
  const index = useExperience((s) => s.fileIndex);
  const root = useRef<Group>(null),
    chunks = useRef<InstancedMesh>(null);
  const dots = useRef<(Mesh | null)[]>([]),
    floating = useRef<Group>(null);
  const clock = useRef(0),
    lift = useRef(reduced ? 1 : 0);
  const dummy = useMemo(() => new Object3D(), []);
  const count = mobile ? 32 : 48;
  const geometry = useMemo(() => chamferedGeometry(0.4, 0.4, 0.4, false), []);
  const reportInk = useMemo(() => {
    const pieces = [];
    for (let n = 0; n < 3; n++) {
      const badge = chamferedGeometry(0.1, 0.1, 0.025, false);
      badge.rotateZ(Math.PI / 4);
      badge.translate(-0.56, 0.805 - n * 0.65, 0.23);
      pieces.push(badge);
      for (let j = 0; j < 3; j++) {
        const line = chamferedGeometry(
          j === 1 ? 0.86 : 1.04,
          0.022,
          0.012,
          false,
        );
        line.translate(0.05, 0.83 - n * 0.65 - j * 0.115, 0.23);
        pieces.push(line);
      }
    }
    const merged = mergeGeometries(pieces);
    pieces.forEach((g) => g.dispose());
    return merged;
  }, []);
  const nearest = useMemo(
    () => selectedIndices(index).map((i) => i % count),
    [index, count],
  );
  const curves = useMemo(
    () =>
      nearest.map((i, n) => {
        const p = source(i).add(new Vector3(0.4, 0.55, 0.9));
        return new CatmullRomCurve3([
          p,
          p.clone().add(new Vector3(0.9, 0.6, 0.2)),
          new Vector3(1.25, 1.2 - n * 0.5, 1),
          new Vector3(2.3, 0.7 - n * 0.63, 0.3),
        ]);
      }),
    [nearest],
  );
  const threads = useMemo(
    () => [
      ...curves.flatMap((c) => curveSegments(c.getPoints(40))),
      -3.5,
      1.4,
      1.4,
      ...source(nearest[0]).toArray(),
    ],
    [curves],
  );
  const structure = useMemo(() => {
    const lines: number[] = [];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        lines.push(
          -2.8,
          (i - 1.5) * 0.64,
          (j - 1) * 0.72,
          -0.2,
          (i - 1.5) * 0.64,
          (j - 1) * 0.72,
        );
        lines.push(
          -1.55 + (i - 1.5) * 0.64,
          -1.3,
          (j - 1) * 0.72,
          -1.55 + (i - 1.5) * 0.64,
          1.3,
          (j - 1) * 0.72,
        );
      }
    return lines;
  }, []);
  const place = (amount: number) => {
    for (let i = 0; i < count; i++) {
      dummy.position.copy(source(i));
      if (nearest.includes(i))
        dummy.position.addScaledVector(new Vector3(0.4, 0.55, 0.9), amount);
      dummy.rotation.set(
        0.08,
        -0.12 + (nearest.includes(i) ? amount * 0.28 : 0),
        0.035,
      );
      dummy.scale.setScalar(nearest.includes(i) ? 1.12 : 0.9);
      dummy.updateMatrix();
      chunks.current?.setMatrixAt(i, dummy.matrix);
    }
    if (chunks.current) chunks.current.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => {
    lift.current = reduced ? 1 : 0;
    place(lift.current);
  }, [index, count, reduced]);
  useEffect(
    () => () => {
      geometry.dispose();
      reportInk.dispose();
    },
    [geometry, reportInk],
  );
  useFrame(({ pointer }, delta) => {
    if (!active) return;
    const s = useExperience.getState();
    if (!reduced && !s.paused) {
      clock.current += Math.min(delta, 0.05);
      if (lift.current < 0.999) {
        lift.current += (1 - lift.current) * (1 - Math.exp(-delta * 3));
        place(lift.current);
      }
      dots.current.forEach((dot, i) =>
        dot?.position.copy(
          curves[i].getPoint((clock.current * 0.2 + i * 0.3) % 1),
        ),
      );
      if (floating.current)
        floating.current.position.y = 2.4 + Math.sin(clock.current * 0.7) * 0.1;
    }
    if (root.current && !s.paused)
      root.current.rotation.y = -0.13 + (reduced ? 0 : pointer.x * 0.045);
  });
  return (
    <group ref={root} rotation={[0.1, -0.13, -0.035]}>
      <FineLines segments={structure} opacity={0.18} />
      <instancedMesh
        ref={chunks}
        name="review-chunks"
        args={[geometry, undefined, count]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial
          color="#94a6bb"
          metalness={0.68}
          roughness={0.18}
          clearcoat={1}
          transparent
          opacity={0.8}
        />
      </instancedMesh>
      <group position={[-1.55, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0.25, 0]}>
          <torusGeometry args={[1.8, 0.014, 6, 90, Math.PI * 1.7]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
        <mesh rotation={[0.2, -0.3, 0.4]}>
          <torusGeometry args={[1.9, 0.008, 6, 90, Math.PI * 1.3]} />
          <meshBasicMaterial color="#aebfd2" />
        </mesh>
      </group>
      <FineLines segments={threads} opacity={0.85} />
      <mesh position={[-3.5, 1.4, 1.4]} rotation={[0, 0.35, 0]}>
        <torusGeometry args={[0.12, 0.018, 6, 24]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      {curves.map((c, i) => (
        <mesh
          key={i}
          ref={(m) => {
            dots.current[i] = m;
          }}
          position={c.getPoint(0.4)}
        >
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#f1f7ff" />
        </mesh>
      ))}
      <group position={[2.55, -0.15, 0]} rotation={[0, -0.22, -0.1]}>
        {[-0.16, 0, 0.16].map((z, i) => (
          <mesh
            key={z}
            position={[i * 0.12, -i * 0.08, z]}
            rotation={[0, i * 0.045, 0]}
          >
            <Chamfer args={[1.72, 2.54, 0.055]} />
            {i === 2 ? (
              <OpticalGlass opacity={0.4} />
            ) : (
              <meshStandardMaterial {...DARK} roughness={0.23} />
            )}
          </mesh>
        ))}
        <mesh geometry={reportInk}>
          <meshBasicMaterial color="#b8cbdf" />
        </mesh>
        <SceneLabel active={active} position={[0, -1.7, 0.2]}>
          {sceneCopy.review.report}
        </SceneLabel>
      </group>
      <group
        ref={floating}
        position={[1.8, 2.4, -0.1]}
        rotation={[0, 0.2, 0.12]}
      >
        <mesh>
          <octahedronGeometry args={[0.16, 0]} />
          <OpticalGlass opacity={0.75} />
        </mesh>
        <SceneLabel active={active} position={[0, 0.55, 0]}>
          {sceneCopy.review.unsupported}
        </SceneLabel>
      </group>
      <SceneLabel active={active} position={[-1.6, 2.15, 0.4]}>
        {retrievalFiles[index].name}
      </SceneLabel>
      <SceneLabel active={active} position={[-1.5, -1.8, 0.6]}>
        {sceneCopy.review.repository}
      </SceneLabel>
    </group>
  );
}
