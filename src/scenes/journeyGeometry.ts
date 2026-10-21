import { CatmullRomCurve3, Vector3 } from "three";
// A descending, folded ribbon. Its geometry is illustrative, not measured loss.
export const JOURNEY_CURVE = new CatmullRomCurve3(
  Array.from({ length: 24 }, (_, i) => {
    const t = i / 23,
      a = -1.1 + t * Math.PI * 2.1,
      r = 2.2 - 0.5 * t;
    return new Vector3(Math.cos(a) * r, 2.05 - t * 4.1, Math.sin(a) * r * 0.7);
  }),
);
export const JOURNEY_ANCHORS = Array.from({ length: 8 }, (_, i) =>
  JOURNEY_CURVE.getPoint(i / 7),
);
