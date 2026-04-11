// =============================================================
// DitherY2K — Image processing pipeline
// =============================================================

import {
  type DitherOptions,
  applyDithering,
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

// ----- Resize -----

function resizeImage(
  source: HTMLImageElement,
  targetW: number,
  targetH: number,
  crop: { sx: number; sy: number; sw: number; sh: number }
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  if (targetW === 0 || targetH === 0) {
    canvas.width = crop.sw;
    canvas.height = crop.sh;
    ctx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, crop.sw, crop.sh);
    return canvas;
  }

  const maxSide = Math.max(targetW, targetH);
  let w: number, h: number;
  if (crop.sw >= crop.sh) {
    w = maxSide;
    h = Math.round(maxSide * (crop.sh / crop.sw));
  } else {
    h = maxSide;
    w = Math.round(maxSide * (crop.sw / crop.sh));
  }

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
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

// ----- Crop -----

export type CropRatio = "free" | "1:1" | "3:4" | "4:3";

function cropToRatio(
  source: HTMLImageElement,
  ratio: CropRatio
): { sx: number; sy: number; sw: number; sh: number } {
  const srcW = source.naturalWidth;
  const srcH = source.naturalHeight;
  if (ratio === "free") return { sx: 0, sy: 0, sw: srcW, sh: srcH };

  let targetRatio: number;
  switch (ratio) {
    case "1:1": targetRatio = 1; break;
    case "3:4": targetRatio = 3 / 4; break;
    case "4:3": targetRatio = 4 / 3; break;
    default: targetRatio = srcW / srcH;
  }

  const srcRatio = srcW / srcH;
  let sw: number, sh: number;
  if (srcRatio > targetRatio) {
    sh = srcH; sw = Math.round(srcH * targetRatio);
  } else {
    sw = srcW; sh = Math.round(srcW / targetRatio);
  }
  return { sx: Math.round((srcW - sw) / 2), sy: Math.round((srcH - sh) / 2), sw, sh };
}

// ----- Processing options -----

export interface ProcessingOptions {
  resolution: ResolutionPreset;
  cropRatio: CropRatio;
  upscaleFactor: number;
  brightness: number;
  contrast: number;
  dither: DitherOptions;
}

/**
 * Pipeline: crop → resize → brightness/contrast → dither → upscale.
 */
export function processImage(
  source: HTMLImageElement,
  options: ProcessingOptions
): { dithered: HTMLCanvasElement; final: HTMLCanvasElement } {
  const preset = RESOLUTION_PRESETS[options.resolution];
  const crop = cropToRatio(source, options.cropRatio);
  const resized = resizeImage(source, preset.w, preset.h, crop);
  const ctx = resized.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, resized.width, resized.height);

  adjustBrightnessContrast(imageData.data, options.brightness, options.contrast);
  applyDithering(imageData, options.dither);
  ctx.putImageData(imageData, 0, 0);

  const final = upscaleNearestNeighbor(resized, options.upscaleFactor);
  return { dithered: resized, final };
}

// ----- Export to PNG -----

export function downloadPNG(
  canvas: HTMLCanvasElement,
  algorithm: string,
  colorCount: number
): void {
  const filename = `dithery2k_${algorithm}_${colorCount}c.png`;
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
