import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type { ColorRepresentation } from "three";

export type Point = [number, number, number];

/** A true cylindrical connection; dimensions are resolved once, never in the frame loop. */
export function Rod({
  from,
  to,
  radius = 0.014,
  color = "#c9c6bd",
  opacity = 1,
  glow = 0,
}: {
  from: Point;
  to: Point;
  radius?: number;
  color?: ColorRepresentation;
  opacity?: number;
  glow?: number;
}) {
  const transform = useMemo(() => {
    const start = new Vector3(...from);
    const end = new Vector3(...to);
    return {
      center: start.clone().add(end).multiplyScalar(0.5),
      length: start.distanceTo(end),
      rotation: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        end.sub(start).normalize(),
      ),
    };
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);
  return (
    <mesh position={transform.center} quaternion={transform.rotation}>
      <cylinderGeometry args={[radius, radius, transform.length, 7]} />
      <meshStandardMaterial
        color={color}
        metalness={0.7}
        roughness={0.26}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={color}
        emissiveIntensity={glow}
        depthWrite={opacity >= 1}
      />
    </mesh>
  );
}

export const particleVertex = /* glsl */ `
  attribute float seed;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float travel = fract(seed + uTime * 0.13);
    p.x = mix(-3.2, -0.45, travel);
    p.y += sin(travel * 6.283 + seed * 19.0) * 0.028;
    vAlpha = sin(travel * 3.14159) * 0.8;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = min(5.0, uSize * (12.0 / -viewPosition.z));
  }
`;

export const particleFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * vAlpha;
    if (a < 0.025) discard;
    gl_FragColor = vec4(0.91, 0.89, 0.83, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
