// =============================================================
// DitherY2K — Image processing pipeline
// =============================================================

import {
  type DitherOptions,
  type DigicamOptions,
  applyDithering,
  applyDigicam,
  adjustBrightnessContrast,
} from "./dithering";

export type ResolutionPreset = "gameboy" | "snes" | "vga" | "original";

export const RESOLUTION_PRESETS: Record<
  ResolutionPreset,
  { w: number; h: number; label: string }
> = {
  gameboy: { w: 160, h: 120, label: '160×120 "GameBoy"' },
  snes: { w: 320, h: 240, label: '320×240 "SNES"' },
  vga: { w: 640, h: 480, label: '640×480 "VGA"' },
  original: { w: 0, h: 0, label: "Original" },
};

// ----- Load image from File -----

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

// ----- Resize to target resolution (maintains aspect ratio, fits inside) -----

function resizeImage(
  source: HTMLImageElement,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  if (targetW === 0 || targetH === 0) {
    canvas.width = source.naturalWidth;
    canvas.height = source.naturalHeight;
    ctx.drawImage(source, 0, 0);
    return canvas;
  }

  const srcRatio = source.naturalWidth / source.naturalHeight;
  const tgtRatio = targetW / targetH;

  let w: number, h: number;
  if (srcRatio > tgtRatio) {
    w = targetW;
    h = Math.round(targetW / srcRatio);
  } else {
    h = targetH;
    w = Math.round(targetH * srcRatio);
  }

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

// ----- Upscale nearest-neighbor -----

function upscaleNearestNeighbor(
  source: HTMLCanvasElement,
  factor: number
): HTMLCanvasElement {
  if (factor <= 1) return source;

  const canvas = document.createElement("canvas");
  canvas.width = source.width * factor;
  canvas.height = source.height * factor;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// ----- Processing options -----

export type ProcessingMode = "dither" | "digicam";

export interface ProcessingOptions {
  mode: ProcessingMode;
  resolution: ResolutionPreset;
  upscaleFactor: number;
  brightness: number;
  contrast: number;
  // Dither-specific
  dither: DitherOptions;
  // Digicam-specific
  digicam: DigicamOptions;
}

/**
 * Full pipeline: resize → brightness/contrast → (dither OR digicam) → [date stamp] → upscale.
 */
export function processImage(
  source: HTMLImageElement,
  options: ProcessingOptions
): { dithered: HTMLCanvasElement; final: HTMLCanvasElement } {
  const preset = RESOLUTION_PRESETS[options.resolution];

  // Step 1: Resize
  const resized = resizeImage(source, preset.w, preset.h);
  const ctx = resized.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, resized.width, resized.height);

  // Step 2: Brightness / Contrast
  adjustBrightnessContrast(imageData.data, options.brightness, options.contrast);

  // Step 3: Apply effect based on mode
  if (options.mode === "digicam") {
    applyDigicam(imageData, options.digicam);
  } else {
    applyDithering(imageData, options.dither);
  }

  // Write back
  ctx.putImageData(imageData, 0, 0);

  // Step 3.5: Date stamp (digicam only, before upscale for pixelated look)
  if (options.mode === "digicam" && options.digicam.dateStamp) {
    const fontSize = Math.max(8, Math.floor(resized.height * 0.04));
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.fillStyle = "rgba(255, 136, 0, 0.75)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("2003/04/07", resized.width - 4, resized.height - 3);
  }

  // Step 4: Upscale
  const final = upscaleNearestNeighbor(resized, options.upscaleFactor);

  return { dithered: resized, final };
}

// ----- Export to PNG -----

export function downloadPNG(
  canvas: HTMLCanvasElement,
  mode: string,
  detail: string
): void {
  const filename = `dithery2k_${mode}_${detail}.png`;
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
