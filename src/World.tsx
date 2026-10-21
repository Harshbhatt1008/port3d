import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  PerformanceMonitor,
  useProgress,
} from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  CatmullRomCurve3,
  MathUtils,
  TextureLoader,
  Vector3,
  type Group,
} from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { Training } from "./scenes/Training";
import { SCENE_GAP, useExperience } from "./state";
import { profile } from "./content";

const scenes = [
  lazy(() => import("./scenes/Hero").then((m) => ({ default: m.Hero }))),
  lazy(() => import("./scenes/Prism")),
  lazy(() => import("./scenes/Loom")),
  lazy(() => import("./scenes/Signals")),
  lazy(() => import("./scenes/Omni")),
  lazy(() => import("./scenes/Journey")),
  lazy(() => import("./scenes/Portrait")),
];
// The rail bends between rooms; resting poses retain a clear reading axis.
const origins = [
  [0, 0],
  [3.8, -1.2],
  [-3, 1.2],
  [2.5, 0],
  [-1.5, -1],
  [3, -2],
  [0, 0],
];
const originCurve = new CatmullRomCurve3(
  origins.map(([x, y], i) => new Vector3(x, y, -SCENE_GAP * (i + 1))),
  false,
  "catmullrom",
  0.35,
);
declare global {
  interface Window {
    __latentPerf?: {
      fps: number;
      frames: number;
      dpr: number;
      renderer: string;
      drawCalls: number;
      triangles: number;
      points: number;
    };
    __latentLenis?: {
      scrollTo: (
        target: number | string | HTMLElement,
        options?: object,
      ) => void;
    };
  }
}

function Assets() {
  useLoader(FontLoader, "/fonts/archivo-black.typeface.json");
  useLoader(TextureLoader, profile.portrait);
  useEffect(() => {
    useExperience.getState().set({ assetsReady: true });
  }, []);
  return null;
}
function LoadingStatus() {
  const progress = useProgress((s) => s.progress);
  useEffect(() => {
    useExperience.getState().set({ assetProgress: progress });
  }, [progress]);
  return null;
}

function CameraRail() {
  const { camera, gl, invalidate } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const aim = useMemo(() => new Vector3(), []);
  const timer = useRef({ time: 0, frames: 0 });
  const wasIntro = useRef(true);
  const rendererName = useMemo(() => {
    const ctx = gl.getContext();
    const ext = ctx.getExtension("WEBGL_debug_renderer_info");
    return ext
      ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : "WebGL renderer";
  }, [gl]);
  useEffect(() => useExperience.subscribe(() => invalidate()), [invalidate]);
  useFrame((_, delta) => {
    const s = useExperience.getState();
    if (s.introRunning && !s.reduced) {
      const t = s.introTime;
      // A continuous counter flight joins the same world's first camera pose.
      const flight = MathUtils.smoothstep(t, 5.1, 6.6);
      const z = MathUtils.lerp(12, -10, flight);
      const aperture = Math.sin(flight * Math.PI);
      camera.position.set(1.05 * aperture, 0.65 * aperture, z);
      const stamp = Math.max(0, 1 - Math.abs(t - 4.72) / 0.08);
      camera.position.x += Math.sin(t * 220) * stamp * 0.055;
      camera.position.y += Math.cos(t * 190) * stamp * 0.035;
      camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, z - 14);
    } else {
      originCurve.getPoint(MathUtils.clamp(s.progress / 6, 0, 1), aim);
      target.copy(aim);
      target.y += 0.3;
      target.z += 12;
      const blend = s.reduced ? 1 : 1 - Math.exp(-delta * 8);
      if (wasIntro.current) camera.position.copy(target);
      else camera.position.lerp(target, blend);
      camera.lookAt(aim);
      if (!s.reduced)
        camera.rotateZ(Math.sin(s.progress * Math.PI * 2) * 0.025);
    }
    wasIntro.current = s.introRunning;
    gl.domElement.dataset.coords = camera.position
      .toArray()
      .map((n) => n.toFixed(2))
      .join(" / ");
    // Actual renderer samples, not a promised or simulated FPS value.
    timer.current.time += delta;
    timer.current.frames++;
    if (timer.current.time >= 1) {
      window.__latentPerf = {
        fps: Math.round(timer.current.frames / timer.current.time),
        frames: timer.current.frames,
        dpr: gl.getPixelRatio(),
        renderer: rendererName,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        points: gl.info.render.points,
      };
      timer.current = { time: 0, frames: 0 };
    }
    gl.info.reset();
  });
  return null;
}

