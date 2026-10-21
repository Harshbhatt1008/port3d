import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances, Line } from "@react-three/drei";
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import { CHROME, DARK, probe, useExperience } from "../state";
import type { SceneProps } from "../state";

type Cell = [number, number];
type Goal = "plant" | "desk" | "door";
const CELL = 0.72;
const FLOOR = -1.6;
export const ROOM_GOALS: Record<Goal, Cell> = {
  plant: [6, 1],
  desk: [3, 2],
  door: [7, 0],
};
// Occupancy follows the desk, shelves, chair and instrument bench below.
const OBSTACLES = new Set([
  "2,0",
  "3,0",
  "4,0",
  "2,1",
  "3,1",
  "4,1",
  "0,1",
  "0,2",
  "0,3",
  "0,4",
  "3,3",
  "5,3",
  "5,4",
  "7,1",
]);
const key = ([x, y]: Cell) => `${x},${y}`;
const world = ([x, y]: Cell) =>
  new Vector3((x - 4) * CELL, FLOOR + 0.08, (y - 3) * CELL);

/** Four-connected BFS: a shortest legal route in the room's actual occupancy map. */
export function shortestRoomRoute(start: Cell, goal: Cell): Cell[] {
  if (OBSTACLES.has(key(goal))) return [];
  const queue: Cell[] = [start];
  const parents = new Map<string, Cell | null>([[key(start), null]]);
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    if (key(current) === key(goal)) {
      const route: Cell[] = [];
      let next: Cell | null = current;
      while (next) {
        route.unshift(next);
        next = parents.get(key(next)) ?? null;
      }
      return route;
    }
    for (const [dx, dy] of [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ]) {
      const cell: Cell = [current[0] + dx, current[1] + dy];
      if (
        cell[0] < 0 ||
        cell[0] > 8 ||
        cell[1] < 0 ||
        cell[1] > 6 ||
        OBSTACLES.has(key(cell)) ||
        parents.has(key(cell))
      )
        continue;
      parents.set(key(cell), current);
      queue.push(cell);
    }
  }
  return [];
}

function Rover({ small = false }: { small?: boolean }) {
  return (
    <group scale={small ? 0.58 : 1}>
      <mesh position={[0, 0.21, 0]} castShadow>
        <boxGeometry args={[0.48, 0.25, 0.59]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 0.36, -0.02]}>
        <boxGeometry args={[0.34, 0.07, 0.33]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <Instances limit={4} range={4}>
        <cylinderGeometry args={[0.13, 0.13, 0.105, 16]} />
        <meshStandardMaterial color="#33332f" roughness={0.72} />
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Instance
              key={`${x}${z}`}
              position={[x * 0.26, 0.14, z * 0.19]}
              rotation={[0, 0, Math.PI / 2]}
            />
          )),
        )}
      </Instances>
      <mesh position={[0, 0.54, -0.13]}>
        <cylinderGeometry args={[0.024, 0.034, 0.35, 8]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 0.72, -0.13]}>
        <cylinderGeometry args={[0.115, 0.115, 0.08, 24]} />
        <meshStandardMaterial
          color="#e5e1d5"
          metalness={0.85}
          roughness={0.21}
        />
      </mesh>
      <mesh position={[0, 0.33, -0.305]}>
        <boxGeometry args={[0.22, 0.07, 0.018]} />
        <meshBasicMaterial color="#e7e3d8" />
      </mesh>
      {[-0.075, 0.075].map((x) => (
        <mesh key={x} position={[x, 0.34, -0.32]}>
          <sphereGeometry args={[0.023, 8, 8]} />
          <meshBasicMaterial color="#181915" />
        </mesh>
      ))}
    </group>
  );
}

function DetectionBox({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial
        color="#dedace"
        wireframe
        transparent
        opacity={0.38}
        depthWrite={false}
      />
    </mesh>
  );
}

