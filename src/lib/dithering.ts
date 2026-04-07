// =============================================================
// DitherY2K — Dithering algorithms (pure pixel manipulation)
// =============================================================

export type DitherAlgorithm =
  | "floyd-steinberg"
  | "atkinson"
  | "ordered"
  | "threshold";

export type DigicamColorCast = "none" | "warm" | "cool";

export interface DitherOptions {
  algorithm: DitherAlgorithm;
  colorCount: number; // 2–64
  threshold: number; // 0–255, used by threshold algo
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
}

export interface DigicamOptions {
  noise: number; // 0-100
  jpegQuality: number; // 0-100
  bloom: number; // 0-100
  colorCast: DigicamColorCast;
  vignette: boolean;
  chromatic: boolean;
  dateStamp: boolean;
}

export const DEFAULT_OPTIONS: DitherOptions = {
  algorithm: "floyd-steinberg",
  colorCount: 2,
  threshold: 128,
  brightness: 0,
  contrast: 0,
};

// ----- Color helpers -----

type RGB = [number, number, number];

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

/** Euclidean distance squared (no need for sqrt to compare) */
function colorDistSq(a: RGB, b: RGB): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function findClosestColor(color: RGB, palette: RGB[]): RGB {
  let best = palette[0];
  let bestDist = colorDistSq(color, best);
  for (let i = 1; i < palette.length; i++) {
    const d = colorDistSq(color, palette[i]);
    if (d < bestDist) {
      bestDist = d;
      best = palette[i];
    }
  }
  return best;
}

// ----- Palette generation (uniform quantization) -----

/**
 * Generate a uniform palette with `count` colors.
 * For count=2 → black & white.
 * Otherwise distributes evenly across RGB cube.
 */
export function generatePalette(count: number): RGB[] {
  if (count <= 2) return [[0, 0, 0], [255, 255, 255]];

  // Number of steps per channel: cube root rounded up
  const stepsPerChannel = Math.max(2, Math.ceil(Math.pow(count, 1 / 3)));
  const palette: RGB[] = [];

  outer:
  for (let r = 0; r < stepsPerChannel; r++) {
    for (let g = 0; g < stepsPerChannel; g++) {
      for (let b = 0; b < stepsPerChannel; b++) {
        if (palette.length >= count) break outer;
        palette.push([
          Math.round((r * 255) / (stepsPerChannel - 1)),
          Math.round((g * 255) / (stepsPerChannel - 1)),
          Math.round((b * 255) / (stepsPerChannel - 1)),
        ]);
      }
    }
  }

  return palette;
}

// ----- Brightness / Contrast adjustment -----

export function adjustBrightnessContrast(
  data: Uint8ClampedArray,
  brightness: number,
  contrast: number
): void {
  if (brightness === 0 && contrast === 0) return;

  // Contrast factor: maps -100..100 to multiplier
  const contrastFactor =
    contrast === 0 ? 1 : (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let v = data[i + c];
      // Apply brightness
      v += (brightness * 255) / 100;
      // Apply contrast
      v = contrastFactor * (v - 128) + 128;
      data[i + c] = clamp(v);
    }
  }
}

// =============================================================
// ALGORITHM 1 — Floyd-Steinberg Error Diffusion
// =============================================================
//
// Diffusion matrix:
//          *    7/16
//   3/16  5/16  1/16
//
// Scans left→right, top→bottom.

function floydSteinberg(
  pixels: Float32Array,
  w: number,
  h: number,
  palette: RGB[]
): void {
  const idx = (x: number, y: number) => (y * w + x) * 3;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(x, y);
      const oldR = pixels[i];
      const oldG = pixels[i + 1];
      const oldB = pixels[i + 2];

      const nearest = findClosestColor(
        [clamp(oldR), clamp(oldG), clamp(oldB)],
        palette
      );

      pixels[i] = nearest[0];
      pixels[i + 1] = nearest[1];
      pixels[i + 2] = nearest[2];

      const errR = oldR - nearest[0];
      const errG = oldG - nearest[1];
      const errB = oldB - nearest[2];

      // Distribute error to neighbours
      const spread = [
        [x + 1, y, 7 / 16],
        [x - 1, y + 1, 3 / 16],
        [x, y + 1, 5 / 16],
        [x + 1, y + 1, 1 / 16],
      ] as const;

      for (const [nx, ny, weight] of spread) {
        if (nx >= 0 && nx < w && ny < h) {
          const ni = idx(nx, ny);
          pixels[ni] += errR * weight;
          pixels[ni + 1] += errG * weight;
          pixels[ni + 2] += errB * weight;
        }
      }
    }
  }
}

// =============================================================
// ALGORITHM 2 — Atkinson (Apple/Mac style)
// =============================================================
//
// Only diffuses 6/8 of the error (more contrast).
// 1/8 each to 6 neighbours:
//
//        *   1/8  1/8
//   1/8  1/8  1/8
//        1/8

