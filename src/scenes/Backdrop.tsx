import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  ShaderMaterial,
} from "three";
import { useExperience } from "../state";
import { dustPosition } from "./dustData";
import { SCENE_LINEAR_INK } from "../sceneSettings";

const skyVertex = `varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const skyFragment = `
varying vec3 vP; uniform float uTime; uniform float uDensity; uniform float uChapter;
float hash(vec3 p){p=fract(p*.3183099+vec3(.13,.27,.41));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<2;i++){s+=a*noise(p);p=p*2.03+vec3(11.3,7.7,3.1);a*=.5;}return s*1.2;}
void main(){vec3 p=normalize(vP)*3.1+vec3(uChapter*.31,uChapter*-.17,uTime*.008);float field=fbm(p);float veil=smoothstep(.28,.76,field)*uDensity;
// Linear ink, converted exactly once with or without postprocessing.
float contour=1.-smoothstep(.025,.09,abs(sin(field*17.+normalize(vP).z*3.)));
vec3 ground=vec3(${SCENE_LINEAR_INK.join(",")});vec3 ink=ground+vec3(.006,.008,.012)*veil+vec3(.003)*contour*veil;gl_FragColor=vec4(ink,1.);
#include <colorspace_fragment>
}
`;
const dustVertex = `attribute float aSeed;uniform float uTime;uniform float uDensity;uniform float uTight;uniform float uDpr;varying float vAlpha;void main(){vec3 p=position;p.xy*=uTight;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((9.+aSeed*12.)*uDpr/max(10.,-mv.z),.75,1.9);vAlpha=uDensity*(.1+aSeed*.12)*(1.+sin(uTime*.18+aSeed*41.)*.025);vAlpha*=smoothstep(3.,17.,-mv.z);}`;
const dustFragment = `varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5||vAlpha<.001)discard;gl_FragColor=vec4(.58,.64,.72,(1.-smoothstep(.12,.5,d))*vAlpha);
#include <colorspace_fragment>
}`;
const fieldVertex = `attribute float aLayer;uniform float uCameraZ;uniform float uTravel;varying float vAlong;varying float vFade;
void main(){vec3 p=position;p.z+=uCameraZ-14.-mod(aLayer*18.-uTravel+9000.,90.);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;vFade=smoothstep(8.,19.,d)*(1.-smoothstep(75.,103.,d));vAlong=position.x*.19+aLayer*.8;}`;
const fieldFragment = `uniform float uTime;uniform float uDensity;varying float vAlong;varying float vFade;
void main(){float sweep=pow(max(0.,sin(vAlong-uTime*.16)),18.);gl_FragColor=vec4(.42,.48,.56,(.11+sweep*.13)*uDensity*vFade);
#include <colorspace_fragment>
}`;
const density = [0.8, 0.85, 0.8, 0.75, 0.75, 0.82, 0.78, 0.12];
export default function Backdrop({
  mobile,
  reduced,
}: {
  mobile: boolean;
  reduced: boolean;
}) {
  const root = useRef<Group>(null),
    sky = useRef<Mesh>(null);
  const elapsed = useRef(0);
  const enabled = useExperience((s) => s.dustEnabled),
    disabled = useExperience((s) => s.hazeDisabled);
  const geometry = useMemo(() => {
    const count = mobile ? 1050 : 4200,
      p = new Float32Array(count * 3),
      seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p.set(dustPosition(i), i * 3);
      seeds[i] = (i * 0.618033) % 1;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(p, 3));
    g.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    return g;
  }, [mobile]);
  const contours = useMemo(() => {
    const positions: number[] = [],
      layers: number[] = [];
    const rows = mobile ? 4 : 7,
      steps = 96;
    const point = (layer: number, row: number, t: number) => [
      (t - 0.5) * 68,
      Math.sin(t * Math.PI * 1.6 + layer * 0.65) * 7 +
        (row - (rows - 1) / 2) * 0.75,
      Math.sin(t * Math.PI * 2 + row * 0.18) * 2.5,
    ];
    for (let layer = 0; layer < 5; layer++)
      for (let row = 0; row < rows; row++)
        for (let j = 0; j < steps; j++) {
          positions.push(
            ...point(layer, row, j / steps),
            ...point(layer, row, (j + 1) / steps),
          );
          layers.push(layer, layer);
        }
    const g = new BufferGeometry();
    g.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(positions), 3),
    );
    g.setAttribute("aLayer", new BufferAttribute(new Float32Array(layers), 1));
    return g;
  }, [mobile]);
  const field = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: fieldVertex,
        fragmentShader: fieldFragment,
        uniforms: {
          uCameraZ: { value: 0 },
          uTravel: { value: 0 },
          uTime: { value: 0 },
          uDensity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
      }),
    [],
  );
  const haze = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        uniforms: {
          uTime: { value: 0 },
          uDensity: { value: 0.65 },
          uChapter: { value: 0 },
        },
        side: BackSide,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  const dust = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        uniforms: {
          uTime: { value: 0 },
          uDensity: { value: 0 },
          uTight: { value: 1 },
          uDpr: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      contours.dispose();
    },
    [geometry, contours],
  );
  useEffect(
    () => () => {
      haze.dispose();
      dust.dispose();
      field.dispose();
    },
    [haze, dust, field],
  );
  useFrame(({ camera, gl }, delta) => {
    const s = useExperience.getState();
    if (!s.paused && !reduced && !document.hidden)
      elapsed.current += Math.min(delta, 0.05);
    const intro = s.introRunning
      ? Math.max(0, Math.min(1, (s.introTime - 5.6) / 1))
      : 1;
    const target = density[s.chapter] * intro;
    const blend = reduced || s.paused ? 1 : 1 - Math.exp(-delta * 2);
    haze.uniforms.uDensity.value +=
      (target - haze.uniforms.uDensity.value) * blend;
    haze.uniforms.uTime.value = elapsed.current;
    haze.uniforms.uChapter.value = s.progress;
    dust.uniforms.uDensity.value = haze.uniforms.uDensity.value;
    dust.uniforms.uTime.value = elapsed.current;
    dust.uniforms.uTight.value = 0.86 + Math.sin(s.progress * 0.7) * 0.16;
    dust.uniforms.uDpr.value = gl.getPixelRatio();
    if (root.current)
      root.current.position.copy(camera.position).multiplyScalar(0.08);
    field.uniforms.uCameraZ.value =
      camera.position.z - (root.current?.position.z ?? 0);
    field.uniforms.uTravel.value = -camera.position.z;
    field.uniforms.uTime.value = elapsed.current;
    field.uniforms.uDensity.value = haze.uniforms.uDensity.value;
    if (sky.current) sky.current.visible = enabled && !disabled;
  });
  return (
    <group ref={root} name="laboratory-background" visible={enabled}>
      <mesh ref={sky} material={haze} renderOrder={-1000} frustumCulled={false}>
        <sphereGeometry args={[205, 24, 16]} />
      </mesh>
      <points
        geometry={geometry}
        material={dust}
        renderOrder={-999}
        frustumCulled={false}
      />
      <lineSegments
        name="laboratory-contours"
        geometry={contours}
        material={field}
        renderOrder={-998}
        frustumCulled={false}
      />
    </group>
  );
}
