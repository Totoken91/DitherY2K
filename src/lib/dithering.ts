// =============================================================
// DitherY2K — Dithering algorithms (pure pixel manipulation)
// =============================================================

export type DitherAlgorithm =
  | "floyd-steinberg"
  | "atkinson"
  | "ordered"
  | "threshold";

export type DigicamColorCast = "none" | "warm" | "cool" | "green";

export type PaletteMode = "auto" | "gameboy" | "cga" | "ega" | "grayscale";

export interface DitherOptions {
  algorithm: DitherAlgorithm;
  colorCount: number; // 2–64
  paletteMode: PaletteMode;
  threshold: number; // 0–255, used by threshold algo
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
}

// ----- Preset palettes -----

const PALETTE_GAMEBOY: RGB[] = [
  [15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15],
];

const PALETTE_CGA: RGB[] = [
  [0, 0, 0], [85, 255, 255], [255, 85, 255], [255, 255, 255],
];

const PALETTE_EGA: RGB[] = [
  [0,0,0], [0,0,170], [0,170,0], [0,170,170],
  [170,0,0], [170,0,170], [170,85,0], [170,170,170],
  [85,85,85], [85,85,255], [85,255,85], [85,255,255],
  [255,85,85], [255,85,255], [255,255,85], [255,255,255],
];

function generateGrayscale(count: number): RGB[] {
  const palette: RGB[] = [];
  for (let i = 0; i < count; i++) {
    const v = Math.round((i * 255) / (count - 1));
    palette.push([v, v, v]);
  }
  return palette;
}

function getPresetPalette(mode: PaletteMode, colorCount: number, imageData?: ImageData): RGB[] {
  switch (mode) {
    case "gameboy": return PALETTE_GAMEBOY;
    case "cga": return PALETTE_CGA;
    case "ega": return PALETTE_EGA;
    case "grayscale": return generateGrayscale(Math.max(2, Math.min(colorCount, 64)));
    case "auto":
    default:
      return generatePalette(colorCount, imageData);
  }
}

export interface DigicamOptions {
  noise: number; // 0-100
  jpegQuality: number; // 0-100
  bloom: number; // 0-100
  colorCast: DigicamColorCast;
  vignette: boolean;
  chromatic: boolean;
  dateStamp: boolean;
  barrelDistortion: number; // 0-100, maps to k1 = 0 to 0.25
  blur: number; // 0-100, maps to radius 0 to 3px
  saturationBoost: number; // 0-100, maps to +0% to +30%
  dynamicRangeCompress: boolean;
}

export const DEFAULT_OPTIONS: DitherOptions = {
  algorithm: "floyd-steinberg",
  colorCount: 16,
  paletteMode: "auto",
  threshold: 128,
  brightness: 0,
  contrast: 0,
};

// ----- Color helpers -----

type RGB = [number, number, number];

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

/** Perceptual color distance (weighted for human eye sensitivity) */
function colorDistSq(a: RGB, b: RGB): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  // Green is most sensitive, red next, blue least
  return dr * dr * 2 + dg * dg * 4 + db * db * 3;
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

// ----- Palette generation: Median Cut -----

/**
 * Generate an adaptive palette from image data using Median Cut.
 * Samples pixels from the image and finds the best N representative colors.
 */
export function generatePalette(count: number, imageData?: ImageData): RGB[] {
  if (count <= 2) return [[0, 0, 0], [255, 255, 255]];

  // If no image data provided, fall back to uniform palette
  if (!imageData) return generateUniformPalette(count);

  // Sample pixels from the image (cap at 20000 for performance)
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const sampleCount = Math.min(totalPixels, 20000);
  const step = Math.max(1, Math.floor(totalPixels / sampleCount));

  const samples: RGB[] = [];
  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4;
    samples.push([data[idx], data[idx + 1], data[idx + 2]]);
  }

  return medianCut(samples, count);
}

