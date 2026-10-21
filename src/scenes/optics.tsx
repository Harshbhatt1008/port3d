import { useEffect, useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, type Vector3 } from "three";

// Reflection-only optical shells: no screen-space transmission passes.
export function OpticalGlass({ opacity = 0.38 }: { opacity?: number }) {
  return (
    <meshPhysicalMaterial
      color="#c3d0df"
      metalness={0.28}
      roughness={0.12}
      clearcoat={1}
      clearcoatRoughness={0.08}
      envMapIntensity={2.1}
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  );
}
export function FineLines({
  segments,
  opacity = 0.5,
}: {
  segments: number[];
  opacity?: number;
}) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(segments, 3));
    return g;
  }, [segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#c2cedd" transparent opacity={opacity} />
    </lineSegments>
  );
}
export function curveSegments(points: Vector3[]) {
  return points
    .slice(1)
    .flatMap((p, i) => [...points[i].toArray(), ...p.toArray()]);
}
export function dialSegments(radius: number, count: number, z = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2,
      r = radius + (i % 5 === 0 ? 0.1 : 0.045);
    return [
      Math.cos(a) * radius,
      Math.sin(a) * radius,
      z,
      Math.cos(a) * r,
      Math.sin(a) * r,
      z,
    ];
  }).flat();
}
