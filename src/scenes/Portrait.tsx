import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  ShaderMaterial,
  Vector2,
} from "three";
import { useExperience, type SceneProps } from "../state";

type Baked = { face: Float32Array; hb: Float32Array; normals: Float32Array };
const cache = new Map<boolean, Promise<Baked>>();
export function preloadPortrait(mobile: boolean) {
  if (!cache.has(mobile)) {
    const suffix = mobile ? "-mobile" : "";
    cache.set(
      mobile,
      Promise.all([
        fetch(`/portrait-points${suffix}.bin`),
        fetch(`/hb-points${suffix}.bin`),
        fetch(`/portrait-normals${suffix}.bin`),
      ]).then(async (responses) => {
        if (responses.some((r) => !r.ok))
          throw Error("Baked portrait unavailable");
        const [face, hb, normals] = await Promise.all(
          responses.map((r) => r.arrayBuffer()),
        );
        return {
          face: new Float32Array(face),
          hb: new Float32Array(hb),
          normals: new Float32Array(normals),
        };
      }),
    );
  }
  return cache.get(mobile)!;
}
const vertex = `attribute vec3 aHB;attribute vec3 aNormal;attribute float aTone;attribute float aIndex;uniform float uMorph;uniform float uFinale;uniform float uNoise;uniform float uTime;uniform float uDpr;uniform float uPointScale;uniform vec2 uPointer;varying float vTone;varying float vLight;
float hash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
void main(){float seed=hash(aHB.x*17.+aHB.y*83.+aHB.z*251.);vec3 p=mix(aHB,position,uMorph);vec3 spread=vec3(hash(seed*137.)-.5,hash(seed*293.)-.5,hash(seed*613.)-.5)*vec3(8.,6.,3.5);spread+=sin(spread*1.4+uTime*.6)*.1;p=mix(p,spread,uNoise);
float a=aIndex*6.283185,b=fract(aIndex*278.164)*6.283185;float r=1.45+.5*cos(3.*a)+(aTone-.5)*.12;vec3 knot=vec3(r*cos(2.*a),r*sin(2.*a),sin(3.*a)*.85);knot+=vec3(cos(b)*.12,sin(b)*.12,sin(b)*.12);float turn=uTime*.13+uPointer.x*.35;knot.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*knot.xz;knot.y+=sin(a*5.+uTime*.5)*.06;p=mix(p,knot,uFinale);
float faceAmount=uMorph*(1.-uFinale);float angle=uPointer.x*(.035+.1*faceAmount)+sin(uMorph*3.14159)*.12*(1.-uFinale);float c=cos(angle),s=sin(angle);p.xz=mat2(c,-s,s,c)*p.xz;float pitch=uPointer.y*.05*faceAmount;float cp=cos(pitch),sp=sin(pitch);p.yz=mat2(cp,-sp,sp,cp)*p.yz;
vec3 n=aNormal;n.xz=mat2(c,-s,s,c)*n.xz;n.yz=mat2(cp,-sp,sp,cp)*n.yz;float key=max(0.,dot(normalize(n),normalize(vec3(-.5,.4,1.))));float rim=pow(1.-clamp(n.z,0.,1.),2.);vLight=mix(1.,.86+.16*key+.12*rim,faceAmount);vTone=mix(mix(.72,aTone,uMorph),.25+.75*hash(seed*499.),uFinale);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((.55+2.05*pow(clamp(vTone,0.,1.),.7))*uPointScale*uDpr*12./max(2.,-mv.z),.45,4.5);}`;
const fragment = `varying float vTone;varying float vLight;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float t=clamp(vTone,0.,1.);float a=(1.-d*d)*(.015+.96*pow(t,1.15));vec3 light=vec3(clamp((.137+.824*pow(t,.65))*vLight,0.,1.));gl_FragColor=vec4(light,a);}`;
const ease = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/** One Points, baked attributes, no image decode, canvas readback or CPU writes. */
export default function Portrait({ active, mobile, reduced }: SceneProps) {
  const { gl, invalidate } = useThree();
  const run = useExperience((s) => s.portraitRun);
  const finale = useExperience((s) => s.portraitFinale);
  const baked = useRef<Baked | null>(null),
    geometry = useRef<BufferGeometry | null>(null),
    time = useRef(0),
    pointer = useRef(new Vector2()),
    lastPointer = useRef(0),
    wasActive = useRef(false),
    retry = useRef(false);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uMorph: { value: reduced ? 1 : 0 },
          uFinale: { value: 0 },
          uNoise: { value: 0 },
          uTime: { value: 0 },
          uDpr: { value: 1 },
          uPointScale: { value: mobile ? 1.2 : 1 },
          uPointer: { value: new Vector2() },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
      }),
    [],
  );
  // Suspense-like cache: lazy data is fetched near Contact by the World; the tiny
  // attribute installation is the only main-thread setup and runs once per mount.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    preloadPortrait(mobile)
      .then((data) => {
        if (cancelled) return;
        baked.current = data;
        const g = new BufferGeometry(),
          interleaved = new InterleavedBuffer(data.face, 4);
        g.setAttribute(
          "position",
          new InterleavedBufferAttribute(interleaved, 3, 0),
        );
        g.setAttribute(
          "aTone",
          new InterleavedBufferAttribute(interleaved, 1, 3),
        );
        g.setAttribute("aHB", new BufferAttribute(data.hb, 3));
        g.setAttribute("aNormal", new BufferAttribute(data.normals, 3));
        // A continuous ordinal avoids float-hash collisions collapsing 45K
        // points into a few hundred positions in the final light sculpture.
        g.setAttribute(
          "aIndex",
          new BufferAttribute(
            Float32Array.from(
              { length: data.face.length / 4 },
              (_, i) => i / (data.face.length / 4),
            ),
            1,
          ),
        );
        g.computeBoundingSphere();
        geometry.current = g;
        setReady(true);
        useExperience
          .getState()
          .set({ portraitResolved: true, portraitBusy: active && !reduced });
        invalidate();
      })
      .catch(() =>
        useExperience.getState().set({ reader: true, portraitBusy: false }),
      );
    return () => {
      cancelled = true;
      geometry.current?.dispose();
      geometry.current = null;
    };
  }, [mobile, invalidate]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    if (active) {
      useExperience.getState().set({ portraitBusy: true });
      invalidate();
    }
  }, [finale, active, invalidate]);
  useEffect(() => {
    if (!active) {
      wasActive.current = false;
      return;
    }
    if (!wasActive.current || run) {
      time.current = 0;
      retry.current = run > 0;
      useExperience.getState().set({
        portraitBusy: !reduced,
        portraitPhase: reduced ? "resolved" : run ? "noise" : "hb",
      });
      invalidate();
    }
    wasActive.current = true;
  }, [active, run, reduced, invalidate]);
  useEffect(() => {
    if (!active || reduced) return;
    const move = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      pointer.current.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1),
      );
      lastPointer.current = performance.now();
      useExperience.getState().set({ portraitBusy: true });
      invalidate();
    };
    const leave = () => {
      pointer.current.set(0, 0);
      lastPointer.current = performance.now();
      useExperience.getState().set({ portraitBusy: true });
      invalidate();
    };
    gl.domElement.addEventListener("pointermove", move, { passive: true });
    gl.domElement.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      gl.domElement.removeEventListener("pointermove", move);
      gl.domElement.removeEventListener("pointerleave", leave);
    };
  }, [active, reduced, gl, invalidate]);
  useFrame((_, delta) => {
    if (!active || !geometry.current) return;
    const s = useExperience.getState();
    // Let the visitor arrive before the monogram starts becoming a person.
    if (!s.paused && !document.hidden && !s.cameraMoving)
      time.current += Math.min(delta, 0.05);
    const t = reduced ? 4.4 : time.current;
    const offset = retry.current ? 0.8 : 0;
    const morph = reduced ? 1 : ease(1.15 + offset, 3.7 + offset, t);
    const noise = reduced ? 0 : retry.current ? 1 - ease(0.45, 1.15, t) : 0;
    material.uniforms.uMorph.value = morph;
    const finalAmount = material.uniforms.uFinale;
    if (reduced || s.paused) finalAmount.value = finale ? 1 : 0;
    else if (!s.paused)
      finalAmount.value +=
        ((finale ? 1 : 0) - finalAmount.value) * (1 - Math.exp(-delta * 2.6));
    if (Math.abs(finalAmount.value - (finale ? 1 : 0)) < 0.0001)
      finalAmount.value = finale ? 1 : 0;
    gl.domElement.dataset.portraitFinale = finalAmount.value.toFixed(4);
    material.uniforms.uNoise.value = noise;
    material.uniforms.uTime.value = t;
    material.uniforms.uDpr.value = gl.getPixelRatio();
    material.uniforms.uPointScale.value = mobile ? 1.2 : 1;
    const p = material.uniforms.uPointer.value as Vector2;
    if (reduced) p.set(0, 0);
    else if (!s.paused) p.lerp(pointer.current, 1 - Math.exp(-delta * 5));
    const phase =
      noise > 0.01
        ? "noise"
        : morph === 0
          ? "hb"
          : morph < 1
            ? "morph"
            : "resolved";
    gl.domElement.dataset.portraitPhase = phase;
    gl.domElement.dataset.portraitTime = Math.min(
      4.4,
      Math.max(0, t - offset),
    ).toFixed(2);
    gl.domElement.dataset.portraitPoints = String(
      baked.current!.face.length / 4,
    );
    if (s.portraitPhase !== phase) s.set({ portraitPhase: phase });
    const moving =
      !reduced &&
      (finale ||
        finalAmount.value > 0.0001 ||
        t < 4.4 + offset ||
        p.distanceTo(pointer.current) > 0.0003 ||
        performance.now() - lastPointer.current < 180);
    if (moving && !s.paused) invalidate();
    if (s.portraitBusy !== moving) s.set({ portraitBusy: moving });
  });
  // The store's ready transition causes one React render, never a frame-by-frame update.
  return ready && geometry.current ? (
    <points
      name="portrait-points"
      geometry={geometry.current}
      material={material}
      frustumCulled={false}
      renderOrder={2}
    />
  ) : null;
}
