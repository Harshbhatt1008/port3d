import { CatmullRomCurve3, Vector3 } from "three";
import { timeline } from "../content";
const source = new CatmullRomCurve3([
  new Vector3(-3.1, 1.8, -0.4),
  new Vector3(-2.25, 1.04, 0.12),
  new Vector3(-1.22, 0.42, 0.45),
  new Vector3(-0.18, -0.22, 0.15),
  new Vector3(0.92, -0.64, -0.27),
  new Vector3(2.02, -0.87, -0.05),
  new Vector3(3.02, -1.02, 0.32),
]);
export const JOURNEY_ANCHORS = timeline.map((_, i) =>
  source.getPoint(i / (timeline.length - 1)),
);
export const JOURNEY_CURVE = new CatmullRomCurve3(
  JOURNEY_ANCHORS,
  false,
  "catmullrom",
  0.4,
);
