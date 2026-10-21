import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Group, MathUtils, MeshPhysicalMaterial, RectAreaLight } from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { probe, useExperience, type SceneProps } from "../state";

/** Decorative duplicate; the accessible name and all copy are real DOM in App. */
export function Hero({ active, mobile, reduced }: SceneProps) {
  const font = useLoader(FontLoader, "/fonts/archivo-black.typeface.json");
  const group = useRef<Group>(null);
  const sweep = useRef<RectAreaLight>(null);
  const elapsed = useRef(0);
  const name = useMemo(
    () =>
      ["HARSH", "BHATT"].map((word) => {
        const geometry = new TextGeometry(word, {
          font,
          size: 1.22,
          depth: 0.27,
          curveSegments: 10,
          bevelEnabled: true,
          bevelSize: 0.022,
          bevelThickness: 0.025,
          bevelSegments: 3,
        });
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        geometry.translate(-(box.max.x + box.min.x) / 2, 0, -0.135);
        return geometry;
      }),
    [font],
  );
  const chrome = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: "#c5c2b8",
        metalness: 1,
        roughness: 0.22,
        clearcoat: 0.65,
        clearcoatRoughness: 0.2,
      }),
    [],
  );
  useEffect(
    () => () => {
      name.forEach((geometry) => geometry.dispose());
      chrome.dispose();
    },
    [name, chrome],
  );
  useFrame(({ pointer }, delta) => {
    if (!active || !group.current) return;
    const { paused } = useExperience.getState();
    if (paused || document.hidden || reduced) return;
    const dt = Math.min(delta, 0.08);
    elapsed.current += dt;
    // Bounded hand-driven lean; the pause control freezes both tilt and light.
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      pointer.x * 0.08,
      5,
      dt,
    );
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      -pointer.y * 0.045,
      5,
      dt,
    );
    if (sweep.current)
      sweep.current.position.x = 3 + Math.sin(elapsed.current * 0.3) * 3.3;
  });
  return (
    <group>
      <group
        ref={group}
        position={mobile ? [0, 0.65, 0] : [2.3, 0.45, 0]}
        scale={mobile ? 0.63 : 1}
        {...probe("Chrome type · move your pointer to turn the light")}
      >
        <mesh geometry={name[0]} material={chrome} position={[0, 0.25, 0]} />
        <mesh geometry={name[1]} material={chrome} position={[0, -1.12, 0]} />
      </group>
      <rectAreaLight
        ref={sweep}
        position={[3, 2.7, 4]}
        rotation={[-0.35, 0, 0]}
        width={5}
        height={1.4}
        intensity={8}
        color="#eeeae0"
      />
      <rectAreaLight
        position={[-2, -1, 2]}
        rotation={[0, -0.7, 0]}
        width={1.2}
        height={4}
        intensity={5}
        color="#c4c1b8"
      />
    </group>
  );
}
