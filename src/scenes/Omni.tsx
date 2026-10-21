import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances, Line } from "@react-three/drei";
import { Group, Mesh, Vector3 } from "three";
import { CHROME, DARK, probe, useExperience } from "../state";
import { Rod } from "./researchGeometry";
import { SceneLabel } from "./SceneLabel";
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

function Ultrasonic({
  active,
  reduced,
}: {
  active: boolean;
  reduced: boolean;
}) {
  const pulses = useRef<Group>(null),
    time = useRef(0);
  useFrame((_, delta) => {
    if (
      !active ||
      reduced ||
      useExperience.getState().paused ||
      !pulses.current
    )
      return;
    time.current += Math.min(delta, 0.05);
    pulses.current.children.forEach((pulse, i) => {
      const t = (time.current * 0.45 + i / 3) % 1;
      pulse.scale.setScalar(0.2 + t * 1.1);
      ((pulse as Mesh).material as import("three").MeshBasicMaterial).opacity =
        (1 - t) * 0.18;
    });
  });
  return (
    <group ref={pulses} position={[0, 0.15, -0.65]}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, -0.4 - i * 0.12]}
          scale={reduced ? 0.4 + i * 0.25 : 1}
        >
          <coneGeometry args={[0.65, 1.6, 24, 1, true]} />
          <meshBasicMaterial
            color="#c9c3b3"
            wireframe
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
function Heading() {
  return (
    <group position={[0, 0.85, 0]}>
      <Rod from={[0, 0, 0]} to={[0, 0, -0.75]} radius={0.025} color="#ddd6c7" />
      <mesh position={[0, 0, -0.82]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.25, 16]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
    </group>
  );
}
function Fusion({ active, reduced }: { active: boolean; reduced: boolean }) {
  const pulses = useRef<Group>(null),
    time = useRef(0);
  const sources: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ] = [
    [-1.5, 0.6, 0],
    [0, 0.6, 0],
    [1.5, 0.6, 0],
  ];
  useFrame((_, delta) => {
    if (
      !active ||
      reduced ||
      useExperience.getState().paused ||
      !pulses.current
    )
      return;
    time.current += Math.min(delta, 0.05);
    pulses.current.children.forEach((p, i) => {
      const t = (time.current * (0.5 - i * 0.1) + i * 0.3) % 1;
      p.position.set(sources[i][0] * (1 - t), 0.6 * (1 - t) - 0.4 * t, 0);
    });
  });
  return (
    <group position={[0, 2.6, -0.3]}>
      {sources.map((p, i) => (
        <group key={i}>
          <mesh position={p}>
            <boxGeometry args={[0.55, 0.22, 0.3]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
          <Rod from={p} to={[0, -0.4, 0]} radius={0.018 + i * 0.004} />
          <SceneLabel active={active} position={[p[0], p[1] + 0.42, p[2]]}>
            {["Camera", "Ultrasonic", "IMU"][i]}
          </SceneLabel>
        </group>
      ))}
      <mesh position={[0, -0.4, 0]}>
        <octahedronGeometry args={[0.23]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <group ref={pulses}>
        {sources.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshBasicMaterial color="#e8e1d1" />
          </mesh>
        ))}
      </group>
      <SceneLabel active={active} position={[0, -0.94, 0.1]}>
        Weighted fusion<small>illustrative stream balance</small>
      </SceneLabel>
    </group>
  );
}
function Fleet({ active, reduced }: { active: boolean; reduced: boolean }) {
  const ref = useRef<Group>(null),
    time = useRef(0);
  const centers: [number, number, number][] = [
    [-2.35, -0.2, 0.1],
    [0, 0.6, -0.6],
    [2.35, -0.2, 0.1],
  ];
  useFrame((_, delta) => {
    if (!active || reduced || useExperience.getState().paused || !ref.current)
      return;
    time.current += Math.min(delta, 0.05);
    ref.current.children.forEach((orb, i) => {
      const from = centers[Math.floor(i / 2) % 3],
        t = (time.current * 0.22 + i * 0.17) % 1;
      orb.position.set(
        from[0] * (1 - t),
        from[1] + 0.7 + Math.sin(t * Math.PI) * 1.2,
        from[2] * (1 - t),
      );
    });
  });
  return (
    <group>
      {centers.map((p, i) => (
        <group key={i} position={p}>
          <Rover />
          <Heading />
          {[-0.45, 0, 0.45].map((x, n) => (
            <group key={n} position={[x, 1.55, 0]}>
              <mesh>
                <boxGeometry args={[0.22, 0.22, 0.22]} />
                <meshStandardMaterial {...CHROME} />
              </mesh>
              <Rod from={[0, 0, 0]} to={[-x, -0.45, 0]} radius={0.014} />
            </group>
          ))}
          <mesh position={[0, 1.08, 0]}>
            <sphereGeometry args={[0.1, 12, 10]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
          <group position={[0.8, 0.15, 0.35]}>
            <mesh>
              <cylinderGeometry args={[0.23, 0.23, 0.52, 20]} />
              <meshPhysicalMaterial
                color="#c8c2b3"
                transmission={0.8}
                thickness={0.07}
                roughness={0.15}
                transparent
                opacity={0.7}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0, 0.29, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.05, 20]} />
              <meshStandardMaterial {...CHROME} />
            </mesh>
            {[0, 1, 2].map((n) => (
              <mesh key={n} position={[0, -0.13 + n * 0.12, 0]}>
                <boxGeometry args={[0.12, 0.08, 0.12]} />
                <meshStandardMaterial {...DARK} />
              </mesh>
            ))}
          </group>
          <SceneLabel active={active} position={[0, -0.55, 0.3]}>
            Robot {i + 1}
            <small>raw data stays local</small>
          </SceneLabel>
        </group>
      ))}
      <group ref={ref}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.075, 12, 10]} />
            <meshBasicMaterial color="#e7dfce" />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 2.3, 0]}>
        <octahedronGeometry args={[0.35]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      {centers.map((p, i) => (
        <Rod
          key={i}
          from={[p[0], p[1] + 0.7, p[2]]}
          to={[0, 2.3, 0]}
          radius={0.012}
          opacity={0.4}
        />
      ))}
      <SceneLabel active={active} position={[0, 3.05, 0]}>
        Tier2 / fleet FedAvg
      </SceneLabel>
      <SceneLabel active={active} position={[-2.35, 2.1, 0.2]}>
        Tier1 / sensor modules
      </SceneLabel>
    </group>
  );
}
export default function Omni({ active, reduced }: SceneProps) {
  const robotRun = useExperience((s) => s.robotRun),
    fed = useExperience((s) => s.fedAvg);
  const robot = useRef<Group>(null),
    routeGoal = useRef<Goal>("plant"),
    currentCell = useRef<Cell>([4, 6]),
    segment = useRef(0),
    progress = useRef(0),
    pending = useRef(false);
  const [route, setRoute] = useState<Cell[]>([]),
    routePoints = useMemo(() => route.map(world), [route]);
  useEffect(() => {
    if (!robotRun) return;
    const s = useExperience.getState();
    routeGoal.current = s.goal;
    const plan = shortestRoomRoute(currentCell.current, ROOM_GOALS[s.goal]);
    segment.current = 0;
    progress.current = 0;
    pending.current = true;
    setRoute(plan);
    s.set({
      robotStatus: plan.length
        ? "Planning a shortest route through the occupied room…"
        : "Destination blocked. Choose another destination.",
    });
    if (!plan.length) pending.current = false;
  }, [robotRun]);
  useFrame((_, delta) => {
    if (
      !active ||
      fed ||
      useExperience.getState().paused ||
      !robot.current ||
      !routePoints.length ||
      !pending.current
    )
      return;
    const finish = () => {
      robot.current!.position.copy(routePoints[routePoints.length - 1]);
      currentCell.current = route[route.length - 1];
      pending.current = false;
      useExperience.getState().set({
        robotStatus:
          routeGoal.current[0].toUpperCase() +
          routeGoal.current.slice(1) +
          " reached. Route: " +
          (route.length - 1) +
          " grid steps.",
      });
    };
    if (reduced || routePoints.length === 1) {
      finish();
      return;
    }
    if (segment.current === 0 && progress.current === 0)
      useExperience.getState().set({
        robotStatus:
          "Moving to the " +
          routeGoal.current +
          " along " +
          (route.length - 1) +
          " grid steps.",
      });
    progress.current += Math.min(delta, 0.06) * 1.5;
    if (progress.current >= 1) {
      progress.current -= 1;
      segment.current++;
      currentCell.current = route[segment.current];
      if (segment.current >= routePoints.length - 1) {
        finish();
        return;
      }
    }
    const from = routePoints[segment.current],
      to = routePoints[segment.current + 1];
    robot.current.position.lerpVectors(from, to, progress.current);
    robot.current.rotation.y = Math.atan2(-(to.x - from.x), -(to.z - from.z));
  });
  return (
    <group rotation={[0.17, -0.23, 0]}>
      <group visible={!fed}>
        <Room />
        <Fusion active={active && !fed} reduced={reduced} />
        {routePoints.length > 1 && (
          <Line
            points={routePoints}
            color="#e4ddcd"
            lineWidth={2}
            transparent
            opacity={0.8}
          />
        )}
        <group
          ref={robot}
          position={world([4, 6])}
          {...probe("Rover · ultrasonic depth and IMU heading")}
        >
          <Rover />
          <Ultrasonic active={active && !fed} reduced={reduced} />
          <Heading />
        </group>
        <SceneLabel active={active && !fed} position={[-1.2, -0.5, 2.3]}>
          Ultrasonic cones + IMU heading
        </SceneLabel>
      </group>
      <group visible={fed}>
        <Fleet active={active && fed} reduced={reduced} />
      </group>
    </group>
  );
}
