// Image processing utilities - will be implemented in Pass 3
// Canvas manipulation, palette reduction, upscale, export

export type ResolutionPreset = "gameboy" | "snes" | "vga" | "original";

export const RESOLUTION_PRESETS: Record<ResolutionPreset, { w: number; h: number; label: string }> = {
  gameboy: { w: 160, h: 120, label: '160×120 "GameBoy"' },
  snes: { w: 320, h: 240, label: '320×240 "SNES"' },
  vga: { w: 640, h: 480, label: '640×480 "VGA"' },
  original: { w: 0, h: 0, label: "Original" },
};
