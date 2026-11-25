/** Identifiers and initial entries for the shared matrix presets. */
import { IDENTITY, type Mat2 } from "./LinearAlgebra.js";

export const PRESET_IDS = [
  "custom",
  "identity",
  "rotation90",
  "rotation45",
  "scale",
  "shear",
  "reflectX",
  "reflectDiagonal",
  "projectX",
  "singular",
  "symmetric",
  "rotationScale",
] as const;

export type PresetId = (typeof PRESET_IDS)[number];

export const PRESETS: Record<Exclude<PresetId, "custom">, Mat2> = {
  identity: IDENTITY,
  rotation90: [0, -1, 1, 0],
  rotation45: [0.71, -0.71, 0.71, 0.71],
  scale: [2, 0, 0, 0.5],
  shear: [1, 1, 0, 1],
  reflectX: [1, 0, 0, -1],
  reflectDiagonal: [0, 1, 1, 0],
  projectX: [1, 0, 0, 0],
  singular: [1, 2, 0.5, 1],
  symmetric: [2, 1, 1, 2],
  rotationScale: [1, -1, 1, 1],
};