function Room() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = i * 2.399;
        return {
          position: [
            2.16 + Math.sin(a) * 0.22,
            FLOOR + 0.8 + (i % 3) * 0.19,
            -1.44 + Math.cos(a) * 0.19,
          ] as [number, number, number],
          rotation: [0.35 + i * 0.12, a, 0.65] as [number, number, number],
        };
      }),
    [],
  );
  return (
    <group>
      <mesh position={[0, FLOOR - 0.11, 0]} receiveShadow>
        <boxGeometry args={[6.9, 0.22, 5.35]} />
        <meshStandardMaterial
          color="#30312b"
          metalness={0.4}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[0, FLOOR + 1.2, -2.63]} receiveShadow>
        <boxGeometry args={[6.9, 2.4, 0.14]} />
        <meshStandardMaterial color="#373831" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[-3.38, FLOOR + 0.8, 0]}>
        <boxGeometry args={[0.12, 1.6, 5.35]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {/* A cutaway interior; the camera-facing sides remain open. */}
      <Instances limit={12} range={12}>
        <boxGeometry args={[0.012, 0.006, 5.15]} />
        <meshStandardMaterial color="#484940" roughness={0.7} />
        {Array.from({ length: 12 }, (_, i) => (
          <Instance key={i} position={[-3.2 + i * 0.57, FLOOR + 0.007, 0]} />
        ))}
      </Instances>
      <mesh
        position={[1.95, FLOOR + 1.04, -2.54]}
        {...probe("Door · route destination")}
      >
        <boxGeometry args={[0.85, 2.08, 0.09]} />
        <meshStandardMaterial color="#22231e" metalness={0.6} roughness={0.4} />
      </mesh>
      <Line
        points={[
          [1.49, FLOOR, -2.46],
          [1.49, FLOOR + 2.15, -2.46],
          [2.41, FLOOR + 2.15, -2.46],
          [2.41, FLOOR, -2.46],
        ]}
        color="#8d8d80"
        lineWidth={1}
      />
      <mesh position={[2.26, FLOOR + 1, -2.45]}>
        <boxGeometry args={[0.06, 0.12, 0.04]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <group
        position={[-0.72, FLOOR, -1.82]}
        {...probe("Desk · occupied cells; route stops in front")}
      >
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[2.08, 0.13, 1.04]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
        {[-0.89, 0.89].flatMap((x) =>
          [-0.38, 0.38].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.4, z]}>
              <boxGeometry args={[0.07, 0.8, 0.07]} />
              <meshStandardMaterial {...DARK} />
            </mesh>
          )),
        )}
        <mesh position={[0.05, 1.3, -0.24]} rotation={[-0.06, 0, 0]}>
          <boxGeometry args={[0.85, 0.5, 0.06]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        <mesh position={[0.05, 1.3, -0.202]}>
          <planeGeometry args={[0.75, 0.4]} />
          <meshBasicMaterial color="#5f6257" />
        </mesh>
        <mesh position={[0.05, 1.01, -0.22]}>
          <cylinderGeometry args={[0.035, 0.06, 0.22, 12]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
        <mesh position={[0.05, 0.94, 0.24]}>
          <boxGeometry args={[0.58, 0.025, 0.21]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        <mesh position={[-0.7, 0.98, 0.1]}>
          <cylinderGeometry args={[0.075, 0.06, 0.2, 16]} />
          <meshStandardMaterial color="#c0bdb1" roughness={0.45} />
        </mesh>
      </group>
      <group position={[-0.72, FLOOR, 0]}>
        <mesh position={[0, 0.44, 0]}>
          <boxGeometry args={[0.49, 0.12, 0.48]} />
          <meshStandardMaterial color="#5b5b50" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.73, 0.22]}>
          <boxGeometry args={[0.49, 0.52, 0.06]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 12]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.49, 0.05, 0.4]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
      </group>
      <group
        position={[2.16, FLOOR, -1.44]}
        {...probe("Plant · detected room object")}
      >
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.25, 0.18, 0.5, 24]} />
          <meshStandardMaterial
            color="#aaa79a"
            metalness={0.15}
            roughness={0.62}
          />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.9, 8]} />
          <meshStandardMaterial color="#66695b" roughness={0.7} />
        </mesh>
      </group>
      <Instances limit={9} range={9}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial roughness={0.64} />
        {leaves.map((leaf, i) => (
          <Instance
            key={i}
            position={leaf.position}
            rotation={leaf.rotation}
            scale={[0.11, 0.34, 0.06]}
            color={i % 2 ? "#77766b" : "#55564c"}
          />
        ))}
      </Instances>
      <group position={[-2.9, FLOOR, -0.36]}>
        {[0.12, 0.67, 1.22, 1.77].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[0.52, 0.065, 2.7]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
        ))}
        {[-1.23, 1.23].map((z) => (
          <mesh key={z} position={[0, 0.92, z]}>
            <boxGeometry args={[0.055, 1.84, 0.055]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
        ))}
        <Instances limit={9} range={9}>
          <boxGeometry args={[0.38, 0.31, 0.47]} />
          <meshStandardMaterial metalness={0.4} roughness={0.5} />
          {Array.from({ length: 9 }, (_, i) => (
            <Instance
              key={i}
              position={[
                0,
                0.31 + Math.floor(i / 3) * 0.55,
                ((i % 3) - 1) * 0.73,
              ]}
              color={i % 2 ? "#4b4c43" : "#626357"}
            />
          ))}
        </Instances>
      </group>
      <mesh position={[0.72, FLOOR + 0.27, 0.36]}>
        <boxGeometry args={[0.53, 0.54, 1.22]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.72, FLOOR + 0.56, -0.02 + i * 0.35]}>
          <cylinderGeometry args={[0.14, 0.14, 0.07, 20]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      ))}
      <DetectionBox
        position={[-0.72, FLOOR + 0.83, -1.82]}
        size={[2.18, 1.7, 1.14]}
      />
      <DetectionBox
        position={[2.16, FLOOR + 0.83, -1.44]}
        size={[0.79, 1.68, 0.78]}
      />
      <DetectionBox
        position={[1.95, FLOOR + 1.08, -2.43]}
        size={[0.97, 2.17, 0.14]}
      />
    </group>
  );
}

