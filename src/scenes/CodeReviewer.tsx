import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  ShaderMaterial,
  Vector3,
} from "three";
import { CHROME, DARK, useExperience, type SceneProps } from "../state";
import { retrievalFiles } from "../content";
import { Rod } from "./researchGeometry";
import { SceneLabel } from "./SceneLabel";
const files = [
  [-2.7, 1.1, -0.4],
  [-1.7, -0.5, 0.5],
  [-0.6, 1.2, 0.3],
  [-0.1, -0.9, -0.3],
] as [number, number, number][];
export default function CodeReviewer({ active, mobile, reduced }: SceneProps) {
  const index = useExperience((s) => s.fileIndex),
    report = useRef<Group>(null),
    floating = useRef<Group>(null),
    time = useRef(0);
  const query = useMemo(
    () => new Vector3(...files[index]).add(new Vector3(0.18, 0.12, 0.25)),
    [index],
  );
  const nearest = useMemo(
    () =>
      files
        .map((p, i) => ({ i, d: new Vector3(...p).distanceTo(query) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3),
    [query],
  );
  const geometry = useMemo(() => {
    const count = mobile ? 360 : 900,
      p = new Float32Array(count * 3),
      seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const center = files[i % 4];
      p.set(
        [
          center[0] + Math.sin(i * 2.39) * 0.38,
          center[1] + Math.cos(i * 1.73) * 0.5,
          center[2] + Math.sin(i * 0.91) * 0.4,
        ],
        i * 3,
      );
      seed[i] = (i * 0.618) % 1;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(p, 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 1));
    return g;
  }, [mobile]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `attribute float aSeed;uniform float uTime;varying float vA;void main(){vec3 p=position;p.z+=sin(uTime*.4+aSeed*31.)*.04;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=2.2;vA=.2+aSeed*.5;}`,
        fragmentShader: `varying float vA;void main(){if(length(gl_PointCoord-.5)>.5)discard;gl_FragColor=vec4(.85,.83,.77,vA);}`,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    time.current = 0;
    if (report.current) report.current.scale.y = reduced ? 1 : 0.8;
  }, [index, reduced]);
  useFrame((_, delta) => {
    if (!active || reduced || useExperience.getState().paused) return;
    time.current += Math.min(delta, 0.05);
    material.uniforms.uTime.value += Math.min(delta, 0.05);
    if (report.current)
      report.current.scale.y +=
        (1 - report.current.scale.y) * (1 - Math.exp(-delta * 6));
    if (floating.current)
      floating.current.position.y = 1.8 + Math.sin(time.current * 0.8) * 0.12;
  });
  return (
    <group>
      <mesh position={[0, -1.85, 0]}>
        <boxGeometry args={[8, 0.12, 2]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <points geometry={geometry} material={material} />
      {files.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <boxGeometry args={[0.54, 0.72, 0.08]} />
            <meshStandardMaterial
              {...DARK}
              color={i === index ? "#8a877a" : "#34342c"}
            />
          </mesh>
          {[0, 1, 2].map((n) => (
            <mesh key={n} position={[0, 0.18 - n * 0.16, 0.05]}>
              <boxGeometry args={[0.34, 0.018, 0.01]} />
              <meshBasicMaterial color="#c8c3b5" />
            </mesh>
          ))}
        </group>
      ))}
      <Rod
        from={[-3.8, -0.6, 0.4]}
        to={query.toArray() as [number, number, number]}
        radius={0.021}
        color="#e2ddd0"
        glow={0.35}
      />
      {nearest.map(({ i }, n) => (
        <Rod
          key={i}
          from={files[i]}
          to={[2.7, 0.6 - n * 0.55, 0.2]}
          radius={0.012}
          color="#e4dfd1"
          opacity={0.65}
        />
      ))}
      <group ref={report} position={[2.8, -0.2, 0.15]}>
        <mesh>
          <boxGeometry args={[1.85, 2.65, 0.12]} />
          <meshStandardMaterial {...CHROME} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0, 0.072]}>
          <planeGeometry args={[1.66, 2.45]} />
          <meshBasicMaterial color="#25251f" />
        </mesh>
        {[0, 1, 2].map((n) => (
          <group key={n} position={[0, 0.8 - n * 0.6, 0.09]}>
            <mesh>
              <boxGeometry args={[1.25, 0.1, 0.015]} />
              <meshBasicMaterial color="#aaa699" />
            </mesh>
            <mesh position={[0.18, -0.17, 0]}>
              <boxGeometry args={[0.9, 0.02, 0.01]} />
              <meshBasicMaterial color="#716f61" />
            </mesh>
          </group>
        ))}
        <SceneLabel active={active} position={[0, -1.63, 0.15]}>
          Grounded review report
        </SceneLabel>
      </group>
      <group ref={floating} position={[2.8, 1.8, 0]}>
        <mesh rotation={[0, 0.12, 0.08]}>
          <boxGeometry args={[1.5, 0.5, 0.06]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        <SceneLabel
          active={active}
          position={[0, 0, 0.1]}
          className="no-surface"
        >
          Unsupported flag<small>no source thread</small>
        </SceneLabel>
      </group>
      <SceneLabel active={active} position={[-2, 2.03, 0]}>
        Repository → vectors
      </SceneLabel>
      <SceneLabel active={active} position={[-3.1, -1.32, 0.2]}>
        Query → nearest chunks
      </SceneLabel>
      <SceneLabel active={active} position={[0, 0.2, 0.8]}>
        {retrievalFiles[index].name}
      </SceneLabel>
    </group>
  );
}
