import { create } from "zustand";
export type ExperienceState = {
  progress: number;
  chapter: number;
  renderChapter: number;
  flying: boolean;
  introRunning: boolean;
  introTime: number;
  assetsReady: boolean;
  assetProgress: number;
  reduced: boolean;
  mobile: boolean;
  reader: boolean;
  paused: boolean;
  sound: boolean;
  hoverLabel: string;
  sampleIndex: number;
  historyIndex: number;
  boundary: number;
  signalMode: "guard" | "review";
  fileIndex: number;
  goal: "plant" | "desk" | "door";
  robotRun: number;
  robotStatus: string;
  fedAvg: boolean;
  nodeIndex: number;
  toolIndex: number;
  portraitResolved: boolean;
  portraitRun: number;
  portraitBusy: boolean;
  portraitPhase: "hb" | "morph" | "resolved" | "noise";
  cameraMoving: boolean;
  dustEnabled: boolean;
  hazeDisabled: boolean;
  notesOpen: boolean;
  guardSample: number;
  set: (patch: Partial<Omit<ExperienceState, "set">>) => void;
};
export const useExperience = create<ExperienceState>()((set) => ({
  progress: 0,
  chapter: 0,
  renderChapter: 0,
  flying: false,
  introRunning: true,
  introTime: 0,
  assetsReady: false,
  assetProgress: 0,
  reduced:
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  mobile:
    typeof matchMedia !== "undefined" &&
    matchMedia("(max-width: 700px)").matches,
  reader: false,
  paused: false,
  sound: false,
  hoverLabel: "",
  sampleIndex: 0,
  historyIndex: 0,
  boundary: 0.5,
  signalMode: "guard",
  fileIndex: 0,
  goal: "plant",
  robotRun: 0,
  robotStatus: "Choose a destination. Plan a route.",
  fedAvg: false,
  nodeIndex: 0,
  toolIndex: 0,
  portraitResolved: true,
  portraitRun: 0,
  portraitBusy: false,
  portraitPhase: "hb",
  cameraMoving: false,
  dustEnabled:
    !new URLSearchParams(location.search).has("dust") ||
    new URLSearchParams(location.search).get("dust") !== "off",
  hazeDisabled: false,
  notesOpen: false,
  guardSample: 0,
  set: (patch) => set(patch),
}));
export type SceneProps = { active: boolean; mobile: boolean; reduced: boolean };
export const SCENE_GAP = 22;
export const CHROME = { color: "#c9c6bd", metalness: 1, roughness: 0.2 };
export const DARK = { color: "#252520", metalness: 0.7, roughness: 0.28 };
export function probe(label: string) {
  return {
    onPointerOver: () => useExperience.getState().set({ hoverLabel: label }),
    onPointerOut: () => useExperience.getState().set({ hoverLabel: "" }),
  };
}