function atkinson(
  pixels: Float32Array,
  w: number,
  h: number,
  palette: RGB[]
): void {
  const idx = (x: number, y: number) => (y * w + x) * 3;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(x, y);
      const oldR = pixels[i];
      const oldG = pixels[i + 1];
      const oldB = pixels[i + 2];

      const nearest = findClosestColor(
        [clamp(oldR), clamp(oldG), clamp(oldB)],
        palette
      );

      pixels[i] = nearest[0];
      pixels[i + 1] = nearest[1];
      pixels[i + 2] = nearest[2];

      // Only 6/8 = 75% of error is diffused
      const errR = (oldR - nearest[0]) / 8;
      const errG = (oldG - nearest[1]) / 8;
      const errB = (oldB - nearest[2]) / 8;

      const neighbours: [number, number][] = [
        [x + 1, y],
        [x + 2, y],
        [x - 1, y + 1],
        [x, y + 1],
        [x + 1, y + 1],
        [x, y + 2],
      ];

      for (const [nx, ny] of neighbours) {
        if (nx >= 0 && nx < w && ny < h) {
          const ni = idx(nx, ny);
          pixels[ni] += errR;
          pixels[ni + 1] += errG;
          pixels[ni + 2] += errB;
        }
      }
    }
  }
}

// =============================================================
// ALGORITHM 3 — Ordered / Bayer 8×8
// =============================================================

const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

function orderedBayer(
  pixels: Float32Array,
  w: number,
  h: number,
  palette: RGB[]
): void {
  // Compute spread: how far apart the palette values are on average
  // This controls how much the Bayer offset influences quantization
  const spread = 255 / Math.max(1, palette.length - 1);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      // Bayer threshold normalized to -0.5..+0.5 range, scaled by spread
      const bayerValue = (BAYER_8X8[y & 7][x & 7] / 64 - 0.5) * spread;

      const adjusted: RGB = [
        clamp(pixels[i] + bayerValue),
        clamp(pixels[i + 1] + bayerValue),
        clamp(pixels[i + 2] + bayerValue),
      ];

      const nearest = findClosestColor(adjusted, palette);
      pixels[i] = nearest[0];
      pixels[i + 1] = nearest[1];
      pixels[i + 2] = nearest[2];
    }
  }
}

// =============================================================
// ALGORITHM 4 — Simple Threshold
// =============================================================

function thresholdDither(
  pixels: Float32Array,
  w: number,
  h: number,
  palette: RGB[],
  threshold: number
): void {
  // Sort palette by luminance to pick "dark" vs "light"
  const sorted = [...palette].sort((a, b) => {
    const lumA = 0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2];
    const lumB = 0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2];
    return lumA - lumB;
  });
  const darkColor = sorted[0];
  const lightColor = sorted[sorted.length - 1];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      const lum =
        0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      const chosen = lum >= threshold ? lightColor : darkColor;
      pixels[i] = chosen[0];
      pixels[i + 1] = chosen[1];
      pixels[i + 2] = chosen[2];
    }
  }
}

// =============================================================
// DIGICAM Y2K — Separate CCD camera simulation (no dithering)
// =============================================================

/** Deterministic xorshift PRNG seeded from pixel position */
function xorshift(seed: number): number {
  seed ^= seed << 13;
  seed ^= seed >> 17;
  seed ^= seed << 5;
  return seed;
}

function seededRandom(x: number, y: number, salt: number): number {
  let seed = ((x * 73856093) ^ (y * 19349663) ^ (salt * 83492791)) | 0;
  seed = xorshift(seed);
  return ((seed & 0xffff) / 0x7fff) - 1; // -1..1
}

/**
 * Apply digicam CCD effects to an ImageData (mutates in place).
 * This is a SEPARATE pipeline from dithering — no palette quantization.
 * Brightness/contrast should already be applied.
 */