function Room({
  index,
  mobile,
  children,
}: {
  index: number;
  mobile: boolean;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const s = useExperience.getState();
    if (ref.current)
      ref.current.visible =
        (!s.introRunning || s.introTime > 5.6) &&
        Math.abs(s.progress - index) < 0.8;
  });
  const [x, y] = origins[index];
  const scale = mobile
    ? index === 6
      ? 0.7
      : index === 0 || index === 5
        ? 0.75
        : 0.8
    : 1;
  return (
    <group
      ref={ref}
      visible={false}
      position={[x, y, -SCENE_GAP * (index + 1)]}
    >
      <group
        position={mobile ? [0, index === 6 ? -1.05 : -0.65, 0] : [0, 0, 0]}
        scale={scale}
      >
        {children}
      </group>
    </group>
  );
}

class GraphicsBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useExperience.getState().set({ reader: true, introRunning: false });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function World() {
  const chapter = useExperience((s) => s.chapter),
    mobile = useExperience((s) => s.mobile),
    reduced = useExperience((s) => s.reduced),
    reader = useExperience((s) => s.reader),
    paused = useExperience((s) => s.paused),
    intro = useExperience((s) => s.introRunning);
  const [visible, setVisible] = useState(!document.hidden);
  const [dpr, setDpr] = useState(Math.min(devicePixelRatio, 1.5));
  const [preloading, setPreloading] = useState(false);
  useEffect(() => {
    useLoader.preload(FontLoader, "/fonts/archivo-black.typeface.json");
    useLoader.preload(TextureLoader, profile.portrait);
    setPreloading(true);
  }, []);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  if (reader) return null;
  return (
    <div className="world" aria-hidden="true" data-testid="world">
      <GraphicsBoundary>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 40, near: 0.05, far: 230 }}
          dpr={Math.min(dpr, mobile ? 1.5 : 1.75)}
          frameloop={
            !visible
              ? "never"
              : !intro && (paused || reduced)
                ? "demand"
                : "always"
          }
          gl={{
            antialias: !mobile,
            alpha: false,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor("#171612");
            gl.info.autoReset = false;
            gl.domElement.addEventListener(
              "webglcontextlost",
              () =>
                useExperience
                  .getState()
                  .set({ reader: true, introRunning: false }),
              { once: true },
            );
          }}
          fallback={
            <span>Use “Read instead” for the complete text portfolio.</span>
          }
        >
          <color attach="background" args={["#171612"]} />
          <fog attach="fog" args={["#171612", 30, 85]} />
          <CameraRail />
          <LoadingStatus />
          <ambientLight intensity={1.2} color="#e4dfd2" />
          <directionalLight
            position={[8, 12, 10]}
            intensity={2.3}
            color="#e4dfd2"
          />
          <directionalLight
            position={[-8, 6, 2]}
            intensity={1}
            color="#c8c4b9"
          />
          <Environment resolution={128} frames={1}>
            <Lightformer
              form="rect"
              color="#eeece3"
              intensity={2.5}
              scale={[3.2, 5, 1]}
              position={[1, 1, 7]}
            />
            <Lightformer
              form="rect"
              color="#dedbd2"
              intensity={0.35}
              scale={[14, 8, 1]}
              position={[-1, 1, 9]}
            />
            <Lightformer
              form="rect"
              color="#eeece3"
              intensity={4}
              scale={[16, 4, 1]}
              position={[0, 6, 4]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <Lightformer
              form="rect"
              color="#dedbd2"
              intensity={3}
              scale={[4, 14, 1]}
              position={[-7, 0, 2]}
              rotation={[0, Math.PI / 2, 0]}
            />
            <Lightformer
              form="rect"
              color="#f3f0e7"
              intensity={2}
              scale={[10, 2, 1]}
              position={[4, -3, -4]}
            />
          </Environment>
          <PerformanceMonitor
            bounds={() => [38, 58]}
            flipflops={3}
            onDecline={() => setDpr(mobile ? 1 : 1.15)}
            onIncline={() => setDpr(mobile ? 1.25 : 1.5)}
            onFallback={() => setDpr(1)}
          />
          {preloading && (
            <Suspense fallback={null}>
              <Assets />
            </Suspense>
          )}
          <Training mobile={mobile} reduced={reduced} />
          {preloading &&
            scenes.map(
              (Scene, i) =>
                Math.abs(chapter - i) <= 1 && (
                  <Room index={i} mobile={mobile} key={i}>
                    <Suspense fallback={null}>
                      <Scene
                        active={chapter === i}
                        mobile={mobile}
                        reduced={reduced}
                      />
                    </Suspense>
                  </Room>
                ),
            )}
          {!mobile && dpr > 1.2 && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.12} luminanceThreshold={2.2} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      </GraphicsBoundary>
    </div>
  );
}
