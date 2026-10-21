import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  Object3D,
  Path,
  Shape,
} from "three";
import { CHROME, useExperience, type SceneProps } from "../state";
import { chamferedGeometry, Chamfer } from "./instrumentGeometry";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { OpticalGlass, FineLines, dialSegments } from "./optics";
import { SceneLabel } from "./SceneLabel";
import { sceneCopy } from "../content";

function sieveGeometry() {
  const plate = new Shape();
  plate.absarc(0, 0, 1.67, 0, Math.PI * 2, false);
  for (let y = -4; y <= 4; y++)
    for (let x = -4; x <= 4; x++) {
      const px = x * 0.37 + (Math.abs(y) % 2) * 0.185,
        py = y * 0.32;
      if (Math.hypot(px, py) > 1.42) continue;
      const hole = new Path();
      hole.absarc(px, py, 0.126, 0, Math.PI * 2, true);
      plate.holes.push(hole);
    }
  const g = new ExtrudeGeometry(plate, {
    depth: 0.035,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    curveSegments: 8,
  });
  g.translate(0, 0, -0.0175);
  return g;
}
function commentGeometry() {
  const s = new Shape();
  s.moveTo(-0.21, -0.1);
  s.lineTo(-0.21, 0.1);
  s.quadraticCurveTo(-0.21, 0.14, -0.17, 0.14);
  s.lineTo(0.17, 0.14);
  s.quadraticCurveTo(0.21, 0.14, 0.21, 0.1);
  s.lineTo(0.21, -0.07);
  s.quadraticCurveTo(0.21, -0.1, 0.17, -0.1);
  s.lineTo(-0.06, -0.1);
  s.lineTo(-0.14, -0.17);
  s.lineTo(-0.14, -0.1);
  s.closePath();
  return new ExtrudeGeometry(s, {
    depth: 0.035,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    curveSegments: 4,
    steps: 1,
  });
}
export default function InstaGuard({ active, reduced, mobile }: SceneProps) {
  const selected = useExperience((s) => s.guardSample);
  const root = useRef<Group>(null),
    rotor = useRef<Group>(null);
  const cards = useRef<InstancedMesh>(null),
    ink = useRef<InstancedMesh>(null),
    time = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const plate = useMemo(sieveGeometry, []);
  const card = useMemo(commentGeometry, []);
  const print = useMemo(() => {
    const lines = [
      chamferedGeometry(0.26, 0.018, 0.012, false),
      chamferedGeometry(0.18, 0.018, 0.012, false),
    ];
    lines[0].translate(0, 0.055, 0.057);
    lines[1].translate(-0.04, -0.015, 0.057);
    const merged = mergeGeometries(lines);
    lines.forEach((g) => g.dispose());
    return merged;
  }, []);
  const ticks = useMemo(() => dialSegments(1.86, mobile ? 36 : 72), [mobile]);
  const count = mobile ? 12 : navigator.hardwareConcurrency <= 4 ? 16 : 28;
  useEffect(
    () => () => {
      plate.dispose();
      card.dispose();
      print.dispose();
    },
    [plate, card, print],
  );
  const place = (t: number) => {
    for (let i = 0; i < count; i++) {
      const p = (i / count + t * 0.075) % 1,
        a = ((i % 6) * Math.PI) / 3;
      const deflect =
        (i + selected) % 3 === 1 ? Math.max(0, (p - 0.48) / 0.52) : 0;
      const r = 0.38 + (i % 5) * 0.14 + deflect * 2.1;
      dummy.position.set(
        Math.cos(a) * r,
        Math.sin(a) * r - deflect * 0.7,
        3.4 - p * 6.8 + deflect * 2.7,
      );
      dummy.rotation.set(
        deflect * 1.6,
        Math.sin(a) * 0.15 + deflect * 0.7,
        Math.sin(a) * 0.07,
      );
      dummy.scale.setScalar(i === selected ? 1.2 : 0.8);
      dummy.updateMatrix();
      cards.current?.setMatrixAt(i, dummy.matrix);
      ink.current?.setMatrixAt(i, dummy.matrix);
    }
    if (cards.current) cards.current.instanceMatrix.needsUpdate = true;
    if (ink.current) ink.current.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => {
    place(reduced ? 2 : time.current);
  }, [selected, count, reduced]);
  useFrame(({ pointer }, delta) => {
    if (!active) return;
    const s = useExperience.getState();
    if (!reduced && !s.paused) {
      time.current += Math.min(delta, 0.05);
      place(time.current);
    }
    if (root.current) {
      if (!s.paused)
        root.current.rotation.y = -0.52 + (reduced ? 0 : pointer.x * 0.06);
      root.current.position.z = -Math.abs(s.progress - 3) * 1.6;
    }
    if (rotor.current)
      rotor.current.rotation.z = reduced ? 0.15 : time.current * 0.055;
  });
  return (
    <group ref={root} rotation={[0.12, -0.52, -0.13]}>
      {[-0.8, 0, 0.8].map((z, i) => (
        <group key={z} position={[0, 0, z]}>
          <mesh geometry={plate}>
            <OpticalGlass opacity={0.22} />
          </mesh>
          <mesh>
            <torusGeometry args={[1.73, 0.035, 8, 80]} />
            <meshStandardMaterial {...CHROME} roughness={0.18} />
          </mesh>
          <mesh>
            <torusGeometry args={[1.82, 0.009, 6, 80]} />
            <meshBasicMaterial color="#aebdce" />
          </mesh>
          {i === 1 && <FineLines segments={ticks} opacity={0.7} />}
        </group>
      ))}
      <group ref={rotor} rotation={[0, 0, 0.15]}>
        <mesh rotation={[0.1, 0.3, 0]}>
          <torusGeometry args={[2.07, 0.022, 8, 100, Math.PI * 1.65]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
        <mesh position={[2.01, -0.15, 0]} rotation={[0, 0, -0.1]}>
          <Chamfer args={[0.22, 0.5, 0.28]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      </group>
      <group position={[0, 2.17, 0]}>
        <mesh>
          <Chamfer args={[0.67, 0.29, 0.36]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
        <mesh position={[0, 0, 0.195]}>
          <Chamfer args={[0.46, 0.03, 0.015]} />
          <meshBasicMaterial color="#e4edf8" />
        </mesh>
        <SceneLabel active={active} position={[0, 0.4, 0]}>
          {sceneCopy.guard.core}
        </SceneLabel>
      </group>
      <instancedMesh
        ref={cards}
        name="guard-comments"
        args={[card, undefined, count]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial
          color="#d7e1ee"
          metalness={0.55}
          roughness={0.22}
          clearcoat={1}
        />
      </instancedMesh>
      <instancedMesh
        ref={ink}
        args={[print, undefined, count]}
        frustumCulled={false}
      >
        <meshBasicMaterial color="#172335" />
      </instancedMesh>
      <SceneLabel
        active={active}
        position={mobile ? [-1.65, 0.8, 1.4] : [-2.45, 0.6, 2.4]}
      >
        {sceneCopy.guard.incoming}
      </SceneLabel>
      <SceneLabel active={active} position={[0.3, -0.5, -3.3]}>
        {sceneCopy.guard.pass}
      </SceneLabel>
      <SceneLabel active={active} position={[2.5, -1.8, 0]}>
        {sceneCopy.guard.deflect}
      </SceneLabel>
    </group>
  );
}
