import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Group, MathUtils, MeshPhysicalMaterial } from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { probe, useExperience, type SceneProps } from "../state";

/** Decorative duplicate; the accessible name and all copy are real DOM in App. */
export function Hero({ active, reduced }: SceneProps) {
  const font = useLoader(FontLoader, "/fonts/archivo-black.typeface.json");
  const group = useRef<Group>(null);
  const elapsed = useRef(0);
  const name = useMemo(
    () =>
      ["HARSH", "BHATT"].map((word) => {
        const geometry = new TextGeometry(word, {
          font,
          size: 1.22,
          depth: 0.1755,
          curveSegments: 10,
          bevelEnabled: true,
          bevelSize: 0.022,
          bevelThickness: 0.025,
          bevelSegments: 3,
        });
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        geometry.translate(-(box.max.x + box.min.x) / 2, 0, -0.08775);
        return geometry;
      }),
    [font],
  );
  const chrome = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: "#b9b9b3",
        metalness: 1,
        roughness: 0.22,
        envMapIntensity: 1.3,
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
  });
  return (
    <group>
      <group
        ref={group}
        position={[0, 0, 0]}
        {...probe("Chrome type · move your pointer to turn the light")}
      >
        <mesh geometry={name[0]} material={chrome} position={[0, 0.25, 0]} />
        <mesh geometry={name[1]} material={chrome} position={[0, -1.12, 0]} />
      </group>
    </group>
  );
}
