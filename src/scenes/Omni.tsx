import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import {
  CatmullRomCurve3,
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Shape,
  Vector3,
} from "three";
import { CHROME, DARK, useExperience, type SceneProps } from "../state";
import { sceneCopy } from "../content";
import { Turned } from "./instrumentGeometry";
import { FineLines, OpticalGlass, curveSegments, dialSegments } from "./optics";
import { SceneLabel } from "./SceneLabel";
import {
  OBSTACLES,
  ROOM_GOALS,
  shortestRoomRoute,
  type Cell,
  type Goal,
} from "./navigation";
export { ROOM_GOALS, shortestRoomRoute } from "./navigation";

const mapPoint = ([x, y]: Cell) => {
  const px = (x - 4) * 0.63,
    pz = (y - 3) * 0.63;
  return new Vector3(px, -1.15 + 0.075 * (px * px + pz * pz), pz);
};
const PORTS = [
  new Vector3(-2.45, 2.2, -0.2),
  new Vector3(2.45, 2.2, -0.2),
  new Vector3(0, 3.25, -0.8),
];
const CENTRES = [
  new Vector3(-2, -0.3, 0.5),
  new Vector3(0, 1.2, -0.6),
  new Vector3(2, -0.3, 0.5),
];

/** Rounded probe chassis, an exposed optical core and four annular wheels. */
function Probe({ compact = false }: { compact?: boolean }) {
  return (
    <group scale={compact ? 0.76 : 1}>
      <mesh position={[0, 0.24, 0]} scale={[0.78, 0.36, 1.15]}>
        <sphereGeometry args={[0.4, 20, 12]} />
        <meshStandardMaterial {...CHROME} roughness={0.16} />
      </mesh>
      <mesh position={[0, 0.35, -0.03]} scale={[0.65, 0.32, 0.85]}>
        <sphereGeometry args={[0.36, 20, 12]} />
        <OpticalGlass opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.42, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <Turned args={[0.115, 0.14, 0.18, 20]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0, 0.42, -0.3]}>
        <sphereGeometry args={[0.082, 12, 10]} />
        <OpticalGlass opacity={0.9} />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh
            key={`${x}${z}`}
            position={[x * 0.31, 0.14, z * 0.22]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <torusGeometry args={[0.105, 0.026, 6, 20]} />
            <meshStandardMaterial {...DARK} roughness={0.4} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.64, 0.05]}>
        <octahedronGeometry args={[0.09, 1]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 0.73, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.009, 4, 32]} />
        <meshBasicMaterial color="#dbe6f4" />
      </mesh>
      <mesh position={[0, 0.73, -0.21]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.16, 3]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
    </group>
  );
}

function Echo({ active, reduced }: { active: boolean; reduced: boolean }) {
  const root = useRef<Group>(null),
    clock = useRef(0);
  useFrame((_, delta) => {
    if (!active || reduced || useExperience.getState().paused || !root.current)
      return;
    clock.current += Math.min(delta, 0.05);
    root.current.children.forEach((m, i) => {
      const t = (clock.current * 0.36 + i / 3) % 1;
      m.position.z = -0.4 - t * 1.5;
      m.scale.setScalar(0.15 + t * 0.65);
      ((m as Mesh).material as MeshBasicMaterial).opacity = (1 - t) * 0.26;
    });
  });
  return (
    <group ref={root} position={[0, 0.32, -0.3]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0, -0.5 - i * 0.4]} scale={0.25 + i * 0.2}>
          <ringGeometry args={[0.96, 1, 36, 1, 0, Math.PI * 2]} />
          <meshBasicMaterial
            color="#d9e6f5"
            transparent
            opacity={0.16}
            depthWrite={false}
            side={2}
          />
        </mesh>
      ))}
    </group>
  );
}

