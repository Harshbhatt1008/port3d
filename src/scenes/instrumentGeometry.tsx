import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  CylinderGeometry,
  InstancedMesh,
  LatheGeometry,
  Object3D,
  Quaternion,
  TorusGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { CHROME, DARK, useExperience } from "../state";
import { DETAIL_CAPS, STRUCTURE_GAUGE } from "../sceneSettings";
import { JOURNEY_ANCHORS } from "./journeyGeometry";

export function chamferedGeometry(
  w: number,
  h: number,
  d: number,
  thin = true,
) {
  if (thin) {
    if (h > Math.max(w, d) * 2) {
      w *= STRUCTURE_GAUGE;
      d *= STRUCTURE_GAUGE;
    } else if (Math.min(w, h, d) / Math.max(w, h, d) < 0.3) {
      if (h <= w && h <= d) h *= STRUCTURE_GAUGE;
      else if (d <= w) d *= STRUCTURE_GAUGE;
      else w *= STRUCTURE_GAUGE;
    }
  }
  return new RoundedBoxGeometry(
    w,
    h,
    d,
    2,
    Math.min(0.04, Math.min(w, h, d) * 0.18),
  );
}
/** Geometry-only components preserve the original mesh/ref/material contracts. */
export function Chamfer({
  args,
  thin = true,
}: {
  args: [number, number, number];
  thin?: boolean;
}) {
  const [w, h, d] = args;
  const geometry = useMemo(
    () => chamferedGeometry(w, h, d, thin),
    [w, h, d, thin],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <primitive object={geometry} attach="geometry" />;
}
export function Turned({
  args,
  thin = true,
}: {
  args: [number, number, number, number?, number?, boolean?];
  thin?: boolean;
}) {
  const [rt, rb, length, segments = 20, , open = false] = args;
  const geometry = useMemo(() => {
    const gauge = thin ? STRUCTURE_GAUGE : 1;
    const top = rt * gauge,
      bottom = rb * gauge;
    const h = length < Math.max(rt, rb) * 0.4 ? length * gauge : length;
    const b = Math.min(h * 0.12, Math.max(top, bottom) * 0.16);
    const profile = [
      ...(open ? [] : [new Vector2(0, -h / 2)]),
      new Vector2(bottom * 0.86, -h / 2),
      new Vector2(bottom * 0.97, -h / 2 + b * 0.3),
      new Vector2(bottom, -h / 2 + b),
      new Vector2(bottom, -h / 2 + b * 2),
      new Vector2(top, h / 2 - b * 2),
      new Vector2(top, h / 2 - b),
      new Vector2(top * 0.97, h / 2 - b * 0.3),
      new Vector2(top * 0.86, h / 2),
      ...(open ? [] : [new Vector2(0, h / 2)]),
    ];
    return new LatheGeometry(profile, Math.max(8, Math.min(24, segments)));
  }, [rt, rb, length, segments, open, thin]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <primitive object={geometry} attach="geometry" />;
}
type P = [number, number, number];
type Detail = { wire: BufferGeometry[]; core: BufferGeometry[]; pins: P[] };
function wire(d: Detail, from: P, to: P, r = 0.006) {
  const a = new Vector3(...from),
    b = new Vector3(...to),
    v = b.clone().sub(a);
  const g = new CylinderGeometry(r, r, v.length(), 5);
  g.applyQuaternion(
    new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), v.normalize()),
  );
  g.translate(...(a.add(b).multiplyScalar(0.5).toArray() as P));
  d.wire.push(g);
}
function ring(d: Detail, center: P, r: number, horizontal = false) {
  const g = new TorusGeometry(r, 0.006, 3, 32);
  if (horizontal) g.rotateX(Math.PI / 2);
  g.translate(...center);
  d.wire.push(g);
}
function seam(d: Detail, c: P, w: number, h: number) {
  const [x, y, z] = c;
  const corners: P[] = [
    [x - w / 2, y - h / 2, z],
    [x + w / 2, y - h / 2, z],
    [x + w / 2, y + h / 2, z],
    [x - w / 2, y + h / 2, z],
  ];
  corners.forEach((p, i) => {
    wire(d, p, corners[(i + 1) % 4], 0.004);
    d.pins.push(p);
  });
}
function core(d: Detail, p: P, w: number, h: number, depth: number) {
  const g = chamferedGeometry(w, h, depth, false);
  g.translate(...p);
  d.core.push(g);
}
function detailData(index: number, cap: number) {
  const d: Detail = { wire: [], core: [], pins: [] };
  if (index === 1) {
    seam(d, [-4.12, 0.1, -0.38], 0.52, 2.6);
    seam(d, [4.15, 0.1, 0.24], 0.55, 2.52);
    for (const x of [-4.12, 4.15])
      for (let i = 0; i < 9; i++) {
        wire(
          d,
          [x - 0.18, -0.95 + i * 0.25, x < 0 ? -0.365 : 0.25],
          [x + 0.18, -0.95 + i * 0.25, x < 0 ? -0.365 : 0.25],
          0.003,
        );
      }
    for (const y of [-1.58, -1.37, -1.15])
      ring(d, [-1.62, y, 0], y < -1.4 ? 0.38 : 0.33, true);
    for (const x of [-3.55, -2.95, -2.35]) {
      seam(d, [x, 0.62, 0.53], 0.32, 0.16);
      wire(d, [x, 0.46, 0.5], [x, 0.27, 0.24]);
    }
    core(d, [4.15, 0.1, 0.235], 0.25, 2.15, 0.012);
  } else if (index === 2) {
    for (const side of [-1, 1]) {
      const x = side * 2.08;
      seam(d, [x, 0, -0.15], 0.43, 3.4);
      core(d, [x, 0, -0.13], 0.08, 3.32, 0.035);
      for (let n = 0; n < 7; n++) {
        const y = -1.45 + n * 0.46;
        wire(d, [x - side * 0.28, y, 0.03], [side * 1.68, y, 0.03], 0.004);
        d.pins.push([x - side * 0.29, y, 0.04], [x + side * 0.29, y, 0.04]);
      }
    }
    seam(d, [2.25, -2.48, 0.36], 0.95, 0.2);
    ring(d, [0, 0, 0.49], 0.19);
  } else if (index === 3) {
    for (const x of [-1.1, 0, 1.1]) {
      ring(d, [x, 0.05, 0.045], 0.61);
      ring(d, [x, 0.05, -0.04], 0.66);
      for (let n = 0; n < 6; n++) {
        const y = -0.35 + n * 0.16;
        wire(d, [x - 0.49, y, -0.03], [x + 0.49, y, -0.03], 0.003);
      }
      for (let n = 0; n < 12; n++) {
        const a = (n / 12) * Math.PI * 2;
        d.pins.push([x + Math.cos(a) * 0.65, 0.05 + Math.sin(a) * 0.65, 0.05]);
      }
    }
    seam(d, [0, 1.45, 0.205], 0.99, 0.56);
    core(d, [0, 1.45, 0.202], 0.68, 0.055, 0.012);
    for (const x of [-0.32, 0, 0.32])
      wire(d, [x, 1.2, 0.21], [x, 1.7, 0.21], 0.003);
  } else if (index === 4) {
    for (const [x, y, z] of [
      [-2.7, 1.1, -0.4],
      [-1.7, -0.5, 0.5],
      [-0.6, 1.2, 0.3],
      [-0.1, -0.9, -0.3],
    ]) {
      seam(d, [x, y, z + 0.035], 0.42, 0.59);
      core(d, [x, y, z + 0.02], 0.32, 0.025, 0.01);
      for (let n = 0; n < 8; n++) {
        const a = (n / 8) * Math.PI * 2;
        d.pins.push([x + Math.cos(a) * 0.4, y + Math.sin(a) * 0.5, z - 0.04]);
      }
    }
    seam(d, [2.8, -0.2, 0.235], 1.54, 2.31);
    wire(d, [2.08, -1.26, 0.25], [3.52, -1.26, 0.25], 0.004);
    seam(d, [2.8, 1.8, 0.05], 1.26, 0.33);
  } else if (index === 5) {
    // Stationary room details; rover-local fittings live in RoverDetails.
    seam(d, [-0.72, -0.25, -1.77], 0.68, 0.32);
    for (const x of [-1.5, 0, 1.5]) {
      seam(d, [x, 3.2, -0.14], 0.44, 0.14);
      core(d, [x, 3.2, -0.15], 0.2, 0.035, 0.025);
    }
    for (let n = 0; n < 16; n++)
      d.pins.push(
        [-3.18 + n * 0.42, -1.59, 2.52],
        [-3.18 + n * 0.42, -1.59, -2.5],
      );
    for (const z of [-1.59, -0.86, -0.13])
      wire(d, [-3.1, -0.35, z], [-2.67, -0.35, z], 0.004);
  } else if (index === 6) {
    for (const { x, y, z } of JOURNEY_ANCHORS) {
      ring(d, [x, y + 0.015, z], 0.205, true);
      ring(d, [x, -2.03, z], 0.17, true);
      d.pins.push([x, y + 0.03, z]);
    }
    wire(d, [-3.35, -2.02, 0.43], [3.35, -2.02, 0.43], 0.003);
  }
  // One merged mesh for seams/bands, one for inner cores, one for connectors.
  // Geometry is built only on mount/tier change; never during animation.
  const wireGeometry = d.wire.length ? mergeGeometries(d.wire) : null;
  const coreGeometry = d.core.length ? mergeGeometries(d.core) : null;
  d.wire.forEach((g) => g.dispose());
  d.core.forEach((g) => g.dispose());
  return { wireGeometry, coreGeometry, pinPositions: d.pins.slice(0, cap) };
}
export function InstrumentDetails({ index }: { index: number }) {
  const tier = useExperience((s) =>
    s.hazeDisabled ? "low" : s.mobile ? "mobile" : "high",
  );
  const parts = useMemo(
    () => detailData(index, DETAIL_CAPS[tier]),
    [index, tier],
  );
  const pins = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const instance = pins.current;
    if (!instance) return;
    const transform = new Object3D();
    parts.pinPositions.forEach((p, i) => {
      transform.position.set(...p);
      transform.updateMatrix();
      instance.setMatrixAt(i, transform.matrix);
    });
    instance.instanceMatrix.needsUpdate = true;
    instance.computeBoundingSphere();
  }, [parts]);
  useEffect(
    () => () => {
      parts.wireGeometry?.dispose();
      parts.coreGeometry?.dispose();
    },
    [parts],
  );
  return (
    <group name="instrument-details">
      {parts.wireGeometry && (
        <mesh geometry={parts.wireGeometry}>
          <meshStandardMaterial {...CHROME} roughness={0.3} />
        </mesh>
      )}
      {parts.coreGeometry && (
        <mesh geometry={parts.coreGeometry}>
          <meshStandardMaterial {...DARK} color="#4c4e44" roughness={0.38} />
        </mesh>
      )}
      {parts.pinPositions.length > 0 && (
        <instancedMesh
          key={tier}
          ref={pins}
          args={[undefined, undefined, parts.pinPositions.length]}
        >
          <Chamfer args={[0.028, 0.028, 0.024]} thin={false} />
          <meshStandardMaterial {...CHROME} roughness={0.4} />
        </instancedMesh>
      )}
    </group>
  );
}
export function RoverDetails() {
  const geometry = useMemo(() => {
    const d: Detail = { wire: [], core: [], pins: [] };
    seam(d, [0, 0.22, -0.301], 0.34, 0.12);
    seam(d, [0, 0.4, 0.13], 0.24, 0.045);
    for (const x of [-0.17, 0.17]) {
      wire(d, [x, 0.29, -0.18], [x, 0.29, 0.18], 0.004);
      ring(d, [x, 0.29, -0.19], 0.025);
    }
    for (const x of [-0.27, 0.27])
      for (const z of [-0.19, 0.19]) {
        const g = new TorusGeometry(0.083, 0.005, 3, 20);
        g.rotateY(Math.PI / 2);
        g.translate(x, 0.14, z);
        d.wire.push(g);
      }
    const g = mergeGeometries(d.wire)!;
    d.wire.forEach((p) => p.dispose());
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial {...CHROME} roughness={0.32} />
    </mesh>
  );
}
