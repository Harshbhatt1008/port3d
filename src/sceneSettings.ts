/** One authored size multiplier per chapter, relative to its responsive fit. */
export const CHAPTER_SCALE = [
  0.8, 0.82, 0.82, 0.82, 0.82, 0.82, 0.82, 0.82,
] as const;
export const STRUCTURE_GAUGE = 0.65;
export const DETAIL_CAPS = { high: 128, mobile: 36, low: 24 } as const;

/** Normative CSS tokens plus gamut-clipped sRGB equivalents for Three.js. */
export const SCENE_TOKENS = {
  ink950: "oklch(0.13 0.025 265)",
  ink900: "oklch(0.17 0.03 265)",
  ice50: "oklch(0.97 0.01 240)",
  ice300: "oklch(0.78 0.02 250)",
  signal: "oklch(0.72 0.19 40)",
  low: "oklch(0.8 0.15 165)",
  medium: "oklch(0.82 0.15 85)",
} as const;
export const SCENE_COLORS = {
  ink950: "#040711",
  ink900: "#090f1c",
  ice50: "#eff6fb",
  ice300: "#aeb9c4",
  signal: "#ff723a",
  low: "#41dca5",
  medium: "#f0bb3b",
} as const;
export const SCENE_LINEAR_INK = [
  0.0011400384, 0.0021125441, 0.0056891825,
] as const;
