import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ExtrudeGeometry, Group, Shape } from "three";
import { CHROME, DARK, useExperience, type SceneProps } from "../state";
import { datasetSamples } from "../content";
import { Rod } from "./researchGeometry";
import { SceneLabel } from "./SceneLabel";
const risks = ["LOW", "MEDIUM", "HIGH"];
const spectrum = ["#81bd92", "#e1bd62", "#e68c76"];
export default function Prism({ active, reduced, mobile }: SceneProps) {
  const index = useExperience((s) => s.sampleIndex),
    selected = risks.indexOf(datasetSamples[index].risk),
    strong = selected > 0;
  const prism = useRef<Group>(null);
  const glass = useMemo(() => {
    const s = new Shape();
    s.moveTo(-0.86, -0.72);
    s.lineTo(0.86, -0.72);
    s.lineTo(0, 1.08);
    s.closePath();
    const g = new ExtrudeGeometry(s, {
      depth: 1.25,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      steps: 1,
    });
    g.translate(0, 0, -0.625);
    return g;
  }, []);
  useEffect(() => () => glass.dispose(), [glass]);
  useFrame(({ pointer }, delta) => {
    if (active && !reduced && !useExperience.getState().paused && prism.current)
      prism.current.rotation.y +=
        (-0.42 + pointer.x * 0.1 - prism.current.rotation.y) *
        (1 - Math.exp(-delta * 4));
  });
  const row = [0, 1, 2, 2, 1, 2][index],
    cell: [number, number, number] = [
      0.65 + selected * 0.65,
      1.05 - row * 0.85,
      0.23,
    ];
  return (
    <group>
      <mesh position={[0, -1.85, 0]}>
        <boxGeometry args={[10.3, 0.15, 2.2]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0, -1.76, 0.15]}>
        <boxGeometry args={[10.1, 0.025, 1.7]} />
        <meshStandardMaterial {...CHROME} roughness={0.35} />
      </mesh>
      <mesh position={[-4.12, 0.1, -0.6]}>
        <boxGeometry args={[1.0, 2.9, 0.65]} />
        <meshStandardMaterial
          color="#0c0c0a"
          roughness={0.68}
          metalness={0.1}
        />
      </mesh>
      <SceneLabel active={active} position={[-4.12, 1.85, -0.2]}>
        LLM / idle<small>before inference</small>
      </SceneLabel>
      <Rod
        from={[-4.15, 0.3, 0.45]}
        to={[-2.4, 0.3, 0.2]}
        radius={0.018}
        color="#e8e3d4"
        glow={0.25}
      />
      {[-3.55, -2.95, -2.35].map((x) => (
        <group key={x} position={[x, 0.62, 0.5]}>
          <mesh>
            <boxGeometry args={[0.4, 0.24, 0.045]} />
            <meshStandardMaterial {...CHROME} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.026]}>
            <boxGeometry args={[0.24, 0.02, 0.008]} />
            <meshBasicMaterial color="#39392f" />
          </mesh>
        </group>
      ))}
      <group
        ref={prism}
        position={[-1.62, 0.12, 0.1]}
        rotation={[0.05, -0.42, 0]}
      >
        <mesh geometry={glass}>
          <meshPhysicalMaterial
            color="#fffdf1"
            transmission={1}
            thickness={1.25}
            ior={1.5}
            dispersion={1.1}
            roughness={0.035}
            clearcoat={1}
            clearcoatRoughness={0.04}
            envMapIntensity={2}
            attenuationColor="#eee9db"
            attenuationDistance={12}
          />
        </mesh>
      </group>
      {/* Real neutral calibration geometry exposes physical transmission and dispersion. */}
      <group position={[-1.62, 0.2, -1.03]}>
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[2, 2, 0.05]} />
          <meshBasicMaterial color="#292921" />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[-0.88 + i * 0.22, 0, 0]}>
            <boxGeometry args={[i % 2 ? 0.018 : 0.05, 1.85, 0.015]} />
            <meshBasicMaterial color="#ded8c8" />
          </mesh>
        ))}
        {[-0.6, 0, 0.6].map((y) => (
          <mesh key={y} position={[0, y, 0.01]}>
            <boxGeometry args={[1.88, 0.018, 0.01]} />
            <meshBasicMaterial color="#aaa494" />
          </mesh>
        ))}
      </group>
      <mesh position={[-1.62, -1.35, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.7, 32]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      {risks.map((risk, i) => {
        const y = 1.05 - i * 0.85;
        return (
          <group key={risk}>
            <Rod
              from={[-0.88, 0.3, 0.2]}
              to={[0.3, y, 0.22]}
              radius={i === selected ? 0.034 : 0.021}
              color={spectrum[i]}
              opacity={i === selected ? 0.95 : 0.6}
              glow={i === selected ? 1.0 : 0.25}
            />
            <SceneLabel
              active={active}
              position={[-0.3, y + 0.22, 0.35]}
              className={`risk-${risk.toLowerCase()} ${i === selected ? "" : "is-muted"}`}
            >
              {risk}
            </SceneLabel>
          </group>
        );
      })}
      <group position={[1.3, 0.2, -0.05]}>
        <mesh>
          <boxGeometry args={[2.5, 2.8, 0.07]} />
          <meshStandardMaterial {...DARK} roughness={0.65} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={i}>
            <Rod
              from={[-1.05 + i * 0.7, -1.27, 0.055]}
              to={[-1.05 + i * 0.7, 1.27, 0.055]}
              radius={0.009}
              color="#777365"
            />
            <Rod
              from={[-1.05, -1.27 + i * 0.85, 0.055]}
              to={[1.05, -1.27 + i * 0.85, 0.055]}
              radius={0.009}
              color="#777365"
            />
          </group>
        ))}
      </group>
      <mesh position={cell}>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshBasicMaterial color={spectrum[selected]} />
      </mesh>
      <Rod
        from={[0.3, 1.05 - selected * 0.85, 0.22]}
        to={cell}
        radius={0.017}
        color={spectrum[selected]}
      />
      <Rod
        from={cell}
        to={strong ? [3.75, 0.55, 0.15] : [3.75, -1.1, 0.15]}
        radius={0.025}
        color={spectrum[selected]}
        glow={0.4}
      />
      <group position={[4.15, 0.1, 0]}>
        <mesh>
          <boxGeometry args={[1.05, 2.8, 0.7]} />
          <meshStandardMaterial
            {...DARK}
            color={strong ? "#8c887a" : "#25251e"}
            emissive={strong ? spectrum[selected] : "#000000"}
            emissiveIntensity={strong ? 0.2 : 0}
          />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 0.9 - i * 0.4, 0.36]}>
            <boxGeometry args={[0.7, 0.06, 0.025]} />
            <meshBasicMaterial
              color={strong ? spectrum[selected] : "#555347"}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[3.3, -1.2, 0.45]}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial
          {...CHROME}
          color={!strong ? spectrum[selected] : "#555347"}
          emissive={!strong ? spectrum[selected] : "#000000"}
          emissiveIntensity={!strong ? 0.4 : 0}
        />
      </mesh>
      <SceneLabel active={active} position={[1.3, mobile ? 2.45 : 1.95, 0.1]}>
        Difficulty →
        <small>
          {mobile
            ? "x domain / illustrative"
            : "domain × difficulty / illustrative grid"}
        </small>
      </SceneLabel>
      <SceneLabel active={active} position={[4.1, 1.85, 0.1]}>
        Strong model
      </SceneLabel>
      <SceneLabel active={active} position={[3.4, -1.65, 0.7]}>
        Small / cheap model
      </SceneLabel>
    </group>
  );
}