function PerceptionMap() {
  const cells = useRef<InstancedMesh>(null),
    obstacles = useRef<InstancedMesh>(null);
  const points = useMemo(
    () =>
      Array.from({ length: 63 }, (_, i) =>
        mapPoint([i % 9, Math.floor(i / 9)]),
      ),
    [],
  );
  const blocked = useMemo(
    () => [...OBSTACLES].map((k) => mapPoint(k.split(",").map(Number) as Cell)),
    [],
  );
  useLayoutEffect(() => {
    const dummy = new Object3D();
    points.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      cells.current?.setMatrixAt(i, dummy.matrix);
    });
    blocked.forEach((p, i) => {
      dummy.position.copy(p).add(new Vector3(0, 0.16, 0));
      dummy.rotation.set(0.1, i * 0.7, 0.2);
      dummy.scale.set(0.7, 1.1, 0.7);
      dummy.updateMatrix();
      obstacles.current?.setMatrixAt(i, dummy.matrix);
    });
    if (cells.current) cells.current.instanceMatrix.needsUpdate = true;
    if (obstacles.current) obstacles.current.instanceMatrix.needsUpdate = true;
  }, [points, blocked]);
  return (
    <group name="perception-map">
      <instancedMesh ref={cells} args={[undefined, undefined, 63]}>
        <ringGeometry args={[0.19, 0.205, 6]} />
        <meshBasicMaterial
          color="#8496ad"
          transparent
          opacity={0.42}
          side={2}
        />
      </instancedMesh>
      <instancedMesh
        ref={obstacles}
        args={[undefined, undefined, blocked.length]}
      >
        <octahedronGeometry args={[0.23, 0]} />
        <meshStandardMaterial {...DARK} roughness={0.22} />
      </instancedMesh>
      <mesh
        position={[0, -1.32, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 0.8, 1]}
      >
        <circleGeometry args={[3.15, 64]} />
        <OpticalGlass opacity={0.14} />
      </mesh>
    </group>
  );
}

function Iris({
  active,
  reduced,
  mobile,
}: {
  active: boolean;
  reduced: boolean;
  mobile: boolean;
}) {
  const blades = useRef<InstancedMesh>(null),
    clock = useRef(0);
  const count = mobile ? 8 : 12;
  const geometry = useMemo(() => {
    const s = new Shape();
    s.moveTo(0.48, -0.03);
    s.quadraticCurveTo(0.8, 0.5, 1.44, 0.28);
    s.lineTo(1.48, 0.09);
    s.quadraticCurveTo(0.95, 0.24, 0.62, -0.15);
    s.closePath();
    return new ExtrudeGeometry(s, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSize: 0.014,
      bevelThickness: 0.012,
      bevelSegments: 2,
      curveSegments: 10,
      steps: 1,
    });
  }, []);
  const ticks = useMemo(() => dialSegments(1.56, mobile ? 36 : 72), [mobile]);
  const place = (t: number) => {
    const d = new Object3D();
    for (let i = 0; i < count; i++) {
      d.rotation.z = (i / count) * Math.PI * 2 + t * 0.08;
      d.position.set(0, 0, Math.sin(t * 0.6 + i * 0.5) * 0.025);
      d.updateMatrix();
      blades.current?.setMatrixAt(i, d.matrix);
    }
    if (blades.current) blades.current.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => place(0), [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (active && !reduced && !useExperience.getState().paused) {
      clock.current += Math.min(delta, 0.05);
      place(clock.current);
    }
  });
  return (
    <group
      name="fusion-iris"
      position={[0, 1.25, 0.1]}
      rotation={[-0.12, 0.12, 0]}
    >
      <instancedMesh ref={blades} args={[geometry, undefined, count]}>
        <meshStandardMaterial {...CHROME} roughness={0.23} />
      </instancedMesh>
      <mesh>
        <torusGeometry args={[1.52, 0.025, 8, 72]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <FineLines segments={ticks} opacity={0.65} />
      <mesh scale={[0.65, 0.65, 0.25]}>
        <icosahedronGeometry args={[1, 2]} />
        <OpticalGlass opacity={0.62} />
      </mesh>
      <mesh rotation={[0.3, 0.6, 0.1]}>
        <octahedronGeometry args={[0.33, 1]} />
        <meshPhysicalMaterial {...CHROME} roughness={0.1} clearcoat={1} />
      </mesh>
    </group>
  );
}