function Federation({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) {
  const exchanges = useRef<Group>(null);
  const enabled = useExperience((s) => s.fedAvg);
  useFrame(({ clock }, delta) => {
    if (
      !active ||
      !enabled ||
      reduced ||
      useExperience.getState().paused ||
      !exchanges.current
    )
      return;
    exchanges.current.children.forEach((orb, i) => {
      const t = (clock.elapsedTime * 0.24 + i / 6) % 1;
      const angle = (Math.floor(i / 2) * Math.PI * 2) / 3;
      const distance = i % 2 ? t : 1 - t;
      orb.position.set(
        Math.cos(angle) * distance * 1.3,
        0.5 + Math.sin(t * Math.PI) * 0.45,
        Math.sin(angle) * distance * 0.65,
      );
      orb.rotation.y += Math.min(delta, 0.05);
    });
  });
  return (
    <group
      visible={enabled}
      position={[0.2, 0.7, 0.6]}
      {...probe("Illustrative FedAvg · weights move; raw data stays local")}
    >
      <mesh position={[0, 0.45, 0]}>
        <octahedronGeometry args={[0.2]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i * Math.PI * 2) / 3;
        const p: [number, number, number] = [
          Math.cos(a) * 1.3,
          0,
          Math.sin(a) * 0.65,
        ];
        return (
          <group key={i} position={p}>
            <Rover small />
            <Line
              points={[
                [0, 0.45, 0],
                [-p[0], 0.45, -p[2]],
              ]}
              color="#e4dfd2"
              transparent
              opacity={0.3}
              lineWidth={1}
            />
          </group>
        );
      })}
      <group ref={exchanges}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[Math.cos(i) * 0.7, 0.6, Math.sin(i) * 0.3]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshBasicMaterial color="#e8e4d8" />
          </mesh>
        ))}
      </group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.4, -0.02, 0.6]}>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.44, 16]} />
            <meshPhysicalMaterial
              color="#c8c4b8"
              transmission={0.72}
              thickness={0.07}
              roughness={0.12}
              transparent
              opacity={0.65}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
          {[0, 1, 2].map((n) => (
            <mesh key={n} position={[(n - 1) * 0.07, 0.12 + n * 0.08, 0]}>
              <boxGeometry args={[0.075, 0.12, 0.1]} />
              <meshStandardMaterial color="#4f5047" roughness={0.65} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function Omni({ active, mobile, reduced }: SceneProps) {
  const robotRun = useExperience((s) => s.robotRun);
  const robot = useRef<Group>(null);
  const sweep = useRef<Mesh>(null);
  const depth = useRef<ShaderMaterial>(null);
  const routeGoal = useRef<Goal>("plant");
  const currentCell = useRef<Cell>([4, 6]);
  const segment = useRef(0);
  const progress = useRef(0);
  const pending = useRef(false);
  const [route, setRoute] = useState<Cell[]>([]);
  const routePoints = useMemo(() => route.map(world), [route]);
  const depthGeometry = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < (mobile ? 280 : 900); i++) {
      const a = i * 2.39996;
      const r = Math.sqrt((i + 0.5) / (mobile ? 280 : 900));
      points.push(
        Math.cos(a) * r * 3.12,
        FLOOR + 0.03 + ((i * 19) % 13) * 0.004,
        Math.sin(a) * r * 2.3,
      );
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(points), 3),
    );
    return geometry;
  }, [mobile]);
  useEffect(() => () => depthGeometry.dispose(), [depthGeometry]);
  useEffect(() => {
    if (!robotRun) return;
    const state = useExperience.getState();
    routeGoal.current = state.goal;
    const planned = shortestRoomRoute(
      currentCell.current,
      ROOM_GOALS[state.goal],
    );
    state.set({
      robotStatus: "Planning a shortest route through the occupied room…",
    });
    segment.current = 0;
    progress.current = 0;
    setRoute(planned);
    pending.current = true;
    if (!planned.length) {
      pending.current = false;
      state.set({
        robotStatus:
          "Destination blocked. Choose another destination and plan again.",
      });
    }
  }, [robotRun]);
  useFrame(({ clock }, delta) => {
    const state = useExperience.getState();
    if (!active || state.paused) return;
    if (sweep.current && !reduced)
      sweep.current.rotation.z = clock.elapsedTime * 0.42;
    if (depth.current && !reduced)
      depth.current.uniforms.uScan.value = clock.elapsedTime * 0.42;
    if (!robot.current || !routePoints.length || !pending.current) return;
    if (reduced || routePoints.length === 1) {
      robot.current.position.copy(routePoints[routePoints.length - 1]);
      currentCell.current = route[route.length - 1];
      pending.current = false;
      state.set({
        robotStatus: `${routeGoal.current[0].toUpperCase() + routeGoal.current.slice(1)} reached. Route: ${route.length - 1} grid steps.`,
      });
      return;
    }
    if (segment.current === 0 && progress.current === 0)
      state.set({
        robotStatus: `Moving to the ${routeGoal.current} along ${route.length - 1} grid steps.`,
      });
    progress.current += Math.min(delta, 0.06) * 1.5;
    if (progress.current >= 1) {
      progress.current -= 1;
      segment.current++;
      currentCell.current = route[segment.current];
      if (segment.current >= routePoints.length - 1) {
        robot.current.position.copy(routePoints[routePoints.length - 1]);
        pending.current = false;
        state.set({
          robotStatus: `${routeGoal.current[0].toUpperCase() + routeGoal.current.slice(1)} reached. Route: ${route.length - 1} grid steps.`,
        });
        return;
      }
    }
    robot.current.position.lerpVectors(
      routePoints[segment.current],
      routePoints[segment.current + 1],
      progress.current,
    );
    const next = routePoints[segment.current + 1];
    const from = routePoints[segment.current];
    robot.current.rotation.y = Math.atan2(
      -(next.x - from.x),
      -(next.z - from.z),
    );
  });
  const start = world([4, 6]);
  return (
    <group
      position={mobile ? [0, 1.05, 0] : [2.2, -0.1, 0]}
      scale={mobile ? 0.53 : 0.9}
      rotation={[0.17, -0.23, 0]}
    >
      <Room />
      <points geometry={depthGeometry}>
        <shaderMaterial
          ref={depth}
          transparent
          depthWrite={false}
          uniforms={{
            uScan: { value: 0 },
            uReduced: { value: reduced ? 1 : 0 },
          }}
          vertexShader={`varying float vAngle; void main(){vAngle=atan(position.z,position.x);vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=clamp(2.2*12.0/max(1.0,-p.z),1.0,4.0);}`}
          fragmentShader={`uniform float uScan;uniform float uReduced;varying float vAngle;void main(){if(length(gl_PointCoord-0.5)>0.5)discard;float scan=pow(max(0.0,cos(vAngle-uScan)),18.0);gl_FragColor=vec4(0.76,0.75,0.69,mix(0.12+scan*0.65,0.35,uReduced));}`}
        />
      </points>
      {routePoints.length > 1 && (
        <Line
          points={routePoints}
          color="#e9e3d6"
          lineWidth={2}
          transparent
          opacity={0.8}
        />
      )}
      <group
        ref={robot}
        position={start}
        {...probe("Autonomous rover · shortest-path room navigation")}
      >
        <Rover />
        <mesh
          ref={sweep}
          position={[0, 0.055, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.78, 0.8, 48, 1, 0, Math.PI * 1.45]} />
          <meshBasicMaterial
            color="#d9d7c9"
            transparent
            opacity={0.32}
            depthWrite={false}
            side={2}
          />
        </mesh>
      </group>
      <Federation active={active} reduced={reduced} />
    </group>
  );
}
