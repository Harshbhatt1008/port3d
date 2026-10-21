import { InstrumentDetails, Chamfer } from "./instrumentGeometry";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Mesh, MeshStandardMaterial, Object3D } from "three";
import { CHROME, DARK, useExperience, type SceneProps } from "../state";
import { Rod } from "./researchGeometry";
import { chamferedGeometry } from "./instrumentGeometry";
import { SceneLabel } from "./SceneLabel";
const examples = [
  "That explanation helped.",
  "Follow me for free offers!",
  "How did you label the prompts?",
];
export default function InstaGuard({ active, reduced, mobile }: SceneProps) {
  const selected = useExperience((s) => s.guardSample),
    cards = useRef<InstancedMesh>(null),
    shared = useRef<Mesh>(null),
    time = useRef(0),
    dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => chamferedGeometry(0.65, 0.32, 0.055), []),
    material = useMemo(
      () => new MeshStandardMaterial({ ...CHROME, roughness: 0.4 }),
      [],
    );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  const place = (moving: boolean) => {
    for (let i = 0; i < 12; i++) {
      const p = moving ? (time.current * 0.12 + i / 12) % 1 : i / 12;
      const x = -3.55 + p * 7.1;
      const reject = (i + selected) % 3 === 1;
      dummy.position.set(
        x,
        p > 0.52 ? (reject ? -1.1 : 0.45) * (p - 0.52) * 2.1 : 0.12,
        Math.sin(i * 2.1) * 0.18,
      );
      dummy.rotation.set(0, 0.12, Math.sin(i) * 0.035);
      dummy.updateMatrix();
      cards.current?.setMatrixAt(i, dummy.matrix);
    }
    if (cards.current) cards.current.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => {
    place(false);
  }, [selected]);
  useFrame((_, delta) => {
    if (!active || reduced || useExperience.getState().paused) return;
    time.current += Math.min(delta, 0.05);
    place(true);
    if (shared.current)
      shared.current.rotation.y = Math.sin(time.current * 0.35) * 0.15;
  });
  return (
    <group>
      <InstrumentDetails index={3} />
      <mesh position={[0, -1.8, 0]}>
        <Chamfer args={[7.8, 0.13, 1.6]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh ref={shared} position={[0, 1.45, 0]}>
        <Chamfer args={[1.15, 0.72, 0.39]} />
        <meshStandardMaterial {...CHROME} roughness={0.21} />
      </mesh>
      {[-1.1, 0, 1.1].map((x, i) => (
        <group key={x} position={[x, 0.05, 0]}>
          <Rod from={[0, 0.43, 0]} to={[-x, 1.05, 0]} radius={0.018} />
          <mesh>
            <torusGeometry args={[0.65, 0.025, 6, 40]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
          {Array.from({ length: 7 }, (_, j) => (
            <Rod
              key={j}
              from={[-0.48 + j * 0.16, -0.49, 0]}
              to={[-0.48 + j * 0.16, 0.49, 0]}
              radius={0.014}
              color="#68675d"
            />
          ))}
          <SceneLabel active={active} position={[0, -0.95, 0.15]}>
            {mobile ? `L${i + 1}` : `Layer ${i + 1}`}
          </SceneLabel>
        </group>
      ))}
      <instancedMesh
        ref={cards}
        geometry={geometry}
        material={material}
        args={[geometry, material, 12]}
        frustumCulled={false}
      />
      <Rod from={[-3.6, -1.1, 0.1]} to={[-3.6, -1.72, 0.1]} radius={0.03} />
      <Rod from={[3.4, -1.1, 0.1]} to={[3.4, -1.72, 0.1]} radius={0.03} />
      <SceneLabel active={active} position={[0, 2.15, 0]}>
        ALBERT<small>one shared parameter block</small>
      </SceneLabel>
      <SceneLabel
        active={active}
        position={[mobile ? -3.2 : -2.8, mobile ? 1.7 : 0.95, 0.4]}
        className="comment-label"
      >
        {examples[selected]}
      </SceneLabel>
      <SceneLabel active={active} position={[mobile ? 2.5 : 3.05, 1.2, 0.1]}>
        {mobile ? "Pass" : "Useful conversation"}
      </SceneLabel>
      <SceneLabel active={active} position={[mobile ? 2.5 : 3, -1.33, 0.1]}>
        {mobile ? "Deflect" : "Unwanted comments"}
      </SceneLabel>
      <mesh
        position={[selected === 1 ? 3 : 2.8, selected === 1 ? -1.05 : 0.9, 0.3]}
      >
        <Chamfer args={[1.1, 0.4, 0.07]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
    </group>
  );
}
