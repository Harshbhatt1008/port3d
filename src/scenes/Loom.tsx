import { InstrumentDetails, Chamfer, Turned } from "./instrumentGeometry";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  TubeGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { CHROME, DARK, probe, useExperience } from "../state";
import type { SceneProps } from "../state";
import { Rod } from "./researchGeometry";
import { histories as purchaseHistories } from "../content";
import { SceneLabel } from "./SceneLabel";

function makeHistory(history: number, count: number) {
  const curves = Array.from({ length: count }, (_, i) => {
    const row = i % 7;
    const layer = Math.floor(i / 7);
    const y0 = -1.45 + row * 0.46;
    const permutation =
      history === 0
        ? (row * 2 + layer) % 7
        : history === 1
          ? (row * 3 + 2 + layer) % 7
          : (6 - row + layer) % 7;
    const y1 = -1.45 + permutation * 0.46;
    const z = (layer - 1) * 0.16;
    const pinch = history === 0 ? 0.42 : history === 1 ? -0.28 : 0.06;
    return new CatmullRomCurve3(
      [
        new Vector3(-1.68, y0, z),
        new Vector3(-1.07, y0 * 0.88, z + 0.08),
        new Vector3(-0.35, y0 * 0.42 + y1 * 0.2 + pinch, 0.28 + layer * 0.09),
        new Vector3(0.4, y0 * 0.2 + y1 * 0.44 - pinch, -0.2 - layer * 0.07),
        new Vector3(1.08, y1 * 0.88, z),
        new Vector3(1.68, y1, z),
      ],
      false,
      "centripetal",
    );
  });
  const pieces = curves.map(
    (curve, index) =>
      new TubeGeometry(curve, 40, index % 3 === 0 ? 0.013 : 0.008, 5, false),
  );
  const geometry = mergeGeometries(pieces);
  pieces.forEach((piece) => piece.dispose());
  return { curves, geometry };
}