export function applyDigicam(
  imageData: ImageData,
  opts: DigicamOptions
): void {
  const { width: w, height: h, data } = imageData;

  // Work in float space
  const pixels = new Float32Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    pixels[i * 3] = data[i * 4];
    pixels[i * 3 + 1] = data[i * 4 + 1];
    pixels[i * 3 + 2] = data[i * 4 + 2];
  }

  const idx = (x: number, y: number) => (y * w + x) * 3;

  // --- Effect 1: Subtle color cast (bad white balance) ---
  if (opts.colorCast !== "none") {
    // Subtle shifts — real digicams don't have extreme casts
    const shifts = opts.colorCast === "warm"
      ? [8, 2, -6]
      : [-3, 3, 10];
    for (let i = 0; i < pixels.length; i += 3) {
      pixels[i] += shifts[0];
      pixels[i + 1] += shifts[1];
      pixels[i + 2] += shifts[2];
    }
  }

  // --- Effect 2: CCD noise / grain ---
  if (opts.noise > 0) {
    const amp = opts.noise * 0.25; // subtler than before
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(x, y);
        const lumNoise = seededRandom(x, y, 0) * amp * 0.2;
        pixels[i] += seededRandom(x, y, 1) * amp * 0.7 + lumNoise;
        pixels[i + 1] += seededRandom(x, y, 2) * amp * 0.8 + lumNoise;
        pixels[i + 2] += seededRandom(x, y, 3) * amp * 1.2 + lumNoise;
      }
    }
  }

  // --- Effect 3: JPEG compression artifacts (8×8 blocking) ---
  if (opts.jpegQuality < 100) {
    // Scale influence: quality 100=none, 0=full block average
    const blockInfluence = Math.pow(1.0 - opts.jpegQuality / 100, 1.5) * 0.7;
    if (blockInfluence > 0.01) {
      for (let by = 0; by < h; by += 8) {
        for (let bx = 0; bx < w; bx += 8) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          const bh = Math.min(8, h - by);
          const bw = Math.min(8, w - bx);
          for (let dy = 0; dy < bh; dy++) {
            for (let dx = 0; dx < bw; dx++) {
              const i = idx(bx + dx, by + dy);
              sumR += pixels[i]; sumG += pixels[i + 1]; sumB += pixels[i + 2];
              count++;
            }
          }
          const avgR = sumR / count, avgG = sumG / count, avgB = sumB / count;
          for (let dy = 0; dy < bh; dy++) {
            for (let dx = 0; dx < bw; dx++) {
              const i = idx(bx + dx, by + dy);
              pixels[i] += (avgR - pixels[i]) * blockInfluence;
              pixels[i + 1] += (avgG - pixels[i + 1]) * blockInfluence;
              pixels[i + 2] += (avgB - pixels[i + 2]) * blockInfluence;
            }
          }
        }
      }
    }
  }

  // --- Effect 4: CCD bloom (vertical charge overflow) ---
  if (opts.bloom > 0) {
    const bloomRadius = Math.max(1, Math.floor(opts.bloom / 100 * 15));
    const bloomBuf = new Float32Array(w * h * 3);
    const threshold = 220; // only very bright pixels bloom

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(x, y);
        const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        if (lum > threshold) {
          const excess = (lum - threshold) * (opts.bloom / 100) * 0.5;
          // Vertical spread with gentle falloff
          for (let dy = -bloomRadius; dy <= bloomRadius; dy++) {
            const ny = y + dy;
            if (ny >= 0 && ny < h && dy !== 0) {
              const falloff = Math.exp(-Math.abs(dy) / (bloomRadius * 0.4 + 0.5));
              const ni = idx(x, ny);
              bloomBuf[ni] += excess * falloff * 0.2;
              bloomBuf[ni + 1] += excess * falloff * 0.2;
              bloomBuf[ni + 2] += excess * falloff * 0.2;
            }
          }
        }
      }
    }
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] += bloomBuf[i];
    }
  }

  // --- Effect 5: Chromatic aberration (RGB channel offset) ---
  if (opts.chromatic) {
    const offset = w >= 320 ? 2 : 1;
    const copy = new Float32Array(pixels);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(x, y);
        const rxSrc = Math.min(w - 1, Math.max(0, x - offset));
        pixels[i] = copy[idx(rxSrc, y)];
        const bxSrc = Math.min(w - 1, Math.max(0, x + offset));
        pixels[i + 2] = copy[idx(bxSrc, y) + 2];
      }
    }
  }

  // --- Effect 6: Vignetting (radial darkening) ---
  if (opts.vignette) {
    const cx = w / 2, cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const factor = 1.0 - 0.35 * Math.pow(dist / maxDist, 2.5);
        const i = idx(x, y);
        pixels[i] *= factor;
        pixels[i + 1] *= factor;
        pixels[i + 2] *= factor;
      }
    }
  }

  // Write back
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = clamp(pixels[i * 3]);
    data[i * 4 + 1] = clamp(pixels[i * 3 + 1]);
    data[i * 4 + 2] = clamp(pixels[i * 3 + 2]);
  }
}

// =============================================================
// Main entry point — apply dithering to ImageData
// =============================================================

/**
 * Apply dithering to an ImageData object (mutates in place).
 * Brightness/contrast should already be applied before calling this.
 */
export function applyDithering(
  imageData: ImageData,
  options: DitherOptions
): void {
  const { width, height, data } = imageData;
  const palette = generatePalette(options.colorCount);

  // Copy pixel data to float array for error diffusion precision
  const pixels = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 3] = data[i * 4];
    pixels[i * 3 + 1] = data[i * 4 + 1];
    pixels[i * 3 + 2] = data[i * 4 + 2];
  }

  // Apply chosen algorithm
  switch (options.algorithm) {
    case "floyd-steinberg":
      floydSteinberg(pixels, width, height, palette);
      break;
    case "atkinson":
      atkinson(pixels, width, height, palette);
      break;
    case "ordered":
      orderedBayer(pixels, width, height, palette);
      break;
    case "threshold":
      thresholdDither(pixels, width, height, palette, options.threshold);
      break;
  }

  // Write back to ImageData
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = clamp(pixels[i * 3]);
    data[i * 4 + 1] = clamp(pixels[i * 3 + 1]);
    data[i * 4 + 2] = clamp(pixels[i * 3 + 2]);
    // Alpha stays untouched
  }
}