function SensorPorts({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) {
  const clock = useRef(0),
    pulses = useRef<(Mesh | null)[]>([]);
  const curves = useMemo(
    () =>
      PORTS.map(
        (p, i) =>
          new CatmullRomCurve3([
            p,
            p.clone().add(new Vector3(i === 0 ? 0.65 : -0.65, -0.1, 0.5)),
            new Vector3(0, 1.25, 0.1),
          ]),
      ),
    [],
  );
  const segments = useMemo(
    () => curves.flatMap((c) => curveSegments(c.getPoints(24))),
    [curves],
  );
  useFrame((_, delta) => {
    if (!active || reduced || useExperience.getState().paused) return;
    clock.current += Math.min(delta, 0.05);
    pulses.current.forEach((p, i) =>
      p?.position.copy(
        curves[i].getPoint((clock.current * (0.24 + i * 0.055) + i / 3) % 1),
      ),
    );
  });
  return (
    <group>
      <FineLines segments={segments} opacity={0.55} />
      {PORTS.map((p, i) => (
        <group
          key={i}
          position={p}
          rotation={[
            0,
            i === 0 ? -0.25 : 0.25,
            i === 2 ? 0 : i === 0 ? 0.25 : -0.25,
          ]}
        >
          <mesh scale={[1.6, 0.7, 0.6]}>
            <icosahedronGeometry args={[0.27, 1]} />
            <OpticalGlass opacity={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.23, 0.016, 6, 32]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
          <SceneLabel active={active} position={[0, 0.4, 0]}>
            {sceneCopy.omni.sensors[i]}
          </SceneLabel>
        </group>
      ))}
      {curves.map((c, i) => (
        <mesh
          key={i}
          ref={(m) => {
            pulses.current[i] = m;
          }}
          position={c.getPoint(0.5)}
        >
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#e6f0fd" />
        </mesh>
      ))}
    </group>
  );
}

function Fleet({
  active,
  reduced,
  mobile,
}: {
  active: boolean;
  reduced: boolean;
  mobile: boolean;
}) {
  const pulses = useRef<(Mesh | null)[]>([]),
    clock = useRef(0);
  const links = useMemo(
    () =>
      CENTRES.map(
        (p, i) =>
          new CatmullRomCurve3([
            p.clone().add(new Vector3(0, 0.8, 0)),
            p.clone().add(new Vector3(0, 2, -0.3)),
            CENTRES[(i + 1) % 3].clone().add(new Vector3(0, 0.8, 0)),
          ]),
      ),
    [],
  );
  const lines = useMemo(
    () => links.flatMap((c) => curveSegments(c.getPoints(32))),
    [links],
  );
  useFrame((_, delta) => {
    if (!active || reduced || useExperience.getState().paused) return;
    clock.current += Math.min(delta, 0.05);
    pulses.current.forEach((p, i) => {
      if (!p) return;
      const t = (clock.current * 0.16 + i / 3) % 1;
      if (t < 0.55) {
        const a = (t / 0.55) * Math.PI * 4;
        p.position
          .copy(CENTRES[i])
          .add(
            new Vector3(
              Math.cos(a) * 0.38,
              0.9 + Math.sin(a) * 0.16,
              Math.sin(a) * 0.28,
            ),
          );
      } else p.position.copy(links[i].getPoint((t - 0.55) / 0.45));
    });
  });
  return (
    <group name="federated-fleet">
      <FineLines segments={lines} opacity={0.5} />
      {CENTRES.map((p, i) => (
        <group key={i} position={p}>
          <Probe compact />
          {[0, 1, 2].map((n) => (
            <mesh
              key={n}
              position={[(n - 1) * 0.34, 0.95, 0]}
              rotation={[0.2, n * 0.4, 0.3]}
            >
              <octahedronGeometry args={[0.12, 0]} />
              <meshStandardMaterial {...CHROME} />
            </mesh>
          ))}
          <group name={`sealed-local-data-${i}`} position={[0.65, 0.28, 0.15]}>
            <mesh>
              <Turned args={[0.19, 0.23, 0.55, 20]} thin={false} />
              <OpticalGlass opacity={0.35} />
            </mesh>
            <mesh position={[0, 0.29, 0]}>
              <Turned args={[0.2, 0.2, 0.04, 20]} thin={false} />
              <meshStandardMaterial {...CHROME} />
            </mesh>
            <mesh>
              <icosahedronGeometry args={[0.14, 1]} />
              <meshStandardMaterial {...DARK} />
            </mesh>
          </group>
          <SceneLabel active={active} position={[0, -0.4, 0.3]}>
            {sceneCopy.omni.robot} {i + 1}
            {!mobile && <small>{sceneCopy.omni.local}</small>}
          </SceneLabel>
        </group>
      ))}
      {CENTRES.map((p, i) => (
        <mesh
          key={i}
          ref={(m) => {
            pulses.current[i] = m;
          }}
          position={p.clone().add(new Vector3(0, 0.9, 0))}
        >
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshBasicMaterial color="#f2f6ff" />
        </mesh>
      ))}
      <SceneLabel active={active} position={[0, 3.25, 0]}>
        {sceneCopy.omni.fleet}
      </SceneLabel>
      <SceneLabel active={active} position={[0, -1.25, 1]}>
        {sceneCopy.omni.modules}
      </SceneLabel>
    </group>
  );
}

export default function Omni({ active, reduced, mobile }: SceneProps) {
  const run = useExperience((s) => s.robotRun),
    fed = useExperience((s) => s.fedAvg),
    goal = useExperience((s) => s.goal);
  const root = useRef<Group>(null),
    robot = useRef<Group>(null),
    nav = useRef<Group>(null),
    fleet = useRef<Group>(null);
  const cell = useRef<Cell>([4, 6]),
    destination = useRef<Goal>("plant"),
    pending = useRef(false),
    segment = useRef(0),
    progress = useRef(0),
    mode = useRef(0);
  const [route, setRoute] = useState<Cell[]>([]),
    points = useMemo(() => route.map(mapPoint), [route]);
  const shellLines = useMemo(() => {
    const segments: number[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI,
        curve = Array.from({ length: 65 }, (_, j) => {
          const t = (j / 64) * Math.PI * 1.5 - 0.25;
          return new Vector3(
            Math.cos(t) * 2.9 * Math.cos(a),
            0.55 + Math.sin(t) * 2.65,
            Math.cos(t) * 2.9 * Math.sin(a),
          );
        });
      segments.push(...curveSegments(curve));
    }
    return segments;
  }, []);
  useEffect(() => {
    if (!run) return;
    destination.current = useExperience.getState().goal;
    const plan = shortestRoomRoute(
      cell.current,
      ROOM_GOALS[destination.current],
    );
    segment.current = 0;
    progress.current = 0;
    pending.current = plan.length > 0;
    setRoute(plan);
    useExperience.getState().set({
      robotStatus: plan.length
        ? sceneCopy.omni.planning
        : sceneCopy.omni.blocked,
    });
  }, [run]);
  useFrame(({ pointer }, delta) => {
    if (!active) return;
    const s = useExperience.getState();
    if (!s.paused)
      mode.current = reduced
        ? fed
          ? 1
          : 0
        : mode.current +
          ((fed ? 1 : 0) - mode.current) * (1 - Math.exp(-delta * 4));
    if (nav.current) {
      nav.current.visible = mode.current < 0.99;
      nav.current.position.z = -mode.current * 1.4;
      nav.current.scale.setScalar(1 - mode.current * 0.16);
    }
    if (fleet.current) {
      fleet.current.visible = mode.current > 0.01;
      fleet.current.scale.setScalar(Math.max(0.001, mode.current));
    }
    if (root.current && !s.paused)
      root.current.rotation.y = -0.23 + (reduced ? 0 : pointer.x * 0.05);
    if (fed || s.paused || !robot.current || !points.length || !pending.current)
      return;
    const finish = () => {
      robot.current!.position.copy(points.at(-1)!);
      cell.current = route.at(-1)!;
      pending.current = false;
      s.set({
        robotStatus: sceneCopy.omni.arrived(
          destination.current,
          route.length - 1,
        ),
      });
    };
    if (reduced || points.length === 1) {
      finish();
      return;
    }
    if (segment.current === 0 && progress.current === 0)
      s.set({
        robotStatus: sceneCopy.omni.moving(
          destination.current,
          route.length - 1,
        ),
      });
    progress.current += Math.min(delta, 0.06) * 1.5;
    if (progress.current >= 1) {
      progress.current -= 1;
      segment.current++;
      cell.current = route[segment.current];
      if (segment.current >= points.length - 1) {
        finish();
        return;
      }
    }
    const from = points[segment.current],
      to = points[segment.current + 1];
    robot.current.position.lerpVectors(from, to, progress.current);
    robot.current.rotation.y = Math.atan2(-(to.x - from.x), -(to.z - from.z));
  });
  return (
    <group ref={root} name="perception-globe" rotation={[0.17, -0.23, 0]}>
      <FineLines segments={shellLines} opacity={0.23} />
      <mesh position={[0, 0.55, -0.2]} rotation={[0.05, 0.4, 0]}>
        <sphereGeometry
          args={[
            2.75,
            mobile ? 28 : 48,
            20,
            0,
            Math.PI * 1.25,
            0,
            Math.PI * 0.83,
          ]}
        />
        <OpticalGlass opacity={0.085} />
      </mesh>
      <group ref={nav}>
        <PerceptionMap />
        <Iris active={active && !fed} reduced={reduced} mobile={mobile} />
        <SensorPorts active={active && !fed} reduced={reduced} />
        {points.length > 1 && (
          <Line
            points={points}
            color="#e6edf8"
            lineWidth={1.6}
            transparent
            opacity={0.9}
          />
        )}
        <group ref={robot} name="navigation-probe" position={mapPoint([4, 6])}>
          <Probe />
          <Echo active={active && !fed} reduced={reduced} />
        </group>
        <mesh
          position={mapPoint(ROOM_GOALS[goal]).add(new Vector3(0, 0.15, 0))}
        >
          <torusGeometry args={[0.24, 0.02, 6, 32]} />
          <meshBasicMaterial color="#dbe8f8" />
        </mesh>
        <SceneLabel active={active && !fed} position={[0, -1.9, 1.9]}>
          {sceneCopy.omni.map}
        </SceneLabel>
      </group>
      <group ref={fleet} visible={false}>
        <Fleet active={active && fed} reduced={reduced} mobile={mobile} />
      </group>
    </group>
  );
}