function Tower({ side }: { side: -1 | 1 }) {
  const axles = useRef<InstancedMesh>(null);
  const caps = useRef<InstancedMesh>(null);
  const barrels = useRef<InstancedMesh>(null);
  const rings = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const transform = new Object3D();
    for (let row = 0; row < 7; row++) {
      const y = -1.45 + row * 0.46;
      transform.rotation.set(0, 0, Math.PI / 2);
      transform.position.set(0, y, 0);
      transform.updateMatrix();
      axles.current?.setMatrixAt(row, transform.matrix);
      barrels.current?.setMatrixAt(row, transform.matrix);
      for (let cap = 0; cap < 2; cap++) {
        transform.position.set(cap ? 0.31 : -0.31, y, 0);
        transform.updateMatrix();
        caps.current?.setMatrixAt(row * 2 + cap, transform.matrix);
      }
      transform.rotation.set(0, Math.PI / 2, 0);
      for (let ring = 0; ring < 7; ring++) {
        transform.position.set(-0.21 + ring * 0.07, y, 0);
        transform.updateMatrix();
        rings.current?.setMatrixAt(row * 7 + ring, transform.matrix);
      }
    }
    [axles, caps, barrels, rings].forEach((ref) => {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    });
  }, []);
  return (
    <group
      position={[side * 2.08, 0, 0]}
      scale={[0.65, 1, 0.65]}
      {...probe(
        side < 0
          ? "User history · thread spindles"
          : "Item relationships · receiving tower",
      )}
    >
      {[-0.44, 0.44].map((x) => (
        <mesh key={x} position={[x, 0, -0.08]}>
          <Chamfer thin={false} args={[0.065, 3.92, 0.22]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      ))}
      {[-1.93, 1.93].map((y) => (
        <mesh key={y} position={[0, y, -0.08]}>
          <Chamfer thin={false} args={[0.94, 0.08, 0.3]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.23]}>
        <Chamfer thin={false} args={[0.8, 3.78, 0.055]} />
        <meshStandardMaterial {...DARK} roughness={0.4} />
      </mesh>
      <instancedMesh ref={axles} args={[undefined, undefined, 7]}>
        <Turned thin={false} args={[0.11, 0.11, 0.82, 20]} />
        <meshStandardMaterial {...CHROME} roughness={0.24} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, 14]}>
        <Turned thin={false} args={[0.18, 0.18, 0.045, 24]} />
        <meshStandardMaterial {...CHROME} />
      </instancedMesh>
      <instancedMesh ref={barrels} args={[undefined, undefined, 7]}>
        <Turned thin={false} args={[0.137, 0.137, 0.53, 24]} />
        <meshStandardMaterial
          color={side < 0 ? "#73746a" : "#a5a397"}
          metalness={0.6}
          roughness={0.62}
        />
      </instancedMesh>
      <instancedMesh ref={rings} args={[undefined, undefined, 49]}>
        <torusGeometry args={[0.14, 0.007, 3, 16]} />
        <meshStandardMaterial
          color="#cecbbd"
          metalness={0.55}
          roughness={0.45}
        />
      </instancedMesh>
      <mesh position={[0, -2.08, 0]}>
        <Chamfer thin={false} args={[1.18, 0.15, 0.9]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
    </group>
  );
}

export default function Loom({ active, mobile, reduced }: SceneProps) {
  const history = useExperience((state) => state.historyIndex);
  const histories = useMemo(
    () => [0, 1, 2].map((index) => makeHistory(index, mobile ? 14 : 21)),
    [mobile],
  );
  const selected = histories[history % 3];
  const shuttles = useRef<InstancedMesh>(null);
  const plateLight = useRef<MeshStandardMaterial>(null);
  const time = useRef(0);
  const settling = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const point = useMemo(() => new Vector3(), []);
  const tangent = useMemo(() => new Vector3(), []);
  const axis = useMemo(() => new Vector3(1, 0, 0), []);
  useEffect(
    () => () => histories.forEach((item) => item.geometry?.dispose()),
    [histories],
  );
  const placeShuttles = (moving: boolean) => {
    if (!shuttles.current) return;
    for (let i = 0; i < 5; i++) {
      const curve = selected.curves[(i * 3 + history) % selected.curves.length];
      const phase = moving
        ? (time.current * 0.11 + i * 0.19) % 1
        : 0.17 + i * 0.155;
      curve.getPoint(phase, point);
      curve.getTangent(phase, tangent);
      dummy.position.copy(point);
      dummy.quaternion.setFromUnitVectors(axis, tangent);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      shuttles.current.setMatrixAt(i, dummy.matrix);
    }
    shuttles.current.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => {
    settling.current = 0;
    placeShuttles(false);
    if (plateLight.current) plateLight.current.emissiveIntensity = 1.2;
  }, [history, selected]);
  useFrame((_, delta) => {
    const state = useExperience.getState();
    if (!active || reduced || state.paused || document.hidden) return;
    time.current += Math.min(delta, 0.05);
    settling.current = Math.min(1, settling.current + delta / 0.8);
    placeShuttles(true);
    if (plateLight.current)
      plateLight.current.emissiveIntensity = 0.3 + settling.current * 0.9;
  });
  return (
    <group position={[0, 0, 0]} rotation={[0.035, -0.14, 0]}>
      <InstrumentDetails index={2} />
      <Tower side={-1} />
      <Tower side={1} />
      <SceneLabel active={active} position={[-2.08, 2.35, 0]}>
        User tower<small>ordered purchases</small>
      </SceneLabel>
      <SceneLabel active={active} position={[2.08, 2.35, 0]}>
        Item tower
      </SceneLabel>
      {purchaseHistories[history].items.map((item, i) => (
        <SceneLabel
          key={i}
          active={active}
          position={[-2.8, 1.1 - i * 0.52, 0.3]}
          className="no-surface"
        >
          {String(i + 1).padStart(2, "0")} / {item}
        </SceneLabel>
      ))}
      <mesh position={[0, 0, 0.48]}>
        <sphereGeometry args={[0.13, 20, 16]} />
        <meshStandardMaterial
          {...CHROME}
          emissive="#bdb7a9"
          emissiveIntensity={0.3}
        />
      </mesh>
      <SceneLabel active={active} position={[0, 0.58, 0.65]}>
        u · v<small>dot-product match</small>
      </SceneLabel>
      <group position={[2.25, -2.48, 0.15]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.35, 0, 0]}>
            <Chamfer args={[0.27, 0.28, 0.38]} />
            <meshStandardMaterial {...CHROME} roughness={0.4} />
          </mesh>
        ))}
        <Rod
          from={[-0.65, -0.18, 0.22]}
          to={[0.65, -0.18, 0.22]}
          radius={0.025}
        />
        <SceneLabel active={active} position={[0, -0.5, 0.3]}>
          Redis<small>cached embeddings</small>
        </SceneLabel>
      </group>
      {/* The different histories change real curve endpoints and crossings. */}
      {selected.geometry && (
        <mesh
          geometry={selected.geometry}
          {...probe("Purchase history · woven relationships")}
        >
          <meshStandardMaterial
            color="#c2c0b1"
            metalness={0.7}
            roughness={0.34}
          />
        </mesh>
      )}
      <instancedMesh
        ref={shuttles}
        args={[undefined, undefined, 5]}
        frustumCulled={false}
      >
        <Chamfer args={[0.21, 0.065, 0.09]} />
        <meshStandardMaterial {...CHROME} roughness={0.14} />
      </instancedMesh>
      {[-0.43, 0.43].map((z) => (
        <Rod
          key={z}
          from={[-2.55, -2.11, z]}
          to={[2.55, -2.11, z]}
          radius={0.024}
          color="#6f7065"
        />
      ))}
      <group
        position={[0, -1.89, 0.52]}
        rotation={[-0.13, 0, 0]}
        {...probe("Illustrative recommendation · changes with history")}
      >
        <mesh>
          <Chamfer args={[1.44, 0.49, 0.08]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        <mesh position={[-0.54 + history * 0.54, 0, 0.048]}>
          <Chamfer args={[0.31, 0.32, 0.025]} />
          <meshStandardMaterial {...CHROME} roughness={0.26} />
        </mesh>
        {[0, 1, 2].map((index) => (
          <mesh key={index} position={[-0.54 + index * 0.54, -0.17, 0.05]}>
            <Chamfer args={[0.31, 0.018, 0.01]} />
            <meshStandardMaterial
              ref={index === history ? plateLight : undefined}
              color="#d9d6c8"
              emissive="#d9d6c8"
              emissiveIntensity={index === history ? 1.2 : 0}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
