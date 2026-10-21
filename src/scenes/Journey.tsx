import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshPhysicalMaterial, Vector3 } from "three";
import { CHROME, useExperience, type SceneProps } from "../state";
import { sceneCopy } from "../content";
import { archiveLeaf, ARCHIVE_ANCHORS } from "./archiveGeometry";
import { SceneLabel } from "./SceneLabel";

/** An eight-leaf kinetic archive; a selected memory opens toward the visitor. */
export default function Journey({ active, reduced, mobile }: SceneProps) {
  const selected = useExperience((s) => s.nodeIndex);
  const root = useRef<Group>(null),
    leaves = useRef<(Group | null)[]>([]),
    cores = useRef<(Mesh | null)[]>([]),
    clock = useRef(0);
  const shape = useMemo(archiveLeaf, []);
  const destination = useMemo(() => new Vector3(), []);
  useEffect(
    () => () => {
      shape.body.dispose();
      shape.edge.dispose();
    },
    [shape],
  );
  useFrame(({ pointer }, delta) => {
    if (!active) return;
    const s = useExperience.getState();
    if (s.paused) return;
    if (!reduced) clock.current += Math.min(delta, 0.05);
    const blend = reduced ? 1 : 1 - Math.exp(-delta * 4);
    leaves.current.forEach((leaf, i) => {
      if (!leaf) return;
      const t = i / 7,
        focus = i === selected;
      destination.copy(ARCHIVE_ANCHORS[i]);
      destination.z += focus ? 0.6 : 0;
      destination.y += focus ? 0.18 : 0;
      if (!reduced)
        destination.y += Math.sin(clock.current * 0.5 + i * 0.7) * 0.035;
      leaf.position.lerp(destination, blend);
      leaf.rotation.y +=
        ((t - 0.5) * 1.25 + (focus ? -0.16 : 0) - leaf.rotation.y) * blend;
      leaf.rotation.z += ((t - 0.5) * -0.38 - leaf.rotation.z) * blend;
      const glass = leaf.children.find(
        (c) => c.name === "archive-shell",
      ) as Mesh;
      const material = glass?.material as MeshPhysicalMaterial;
      if (material)
        material.opacity += ((focus ? 0.68 : 0.32) - material.opacity) * blend;
      if (cores.current[i])
        cores.current[i]!.rotation.y = reduced
          ? i * 0.3
          : clock.current * 0.25 + i * 0.3;
    });
    if (root.current)
      root.current.rotation.y = -0.24 + (reduced ? 0 : pointer.x * 0.06);
  });
  return (
    <group
      ref={root}
      name="memory-archive"
      position={[0.15, 0, 0]}
      rotation={[0.08, -0.24, -0.1]}
    >
      {ARCHIVE_ANCHORS.map((p, i) => (
        <group
          key={i}
          ref={(g) => {
            leaves.current[i] = g;
          }}
          name={`memory-leaf-${i}`}
          position={p}
          rotation={[0, (i / 7 - 0.5) * 1.25, (i / 7 - 0.5) * -0.38]}
        >
          <mesh name="archive-shell" geometry={shape.body}>
            <meshPhysicalMaterial
              color="#bbcadb"
              metalness={0.4}
              roughness={0.1}
              clearcoat={1}
              envMapIntensity={2.2}
              transparent
              opacity={0.32}
              depthWrite={false}
            />
          </mesh>
          <lineSegments geometry={shape.edge}>
            <lineBasicMaterial
              color="#d0deef"
              transparent
              opacity={i === selected ? 0.8 : 0.42}
            />
          </lineSegments>
          <mesh
            ref={(m) => {
              cores.current[i] = m;
            }}
            position={[0, 0.27, 0.08]}
            rotation={[0.2, i * 0.3, 0.1]}
            scale={[0.16, 0.35, 0.1]}
          >
            <octahedronGeometry args={[1, 1]} />
            <meshStandardMaterial {...CHROME} roughness={0.16} />
          </mesh>
          <mesh position={[0, -1.26, 0.2]} rotation={[0, 0, Math.PI / 4]}>
            <octahedronGeometry args={[0.075, 0]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
          {!mobile && (
            <SceneLabel
              active={active}
              position={[0, 1.79, 0.2]}
              className="no-surface"
            >
              {String(i + 1).padStart(2, "0")}
            </SceneLabel>
          )}
        </group>
      ))}
      {!mobile && (
        <SceneLabel active={active} position={[0, -2.15, 0.6]}>
          {sceneCopy.journey.archive}
        </SceneLabel>
      )}
    </group>
  );
}