function generateUniformPalette(count: number): RGB[] {
  const stepsPerChannel = Math.max(2, Math.ceil(Math.pow(count, 1 / 3)));
  const palette: RGB[] = [];
  for (let r = 0; r < stepsPerChannel; r++) {
    for (let g = 0; g < stepsPerChannel; g++) {
      for (let b = 0; b < stepsPerChannel; b++) {
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

function medianCut(pixels: RGB[], numColors: number): RGB[] {
  if (pixels.length === 0) return [[0, 0, 0]];

  let boxes: RGB[][] = [pixels];
  let iteration = 0;

  while (boxes.length < numColors) {
    // Alternate strategy: even iterations split by largest range,
    // odd iterations split by most pixels. This gives more palette
    // entries to dense clusters (skin tones, sky) while still
    // covering the full color range.
    const byPopulation = iteration % 2 === 1;
    iteration++;

    let bestIdx = 0;

    if (byPopulation) {
      // Find the splittable box with the most pixels
      let maxPop = -1;
      for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].length > 1 && boxes[i].length > maxPop) {
          maxPop = boxes[i].length;
          bestIdx = i;
        }
      }
    } else {
      // Find the box with the largest color range
      let largestRange = -1;
      for (let i = 0; i < boxes.length; i++) {
        const box = boxes[i];
        if (box.length <= 1) continue;
        for (let ch = 0; ch < 3; ch++) {
          let min = 255, max = 0;
          for (const p of box) {
            if (p[ch] < min) min = p[ch];
            if (p[ch] > max) max = p[ch];
          }
          if (max - min > largestRange) {
            largestRange = max - min;
            bestIdx = i;
          }
        }
      }
    }

    const box = boxes[bestIdx];
    if (!box || box.length <= 1) break;

    // Find the channel with the largest range in this box
    let splitCh = 0;
    let maxRange = -1;
    for (let ch = 0; ch < 3; ch++) {
      let min = 255, max = 0;
      for (const p of box) {
        if (p[ch] < min) min = p[ch];
        if (p[ch] > max) max = p[ch];
      }
      if (max - min > maxRange) {
        maxRange = max - min;
        splitCh = ch;
      }
    }

    // Sort by that channel and split at median
    box.sort((a, b) => a[splitCh] - b[splitCh]);
    const mid = Math.floor(box.length / 2);

    boxes.splice(bestIdx, 1, box.slice(0, mid), box.slice(mid));
  }

  // Average color of each box = palette entry
  return boxes.map((box) => {
    let r = 0, g = 0, b = 0;
    for (const p of box) {
      r += p[0]; g += p[1]; b += p[2];
    }
    const n = box.length;
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)] as RGB;
  });
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
  // Spread proportional to step size between palette levels.
  // For N colors, levels per channel ≈ cbrt(N), step ≈ 256/levels.
  const levelsPerChannel = Math.max(2, Math.ceil(Math.pow(palette.length, 1 / 3)));
  const spread = 256 / levelsPerChannel;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      // Bayer threshold: normalize matrix value to -0.5..+0.5, scale by spread
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
 * 10 effects simulating early 2000s digital camera artifacts.
 */
