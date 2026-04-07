// Dithering algorithms - will be implemented in Pass 2
// Floyd-Steinberg, Atkinson, Ordered/Bayer, Threshold

export type DitherAlgorithm = "floyd-steinberg" | "atkinson" | "ordered" | "threshold";

export interface DitherOptions {
  algorithm: DitherAlgorithm;
  colorCount: number;
  threshold: number;
  brightness: number;
  contrast: number;
}

export const DEFAULT_OPTIONS: DitherOptions = {
  algorithm: "floyd-steinberg",
  colorCount: 2,
  threshold: 128,
  brightness: 0,
  contrast: 0,
};
