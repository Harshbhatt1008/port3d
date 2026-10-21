import {
  BufferGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Path,
  Shape,
  Vector3,
} from "three";

/** A pierced, bent optical folio; the counter survives extrusion and folding. */
export function archiveLeaf() {
  const s = new Shape();
  s.moveTo(-0.45, -1.45);
  s.quadraticCurveTo(-0.64, -1.25, -0.57, -0.8);
  s.lineTo(-0.5, 1.25);
  s.quadraticCurveTo(-0.35, 1.68, 0.1, 1.52);
  s.lineTo(0.55, 1.2);
  s.quadraticCurveTo(0.7, 0.9, 0.5, 0.54);
  s.lineTo(0.48, -1.2);
  s.quadraticCurveTo(0.3, -1.58, -0.45, -1.45);
  const aperture = new Path();
  aperture.absellipse(0, 0.27, 0.22, 0.64, 0, Math.PI * 2, true, 0);
  s.holes.push(aperture);
  const g = new ExtrudeGeometry(s, {
    depth: 0.035,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.014,
    bevelThickness: 0.014,
    steps: 1,
    curveSegments: 16,
  });
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i);
    p.setZ(
      i,
      p.getZ(i) + x * x * 0.33 + Math.abs(x + y * 0.18) * 0.15 + y * y * 0.035,
    );
  }
  g.computeVertexNormals();
  const outline = new EdgesGeometry(g, 28),
    marks = [...outline.getAttribute("position").array];
  for (let i = 0; i < 10; i++) {
    const y = -1.12 + i * 0.075,
      x = -0.32,
      z = x * x * 0.33 + Math.abs(x + y * 0.18) * 0.15 + y * y * 0.035 + 0.075;
    marks.push(x, y, z, x + 0.3 + (i % 3) * 0.06, y, z - 0.015);
  }
  marks.push(
    -0.37,
    1.15,
    0.2,
    -0.37,
    0.42,
    0.12,
    0.34,
    -0.65,
    0.15,
    0.34,
    -1.1,
    0.22,
  );
  const edge = new BufferGeometry();
  edge.setAttribute("position", new Float32BufferAttribute(marks, 3));
  outline.dispose();
  return { body: g, edge };
}
export const ARCHIVE_ANCHORS = Array.from({ length: 8 }, (_, i) => {
  const t = i / 7;
  return new Vector3(
    (t - 0.5) * 3.85,
    Math.sin(t * Math.PI) * 0.75 - 0.4,
    Math.cos(t * Math.PI) * 0.65,
  );
});
