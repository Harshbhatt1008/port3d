import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Object3D,
  Plane,
  ShaderMaterial,
  Vector3,
} from "three";
import { CHROME, DARK, probe, useExperience } from "../state";
import type { SceneProps } from "../state";
import { Rod } from "./researchGeometry";

const clusterVertex = /* glsl */ `
  uniform float uBoundary;
  uniform float uSize;
  varying float vSide;
  varying float vNear;
  void main() {
    vSide = step(uBoundary, position.x);
    vNear = 1.0 - smoothstep(0.0, 0.32, abs(position.x - uBoundary));
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = min(7.0, uSize * (12.0 / -viewPosition.z));
  }
`;
const clusterFragment = /* glsl */ `
  varying float vSide;
  varying float vNear;
  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.22, distanceToCenter);
    if (alpha < 0.03) discard;
    vec3 color = mix(vec3(0.34, 0.35, 0.31), vec3(0.87, 0.86, 0.79), vSide);
    color += vNear * 0.12;
    gl_FragColor = vec4(color, alpha * mix(0.62, 0.95, vSide));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function Cluster({ mobile, active }: Pick<SceneProps, "mobile" | "active">) {
  const material = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const count = mobile ? 620 : 1700;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const seed = i + 1;
      const a = Math.max(0.0001, ((seed * 139) % 1663) / 1663);
      const b = ((seed * 293) % 1699) / 1699;
      const r = Math.sqrt(-2 * Math.log(a));
      const angle = b * Math.PI * 2;
      const cluster = i % 3;
      values[i * 3] = [-1.25, 0.85, 0.18][cluster] + r * Math.cos(angle) * 0.45;
      values[i * 3 + 1] =
        [0.72, -0.45, 0.2][cluster] + r * Math.sin(angle) * 0.43;
      values[i * 3 + 2] = (((seed * 67) % 1619) / 1619 - 0.5) * 1.6;
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(values, 3));
    return result;
  }, [mobile]);
  const uniforms = useMemo(
    () => ({ uBoundary: { value: 0 }, uSize: { value: mobile ? 3 : 3.6 } }),
    [mobile],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    if (!active || !material.current) return;
    material.current.uniforms.uBoundary.value =
      (useExperience.getState().boundary - 0.5) * 3.6;
  });
  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={clusterVertex}
        fragmentShader={clusterFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function Guard({ active, mobile, reduced }: SceneProps) {
  const boundary = useExperience((state) => state.boundary);
  const local = useRef<Group>(null);
  const dragging = useRef(false);
  const dragPlane = useMemo(() => new Plane(), []);
  const normal = useMemo(() => new Vector3(0, 0, 1), []);
  const worldPoint = useMemo(() => new Vector3(), []);
  const hit = useMemo(() => new Vector3(), []);
  const slab = useRef<Group>(null);
  const update = (event: ThreeEvent<PointerEvent>) => {
    if (!local.current) return;
    local.current.getWorldPosition(worldPoint);
    dragPlane.setFromNormalAndCoplanarPoint(normal, worldPoint);
    if (event.ray.intersectPlane(dragPlane, hit)) {
      local.current.worldToLocal(hit);
      useExperience
        .getState()
        .set({ boundary: Math.max(0, Math.min(1, hit.x / 3.6 + 0.5)) });
    }
  };
  useFrame((_, delta) => {
    if (!active || !slab.current) return;
    const target = (useExperience.getState().boundary - 0.5) * 3.6;
    const state = useExperience.getState();
    if (reduced || state.paused || document.hidden || dragging.current)
      slab.current.position.x = target;
    else
      slab.current.position.x +=
        (target - slab.current.position.x) * Math.min(1, delta * 11);
  });
  return (
    <group ref={local}>
      <Cluster mobile={mobile} active={active} />
      {/* Physical decision plane: pointer drag and the root DOM range share one value. */}
      <group ref={slab} position={[(boundary - 0.5) * 3.6, 0, 0.15]}>
        <group rotation={[0, -0.52, 0]}>
          <mesh
            {...probe("Drag the illustrative decision boundary")}
            onPointerDown={(event) => {
              event.stopPropagation();
              dragging.current = true;
              (event.target as Element | null)?.setPointerCapture(
                event.pointerId,
              );
              update(event);
            }}
            onPointerMove={(event) => {
              if (dragging.current) {
                event.stopPropagation();
                update(event);
              }
            }}
            onPointerUp={(event) => {
              dragging.current = false;
              (event.target as Element | null)?.releasePointerCapture(
                event.pointerId,
              );
              useExperience.getState().set({ hoverLabel: "" });
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
          >
            <planeGeometry args={[1.2, 3.4]} />
            <meshPhysicalMaterial
              color="#aaa99a"
              transparent
              opacity={0.11}
              roughness={0.25}
              metalness={0.45}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {[-0.6, 0.6].map((x) => (
            <Rod
              key={x}
              from={[x, -1.7, 0]}
              to={[x, 1.7, 0]}
              radius={0.016}
              color="#bab9aa"
            />
          ))}
          {[-1.7, 1.7].map((y) => (
            <Rod
              key={y}
              from={[-0.6, y, 0]}
              to={[0.6, y, 0]}
              radius={0.016}
              color="#bab9aa"
            />
          ))}
          {[-1.4, -0.7, 0, 0.7, 1.4].map((y) => (
            <Rod
              key={y}
              from={[-0.6, y, 0]}
              to={[-0.51, y, 0]}
              radius={0.01}
              color="#d8d5c8"
            />
          ))}
          <mesh position={[0, -1.9, 0]}>
            <boxGeometry args={[0.39, 0.21, 0.25]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
        </group>
      </group>
      <mesh position={[0, -2.07, 0]}>
        <boxGeometry args={[5.15, 0.12, 1.75]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <Rod
        from={[-2.22, -1.97, 0.32]}
        to={[2.22, -1.97, 0.32]}
        radius={0.025}
        color="#8c8c7d"
      />
      {Array.from({ length: 21 }, (_, i) => (
        <Rod
          key={i}
          from={[-2 + i * 0.2, -2.0, 0.56]}
          to={[-2 + i * 0.2, -2.0, i % 5 === 0 ? 0.8 : 0.7]}
          radius={0.008}
          color="#77786c"
        />
      ))}
    </group>
  );
}

const filePositions = [
  [-1.72, 1.18, -0.32],
  [-0.54, 1.18, -0.62],
  [0.64, 0.02, -0.32],
  [1.82, -1.14, -0.62],
] as const;

function RepositoryNodes() {
  const instances = useRef<InstancedMesh>(null);
  const placements = useMemo(() => {
    const positions: Vector3[] = [];
    for (let z = 0; z < 2; z++)
      for (let y = 0; y < 3; y++)
        for (let x = 0; x < 4; x++)
          positions.push(
            new Vector3(-1.72 + x * 1.18, 1.18 - y * 1.16, -0.32 - z * 0.65),
          );
    return positions;
  }, []);
  useLayoutEffect(() => {
    if (!instances.current) return;
    const object = new Object3D();
    placements.forEach((position, i) => {
      object.position.copy(position);
      object.updateMatrix();
      instances.current!.setMatrixAt(i, object.matrix);
    });
    instances.current.instanceMatrix.needsUpdate = true;
  }, [placements]);
  return (
    <instancedMesh
      ref={instances}
      args={[undefined, undefined, placements.length]}
    >
      <boxGeometry args={[0.11, 0.11, 0.11]} />
      <meshStandardMaterial {...CHROME} />
    </instancedMesh>
  );
}

function Review({ active, reduced }: Pick<SceneProps, "active" | "reduced">) {
  const selected = useExperience((state) => state.fileIndex);
  const plate = useRef<Group>(null);
  const destination = useMemo(() => new Vector3(), []);
  const current = filePositions[selected % 4];
  useFrame((_, delta) => {
    if (!active || !plate.current) return;
    destination.set(current[0] * 0.24 + 0.4, current[1] * 0.42, 1.38);
    const state = useExperience.getState();
    plate.current.position.lerp(
      destination,
      reduced || state.paused || document.hidden ? 1 : Math.min(1, delta * 7),
    );
  });
  return (
    <group
      rotation={[0.025, -0.12, 0]}
      {...probe("Repository lattice · select a file below")}
    >
      <RepositoryNodes />
      {[0, 1].map((z) => (
        <group key={z}>
          {[0, 1, 2].map((y) => (
            <Rod
              key={y}
              from={[-1.72, 1.18 - y * 1.16, -0.32 - z * 0.65]}
              to={[1.82, 1.18 - y * 1.16, -0.32 - z * 0.65]}
              radius={0.012}
              color="#74776a"
            />
          ))}
          {[0, 1, 2, 3].map((x) => (
            <Rod
              key={x}
              from={[-1.72 + x * 1.18, 1.18, -0.32 - z * 0.65]}
              to={[-1.72 + x * 1.18, -1.14, -0.32 - z * 0.65]}
              radius={0.012}
              color="#74776a"
            />
          ))}
        </group>
      ))}
      {[0, 1, 2].flatMap((y) =>
        [0, 1, 2, 3].map((x) => (
          <Rod
            key={`${x}-${y}`}
            from={[-1.72 + x * 1.18, 1.18 - y * 1.16, -0.32]}
            to={[-1.72 + x * 1.18, 1.18 - y * 1.16, -0.97]}
            radius={0.01}
            color="#55584e"
          />
        )),
      )}
      {filePositions.map((position, i) => (
        <group key={i} position={[...position]}>
          <mesh
            onClick={(event) => {
              event.stopPropagation();
              useExperience.getState().set({ fileIndex: i });
            }}
            {...probe(`Retrieve file ${i + 1}`)}
          >
            <boxGeometry args={[0.74, 0.82, 0.06]} />
            <meshStandardMaterial
              {...DARK}
              color={i === selected ? "#78796b" : "#36392f"}
            />
          </mesh>
          {[0, 1, 2, 3].map((line) => (
            <mesh
              key={line}
              position={[
                line % 2 === 0 ? -0.05 : 0.04,
                0.2 - line * 0.12,
                0.034,
              ]}
            >
              <boxGeometry args={[line % 2 === 0 ? 0.42 : 0.33, 0.02, 0.007]} />
              <meshStandardMaterial
                color="#aaa99a"
                roughness={0.4}
                metalness={0.6}
              />
            </mesh>
          ))}
        </group>
      ))}
      <Rod
        from={[...current]}
        to={[current[0] * 0.24 + 0.4, current[1] * 0.42, 1.38]}
        radius={0.015}
        color="#e0ddcf"
        opacity={0.62}
        glow={0.8}
      />
      <group ref={plate} position={[0.4, 0, 1.38]}>
        <mesh>
          <boxGeometry args={[1.1, 1.28, 0.07]} />
          <meshStandardMaterial {...CHROME} roughness={0.27} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[0.96, 1.14, 0.012]} />
          <meshStandardMaterial {...DARK} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((line) => (
          <mesh
            key={line}
            position={[-0.04 + (line % 2) * 0.05, 0.36 - line * 0.14, 0.052]}
          >
            <boxGeometry args={[line % 3 === 0 ? 0.51 : 0.71, 0.026, 0.008]} />
            <meshBasicMaterial
              color={line === selected + 1 ? "#e4e0d2" : "#74786b"}
            />
          </mesh>
        ))}
        <mesh position={[-0.405, 0.39 - selected * 0.14, 0.06]}>
          <boxGeometry args={[0.035, 0.09, 0.015]} />
          <meshBasicMaterial color="#e4e0d2" />
        </mesh>
      </group>
      <mesh position={[0.05, -1.87, -0.23]}>
        <boxGeometry args={[4.4, 0.13, 2.02]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {[-1.72, 1.82].map((x) => (
        <Rod
          key={x}
          from={[x, -1.14, -0.65]}
          to={[x, -1.8, -0.65]}
          radius={0.035}
        />
      ))}
    </group>
  );
}

export default function Signals(props: SceneProps) {
  const mode = useExperience((state) => state.signalMode);
  return (
    <group
      position={props.mobile ? [0, 1.05, 0] : [2.2, 0, 0]}
      scale={props.mobile ? 0.56 : 0.94}
    >
      {mode === "guard" ? (
        <Guard {...props} />
      ) : (
        <Review active={props.active} reduced={props.reduced} />
      )}
    </group>
  );
}