export function applyDigicam(
  imageData: ImageData,
  opts: DigicamOptions
): void {
  const { width: w, height: h, data } = imageData;
  const pixels = new Float32Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    pixels[i * 3] = data[i * 4];
    pixels[i * 3 + 1] = data[i * 4 + 1];
    pixels[i * 3 + 2] = data[i * 4 + 2];
  }
  const idx = (x: number, y: number) => (y * w + x) * 3;

  // --- 1. Dynamic range compression (early sensors ~6 stops) ---
  if (opts.dynamicRangeCompress) {
    const lo = 25, hi = 220;
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = lo + (pixels[i] / 255) * (hi - lo);
    }
  }

  // --- 2. Color cast (bad white balance) ---
  if (opts.colorCast !== "none") {
    const shifts =
      opts.colorCast === "warm" ? [8, 2, -6] :
      opts.colorCast === "green" ? [-4, 6, 4] :
      [-3, 3, 10]; // cool
    for (let i = 0; i < pixels.length; i += 3) {
      pixels[i] += shifts[0];
      pixels[i + 1] += shifts[1];
      pixels[i + 2] += shifts[2];
    }
  }

  // --- 3. Saturation boost (CCD "pop" colors) ---
  if (opts.saturationBoost > 0) {
    const boost = 1 + (opts.saturationBoost / 100) * 0.3;
    for (let i = 0; i < pixels.length; i += 3) {
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      pixels[i] = gray + (r - gray) * boost;
      pixels[i + 1] = gray + (g - gray) * boost;
      pixels[i + 2] = gray + (b - gray) * boost;
    }
  }

  // --- 4. Radial lens blur (cheap plastic lens softness) ---
  if (opts.blur > 0) {
    const maxRadius = Math.max(1, Math.round((opts.blur / 100) * 3));
    const cx = w / 2, cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    // Horizontal pass with radial radius
    const hBuf = new Float32Array(pixels);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
        const r = Math.max(1, Math.round(0.3 * maxRadius + dist * dist * maxRadius * 0.7));
        let sR = 0, sG = 0, sB = 0, c = 0;
        for (let dx = -r; dx <= r; dx++) {
          const nx = Math.min(w - 1, Math.max(0, x + dx));
          const ni = idx(nx, y);
          sR += pixels[ni]; sG += pixels[ni + 1]; sB += pixels[ni + 2]; c++;
        }
        const oi = idx(x, y);
        hBuf[oi] = sR / c; hBuf[oi + 1] = sG / c; hBuf[oi + 2] = sB / c;
      }
    }
    // Vertical pass
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist;
        const r = Math.max(1, Math.round(0.3 * maxRadius + dist * dist * maxRadius * 0.7));
        let sR = 0, sG = 0, sB = 0, c = 0;
        for (let dy = -r; dy <= r; dy++) {
          const ny = Math.min(h - 1, Math.max(0, y + dy));
          const ni = idx(x, ny);
          sR += hBuf[ni]; sG += hBuf[ni + 1]; sB += hBuf[ni + 2]; c++;
        }
        const oi = idx(x, y);
        pixels[oi] = sR / c; pixels[oi + 1] = sG / c; pixels[oi + 2] = sB / c;
      }
    }
  }

  // --- 5. CCD noise / grain ---
  if (opts.noise > 0) {
    const amp = opts.noise * 0.25;
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

  // --- 6. JPEG compression artifacts (8x8 blocking) ---
  if (opts.jpegQuality < 100) {
    const blockInfluence = Math.pow(1.0 - opts.jpegQuality / 100, 1.5) * 0.7;
    if (blockInfluence > 0.01) {
      for (let by = 0; by < h; by += 8) {
        for (let bx = 0; bx < w; bx += 8) {
          let sR = 0, sG = 0, sB = 0, c = 0;
          const bh = Math.min(8, h - by), bw = Math.min(8, w - bx);
          for (let dy = 0; dy < bh; dy++) {
            for (let dx = 0; dx < bw; dx++) {
              const i = idx(bx + dx, by + dy);
              sR += pixels[i]; sG += pixels[i + 1]; sB += pixels[i + 2]; c++;
            }
          }
          const aR = sR / c, aG = sG / c, aB = sB / c;
          for (let dy = 0; dy < bh; dy++) {
            for (let dx = 0; dx < bw; dx++) {
              const i = idx(bx + dx, by + dy);
              pixels[i] += (aR - pixels[i]) * blockInfluence;
              pixels[i + 1] += (aG - pixels[i + 1]) * blockInfluence;
              pixels[i + 2] += (aB - pixels[i + 2]) * blockInfluence;
            }
          }
        }
      }
    }
  }

  // --- 7. CCD bloom (vertical charge overflow) ---
  if (opts.bloom > 0) {
    const bloomRadius = Math.max(1, Math.floor(opts.bloom / 100 * 15));
    const bloomBuf = new Float32Array(w * h * 3);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(x, y);
        const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
        if (lum > 220) {
          const excess = (lum - 220) * (opts.bloom / 100) * 0.5;
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
    for (let i = 0; i < pixels.length; i++) pixels[i] += bloomBuf[i];
  }

  // --- 8. Radial chromatic aberration ---
  if (opts.chromatic) {
    const maxOffset = w >= 640 ? 3 : w >= 320 ? 2 : 1;
    const cx = w / 2, cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const copy = new Float32Array(pixels);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = idx(x, y);
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nd = dist / maxDist;
        const offset = nd * nd * maxOffset;
        const dirX = dist > 0 ? dx / dist : 0;
        const dirY = dist > 0 ? dy / dist : 0;
        // R: shift outward
        const rsx = Math.round(Math.min(w - 1, Math.max(0, x - dirX * offset)));
        const rsy = Math.round(Math.min(h - 1, Math.max(0, y - dirY * offset)));
        pixels[i] = copy[idx(rsx, rsy)];
        pixels[i + 1] = copy[i + 1]; // G stays
        // B: shift inward
        const bsx = Math.round(Math.min(w - 1, Math.max(0, x + dirX * offset)));
        const bsy = Math.round(Math.min(h - 1, Math.max(0, y + dirY * offset)));
        pixels[i + 2] = copy[idx(bsx, bsy) + 2];
      }
    }
  }

  // --- 9. Vignetting ---
  if (opts.vignette) {
    const cx = w / 2, cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const factor = 1.0 - 0.35 * Math.pow(dist / maxDist, 2.5);
        const i = idx(x, y);
        pixels[i] *= factor; pixels[i + 1] *= factor; pixels[i + 2] *= factor;
      }
    }
  }

  // --- 10. Barrel distortion ---
  if (opts.barrelDistortion > 0) {
    const k1 = (opts.barrelDistortion / 100) * 0.25;
    const k2 = k1 * 0.1;
    const cx = w / 2, cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);
    const copy = new Float32Array(pixels);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = (x - cx) / maxR, ny = (y - cy) / maxR;
        const r2 = nx * nx + ny * ny;
        const distort = 1 + k1 * r2 + k2 * r2 * r2;
        const srcX = cx + (x - cx) * distort;
        const srcY = cy + (y - cy) * distort;
        const sx = Math.floor(srcX), sy = Math.floor(srcY);
        const fx = srcX - sx, fy = srcY - sy;
        const di = idx(x, y);
        if (sx >= 0 && sx < w - 1 && sy >= 0 && sy < h - 1) {
          const i00 = idx(sx, sy), i10 = idx(sx + 1, sy);
          const i01 = idx(sx, sy + 1), i11 = idx(sx + 1, sy + 1);
          for (let c = 0; c < 3; c++) {
            const top = copy[i00 + c] * (1 - fx) + copy[i10 + c] * fx;
            const bot = copy[i01 + c] * (1 - fx) + copy[i11 + c] * fx;
            pixels[di + c] = top * (1 - fy) + bot * fy;
          }
        } else {
          pixels[di] = 0; pixels[di + 1] = 0; pixels[di + 2] = 0;
        }
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
  const palette = getPresetPalette(options.paletteMode, options.colorCount, imageData);

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
