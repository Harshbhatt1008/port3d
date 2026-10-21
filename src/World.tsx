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
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  MathUtils,
  Vector3,
  type Group,
} from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { Training } from "./scenes/Training";
import Backdrop from "./scenes/Backdrop";
import { SCENE_GAP, useExperience } from "./state";
import { CHAPTER_SCALE, SCENE_COLORS } from "./sceneSettings";

const scenes = [
  lazy(() => import("./scenes/Hero").then((m) => ({ default: m.Hero }))),
  lazy(() => import("./scenes/Prism")),
  lazy(() => import("./scenes/Loom")),
  lazy(() => import("./scenes/InstaGuard")),
  lazy(() => import("./scenes/CodeReviewer")),
  lazy(() => import("./scenes/Omni")),
  lazy(() => import("./scenes/Journey")),
  lazy(() => import("./scenes/Portrait")),
];
const origins = [
  [0, 0],
  [3.8, -1.2],
  [-3, 1.2],
  [2.5, 0],
  [-2.8, 0.6],
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
// Scroll is the destination. Culling follows the camera's actual rail position.
// Keep the per-frame value outside React; only chapter crossings update the store.
const renderedRail = { progress: 0 };
// Authored object envelopes. Fit both axes, rather than clipping tall portraits.
const envelopes = [
  [6.7, 2.8],
  [10.5, 4.5],
  [6.6, 5],
  [7.7, 4.5],
  [8, 5],
  [8.1, 6.8],
  [7.8, 4.8],
  [5.9, 5.5],
];
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
  const { camera, gl, invalidate, frameloop } = useThree();
  const target = useMemo(() => new Vector3(), []),
    aim = useMemo(() => new Vector3(), []),
    timer = useRef({ time: 0, frames: 0 }),
    wasIntro = useRef(true);
  const renderer = useMemo(() => {
    const ctx = gl.getContext();
    if (navigator.userAgent.includes("Firefox"))
      return String(ctx.getParameter(ctx.RENDERER));
    const ext = ctx.getExtension("WEBGL_debug_renderer_info");
    return ext
      ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : "WebGL";
  }, [gl]);
  useEffect(() => useExperience.subscribe(() => invalidate()), [invalidate]);
  useEffect(() => {
    renderedRail.progress = useExperience.getState().progress;
    useExperience.getState().set({
      renderChapter: Math.round(renderedRail.progress),
    });
  }, []);
  useFrame((_, delta) => {
    const s = useExperience.getState();
    if (s.introRunning && !s.reduced) {
      const t = s.introTime,
        flight = MathUtils.smoothstep(t, 5.25, 6.6),
        z = MathUtils.lerp(12, -10, flight),
        aperture = Math.sin(flight * Math.PI),
        scale = s.mobile ? 0.46 : 1;
      camera.position.set(1.05 * scale * aperture, 0.65 * scale * aperture, z);
      const stamp = Math.max(0, 1 - Math.abs(t - 4.7) / 0.055);
      camera.position.x += Math.sin(t * 220) * stamp * 0.065;
      camera.position.y += Math.cos(t * 190) * stamp * 0.045;
      camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, z - 14);
    } else {
      // Smooth one rail coordinate, rather than easing position while instantly
      // aiming/culling at the destination. Pause still permits direct navigation.
      const direct = s.reduced || s.paused || wasIntro.current;
      renderedRail.progress = direct
        ? s.progress
        : MathUtils.damp(renderedRail.progress, s.progress, 8, delta);
      const moving = Math.abs(renderedRail.progress - s.progress) > 0.00001;
      if (!moving) renderedRail.progress = s.progress;
      originCurve.getPoint(
        MathUtils.clamp(renderedRail.progress / 7, 0, 1),
        aim,
      );
      target.copy(aim);
      target.y += 0.3;
      target.z += 12;
      camera.position.copy(target);
      camera.lookAt(aim);
      if (!s.reduced && !s.paused)
        camera.rotateZ(Math.sin(renderedRail.progress * Math.PI * 2) * 0.018);
      const renderChapter = Math.round(renderedRail.progress);
      if (s.renderChapter !== renderChapter) s.set({ renderChapter });
      if (s.cameraMoving !== moving) s.set({ cameraMoving: moving });
      if (moving) invalidate();
    }
    wasIntro.current = s.introRunning;
    gl.domElement.dataset.coords = camera.position
      .toArray()
      .map((n) => n.toFixed(2))
      .join(" / ");
    gl.domElement.dataset.chapter = String(s.chapter);
    gl.domElement.dataset.dpr = gl.getPixelRatio().toFixed(2);
    gl.domElement.dataset.dust = String(s.dustEnabled);
    gl.domElement.dataset.frameMode = frameloop;
    gl.domElement.dataset.railProgress = renderedRail.progress.toFixed(5);
    timer.current.time += delta;
    timer.current.frames++;
    if (timer.current.time >= 1) {
      window.__latentPerf = {
        fps: Math.round(timer.current.frames / timer.current.time),
        frames: timer.current.frames,
        dpr: gl.getPixelRatio(),
        renderer,
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
function LightRig() {
  const ref = useRef<Group>(null);
  useFrame(({ camera }) => {
    ref.current?.position.set(
      camera.position.x,
      camera.position.y,
      camera.position.z - 12,
    );
  });
  return (
    <group ref={ref}>
      <pointLight
        position={[4, 3, -3]}
        intensity={12}
        distance={18}
        decay={2}
        color="#eef5ff"
      />
      <rectAreaLight
        position={[3.7, 4, 5]}
        rotation={[-0.45, 0.3, 0]}
        width={3.5}
        height={5}
        intensity={3.2}
        color="#e7f0ff"
      />
      <rectAreaLight
        position={[-5, -1, 3]}
        rotation={[0, -0.5, 0]}
        width={2}
        height={6}
        intensity={1.3}
        color="#bccce0"
      />
    </group>
  );
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
  const ref = useRef<Group>(null),
    { size } = useThree();
  useFrame(() => {
    const s = useExperience.getState();
    if (ref.current)
      ref.current.visible =
        (!s.introRunning || s.introTime > 5.9) &&
        Math.abs(renderedRail.progress - index) < 0.8;
  });
  const [x, y] = origins[index],
    [w, h] = envelopes[index];
  // Fit the authored plane at the resting 12-unit camera distance, independent
  // of camera world coordinates after a deep-rail resize.
  const height = 2 * Math.tan((40 * Math.PI) / 360) * 12;
  const width = (height * size.width) / size.height;
  const fitWidth =
    mobile && index === 3 ? 5.8 : mobile && index === 4 ? 6.7 : w;
  const fittedScale = Math.min(
    (width * (mobile ? 0.9 : index === 0 ? 0.84 : 0.74)) / fitWidth,
    (height * (mobile ? 0.45 : index === 7 ? 0.62 : 0.7)) / h,
  );
  // The portrait has a fixed 4:5 bake and its own half-height framing.
  const scale =
    (index === 7 ? (height * 0.61) / 5.3 : fittedScale) * CHAPTER_SCALE[index];
  return (
    <group
      ref={ref}
      name={`chapter-${index}`}
      visible={false}
      position={[x, y, -SCENE_GAP * (index + 1)]}
    >
      <group
        scale={scale}
        position={[
          mobile ? 0 : width * (index === 7 ? 0.21 : index === 0 ? 0.15 : 0.16),
          mobile
            ? index === 7
              ? 1.32
              : index === 6
                ? 2.25
                : 1.35
            : index === 7
              ? 0.3
              : index === 5
                ? -0.8
                : index === 0
                  ? 0.2
                  : -0.1,
          0,
        ]}
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
    renderChapter = useExperience((s) => s.renderChapter),
    mobile = useExperience((s) => s.mobile),
    reduced = useExperience((s) => s.reduced),
    reader = useExperience((s) => s.reader),
    paused = useExperience((s) => s.paused),
    intro = useExperience((s) => s.introRunning),
    portraitBusy = useExperience((s) => s.portraitBusy),
    cameraMoving = useExperience((s) => s.cameraMoving);
  const [visible, setVisible] = useState(!document.hidden),
    [dpr, setDpr] = useState(Math.min(devicePixelRatio, 1.5)),
    [preloading, setPreloading] = useState(false);
  useEffect(() => {
    useLoader.preload(FontLoader, "/fonts/archivo-black.typeface.json");
    setPreloading(true);
  }, []);
  useEffect(() => {
    if (chapter >= 6)
      void import("./scenes/Portrait")
        .then((m) => m.preloadPortrait(mobile))
        .catch(() => {});
  }, [chapter, mobile]);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  if (reader) return null;
  const contactIdle =
    chapter === 7 && renderChapter === 7 && !portraitBusy && !cameraMoving;
  const contactSettled = chapter === 7 && renderChapter === 7 && !cameraMoving;
  return (
    <div className="world" aria-hidden="true" data-testid="world">
      <GraphicsBoundary>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 40, near: 0.05, far: 450 }}
          dpr={Math.min(dpr, chapter === 7 ? 1.25 : mobile ? 1.5 : 1.65)}
          frameloop={
            !visible
              ? "never"
              : !intro && (paused || reduced || contactIdle)
                ? "demand"
                : "always"
          }
          gl={{
            antialias: !mobile,
            alpha: false,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            // Keep shader diagnostics in dev. Querying ANGLE's compiler logs
            // synchronously stalls production startup even for valid programs.
            gl.debug.checkShaderErrors = import.meta.env.DEV;
            gl.setClearColor(SCENE_COLORS.ink950);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.78;
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
          fallback={<span>Use Read instead for the full portfolio.</span>}
        >
          <color attach="background" args={[SCENE_COLORS.ink950]} />
          <CameraRail />
          <LoadingStatus />
          <ambientLight intensity={0.32} color="#cedcee" />
          <LightRig />
          <Environment resolution={128} frames={1}>
            <Lightformer
              form="rect"
              color="#e5efff"
              intensity={4.2}
              scale={[mobile ? 0.3 : 0.8, 9, 1]}
              position={[mobile ? -0.35 : -1.6, 1, 5]}
              rotation={[0, 0, -0.35]}
            />
            <Lightformer
              form="rect"
              color="#bccce0"
              intensity={mobile ? 0.65 : 0.45}
              scale={[12, 8, 1]}
              position={[0, 0, 9]}
            />
            <Lightformer
              form="rect"
              color="#edf5ff"
              intensity={1.6}
              scale={[10, 1.3, 1]}
              position={[0, 6, 2]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <Lightformer
              form="rect"
              color="#d5e3f5"
              intensity={3.4}
              scale={[mobile ? 0.38 : 1.4, 10, 1]}
              position={[mobile ? 0.45 : 2, 0, 4]}
              rotation={[0, -Math.PI / 3, 0]}
            />
          </Environment>
          <PerformanceMonitor
            bounds={() => [50, 58]}
            flipflops={3}
            onDecline={() => {
              setDpr(1);
              if (
                !useExperience.getState().introRunning &&
                (mobile || navigator.hardwareConcurrency <= 4)
              )
                useExperience.getState().set({ hazeDisabled: true });
            }}
            onIncline={() => setDpr(mobile ? 1.25 : 1.5)}
            onFallback={() => {
              setDpr(1);
              useExperience.getState().set({ hazeDisabled: true });
            }}
          />
          <Backdrop mobile={mobile} reduced={reduced} />
          {preloading && (
            <Suspense fallback={null}>
              <Assets />
            </Suspense>
          )}
          <Training mobile={mobile} reduced={reduced} />
          {preloading &&
            scenes.map(
              (Scene, i) =>
                (contactSettled
                  ? i === 7
                  : Math.abs(renderChapter - i) <= 1 ||
                    Math.abs(chapter - i) <= 1) && (
                  <Room index={i} mobile={mobile} key={i}>
                    <Suspense fallback={null}>
                      <Scene
                        active={renderChapter === i}
                        mobile={mobile}
                        reduced={reduced}
                      />
                    </Suspense>
                  </Room>
                ),
            )}
          {!mobile && chapter !== 7 && dpr > 1.2 && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.075} luminanceThreshold={2.4} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      </GraphicsBoundary>
    </div>
  );
}
