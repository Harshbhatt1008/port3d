import { ExtrudeGeometry, Path, Shape } from "three";

/** Original separated HB. This exact mesh also supplies the offline portrait bake. */
export const B_COUNTER = [1.05, 0.65, 0] as const;

/** Isolated deterministic surface stream: Contact reuses a prefix of the exact
 * loader points, regardless of the separate random/noise sampling around it. */
export function createMonogramRandom() {
  let seed = 1234567;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}

export function createMonogramGeometry() {
  const h = new Shape();
  h.moveTo(-2.5, -1.4);
  h.lineTo(-1.86, -1.4);
  h.lineTo(-1.86, -0.3);
  h.lineTo(-1.01, -0.3);
  h.lineTo(-1.01, -1.4);
  h.lineTo(-0.37, -1.4);
  h.lineTo(-0.37, 1.4);
  h.lineTo(-1.01, 1.4);
  h.lineTo(-1.01, 0.3);
  h.lineTo(-1.86, 0.3);
  h.lineTo(-1.86, 1.4);
  h.lineTo(-2.5, 1.4);
  h.closePath();

  const b = new Shape();
  b.moveTo(-0.03, -1.4);
  b.lineTo(1.08, -1.4);
  b.bezierCurveTo(2.5, -1.4, 2.63, -0.1, 1.77, 0.03);
  b.bezierCurveTo(2.51, 0.31, 2.28, 1.4, 1.1, 1.4);
  b.lineTo(-0.03, 1.4);
  b.closePath();

  const upper = new Path();
  upper.absellipse(
    B_COUNTER[0],
    B_COUNTER[1],
    0.46,
    0.36,
    0,
    Math.PI * 2,
    true,
    0,
  );
  const lower = new Path();
  lower.absellipse(1.08, -0.66, 0.55, 0.37, 0, Math.PI * 2, true, 0);
  b.holes.push(upper, lower);

  const geometry = new ExtrudeGeometry([h, b], {
    depth: 0.286,
    bevelEnabled: true,
    bevelSize: 0.039,
    bevelThickness: 0.03575,
    bevelSegments: 3,
    steps: 1,
    curveSegments: 24,
  });
  geometry.translate(0, 0, -0.143);
  geometry.computeVertexNormals();
  return geometry;
}
