"use client";

import { useRef } from "react";
import { type DitherAlgorithm, type PaletteMode, getPresetColors } from "@/lib/dithering";
import {
  type ResolutionPreset,
  type CropRatio,
  RESOLUTION_PRESETS,
} from "@/lib/image-processing";

export interface ControlValues {
  resolution: ResolutionPreset;
  cropRatio: CropRatio;
  upscaleEnabled: boolean;
  upscaleFactor: number;
  brightness: number;
  contrast: number;
  algorithm: DitherAlgorithm;
  colorCount: number;
  paletteMode: PaletteMode;
  customPalette: string[];
  threshold: number;
}

interface ControlsProps {
  values: ControlValues;
  onChange: (values: ControlValues) => void;
  onDownload: () => void;
  hasImage: boolean;
}

interface QuickPreset {
  label: string;
  algorithm: DitherAlgorithm;
  palette: PaletteMode;
  resolution: ResolutionPreset;
  upscale: boolean;
  upscaleFactor: number;
}

const QUICK_PRESETS: Record<string, QuickPreset> = {
  "pc98vn": { label: "PC-98 Visual Novel", algorithm: "ordered", palette: "ega", resolution: "vga", upscale: false, upscaleFactor: 1 },
  "gameboycam": { label: "Game Boy Camera", algorithm: "ordered", palette: "gameboy", resolution: "gameboy", upscale: true, upscaleFactor: 3 },
  "macclassic": { label: "Mac Classic", algorithm: "atkinson", palette: "bw", resolution: "snes", upscale: true, upscaleFactor: 2 },
  "c64load": { label: "Commodore 64", algorithm: "floyd-steinberg", palette: "c64", resolution: "snes", upscale: true, upscaleFactor: 2 },
  "sandrite": { label: "Crimson Horror", algorithm: "ordered", palette: "crimson", resolution: "snes", upscale: true, upscaleFactor: 2 },
  "vapor": { label: "Vapourwave", algorithm: "ordered", palette: "vaporwave", resolution: "snes", upscale: true, upscaleFactor: 2 },
};

export default function Controls({
  values,
  onChange,
  onDownload,
  hasImage,
}: ControlsProps) {
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const set = <K extends keyof ControlValues>(key: K, val: ControlValues[K]) => {
    onChange({ ...values, [key]: val });
  };

  const applyQuickPreset = (key: string) => {
    const p = QUICK_PRESETS[key];
    if (!p) return;
    onChange({
      ...values,
      algorithm: p.algorithm,
      paletteMode: p.palette,
      resolution: p.resolution,
      upscaleEnabled: p.upscale,
      upscaleFactor: p.upscaleFactor,
    });
  };

  const isFixedPalette = values.paletteMode !== "auto" && values.paletteMode !== "grayscale" && values.paletteMode !== "custom";
  const previewColors = values.paletteMode === "custom"
    ? values.customPalette
    : getPresetColors(values.paletteMode);

  // Custom palette helpers
  const addColor = () => {
    if (values.customPalette.length < 64) {
      set("customPalette", [...values.customPalette, "#000000"]);
    }
  };
  const removeColor = (idx: number) => {
    if (values.customPalette.length > 2) {
      set("customPalette", values.customPalette.filter((_, i) => i !== idx));
    }
  };
  const updateColor = (idx: number, color: string) => {
    const updated = [...values.customPalette];
    updated[idx] = color;
    set("customPalette", updated);
  };

  return (
    <div className="controls-panel">
      <div className="controls-title">{"✧ Dither Settings ✧"}</div>

      <div className="controls-grid">
        {/* ===== Group: Image ===== */}
        <div className="control-group">
          <div className="control-group-title">Image</div>

          <div className="control-row">
            <label className="control-label">{">> "}Resolution:</label>
            <select value={values.resolution} onChange={(e) => set("resolution", e.target.value as ResolutionPreset)} className="select-retro">
              {Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>{preset.label}</option>
              ))}
            </select>
          </div>

          <div className="control-row">
            <label className="control-label">{">> "}Crop:</label>
            <select value={values.cropRatio} onChange={(e) => set("cropRatio", e.target.value as CropRatio)} className="select-retro">
              <option value="free">Free (original)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="3:4">3:4 (Portrait)</option>
              <option value="4:3">4:3 (Landscape)</option>
            </select>
          </div>

          <div className="control-row">
            <label className="control-label" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={values.upscaleEnabled} onChange={(e) => set("upscaleEnabled", e.target.checked)} style={{ marginRight: "6px" }} />
              Upscale NN
            </label>
            {values.upscaleEnabled && (
              <select value={values.upscaleFactor} onChange={(e) => set("upscaleFactor", Number(e.target.value))} className="select-retro" style={{ marginTop: "4px" }}>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
                <option value={4}>4x</option>
              </select>
            )}
          </div>
        </div>

        {/* ===== Group: Algorithm ===== */}
        <div className="control-group">
          <div className="control-group-title">Algorithm</div>

          <div className="control-row">
            <label className="control-label">{">> "}Quick Preset:</label>
            <select className="select-retro" defaultValue="" onChange={(e) => { if (e.target.value) applyQuickPreset(e.target.value); e.target.value = ""; }}>
              <option value="">None</option>
              {Object.entries(QUICK_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="control-row">
            <label className="control-label">{">> "}Algorithm:</label>
            <select value={values.algorithm} onChange={(e) => set("algorithm", e.target.value as DitherAlgorithm)} className="select-retro">
              <option value="floyd-steinberg">Floyd-Steinberg</option>
              <option value="atkinson">Atkinson (Mac)</option>
              <option value="ordered">Ordered / Bayer 8x8</option>
              <option value="threshold">Threshold</option>
            </select>
          </div>

          <div className="control-row">
            <label className="control-label">{">> "}Palette:</label>
            <select value={values.paletteMode} onChange={(e) => set("paletteMode", e.target.value as PaletteMode)} className="select-retro">
              <option value="auto">Auto (Median Cut)</option>
              <optgroup label="Retro Systems">
                <option value="gameboy">Game Boy (4)</option>
                <option value="cga1">CGA Mode 1 (4)</option>
                <option value="cga2">CGA Mode 2 (4)</option>
                <option value="ega">EGA (16)</option>
                <option value="c64">Commodore 64 (16)</option>
                <option value="nes">NES (55)</option>
                <option value="pico8">PICO-8 (16)</option>
              </optgroup>
              <optgroup label="Monochrome">
                <option value="bw">Black & White (2)</option>
                <option value="grayscale">Grayscale</option>
                <option value="amber">Amber Terminal (4)</option>
                <option value="green-phosphor">Green Phosphor (4)</option>
                <option value="blue-terminal">Blue Terminal (4)</option>
              </optgroup>
              <optgroup label="Artistic">
                <option value="crimson">Crimson Desert (8)</option>
                <option value="vaporwave">Vapourwave (8)</option>
                <option value="cybernight">Cyber Night (8)</option>
                <option value="sepia">Sepia Vintage (6)</option>
              </optgroup>
              <optgroup label="Custom">
                <option value="custom">Custom Palette...</option>
              </optgroup>
            </select>
          </div>

          {/* Palette preview swatches */}
          {previewColors && (
            <div className="palette-preview">
              {previewColors.map((c, i) => (
                <div key={i} className="palette-swatch" style={{ backgroundColor: c }} />
              ))}
              <span style={{ color: "#808080", fontSize: "0.7rem", marginLeft: "4px" }}>
                {previewColors.length}c
              </span>
            </div>
          )}

          {/* Custom palette editor */}
          {values.paletteMode === "custom" && (
            <div style={{ marginTop: "6px" }}>
              <div className="palette-preview">
                {values.customPalette.map((c, i) => (
                  <div
                    key={i}
                    className="palette-swatch-editable"
                    style={{ backgroundColor: c }}
                    onClick={() => colorInputRefs.current[i]?.click()}
                    onContextMenu={(e) => { e.preventDefault(); removeColor(i); }}
                  >
                    <input
                      ref={(el) => { colorInputRefs.current[i] = el; }}
                      type="color"
                      value={c}
                      onChange={(e) => updateColor(i, e.target.value)}
                      style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                    />
                  </div>
                ))}
                <button className="palette-add-btn" onClick={addColor}>+</button>
              </div>
              <div style={{ color: "#808080", fontSize: "0.6rem", marginTop: "2px" }}>
                Click to edit, right-click to remove
              </div>
            </div>
          )}

          {/* Colors slider (only for auto/grayscale/custom) */}
          {!isFixedPalette && (
            <div className="control-row" style={{ marginTop: "6px" }}>
              <label className="control-label">
                {">> "}Colors: <span style={{ color: "#ffff00" }}>{values.colorCount}</span>
              </label>
              <input type="range" min={2} max={64} value={values.colorCount} onChange={(e) => set("colorCount", Number(e.target.value))} />
            </div>
          )}

          {values.algorithm === "threshold" && (
            <div className="control-row">
              <label className="control-label">
                {">> "}Threshold: <span style={{ color: "#ffff00" }}>{values.threshold}</span>
              </label>
              <input type="range" min={0} max={255} value={values.threshold} onChange={(e) => set("threshold", Number(e.target.value))} />
            </div>
          )}
        </div>

        {/* ===== Group: Adjustments ===== */}
        <div className="control-group" style={{ gridColumn: "1 / -1" }}>
          <div className="control-group-title">Adjustments</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="control-row">
              <label className="control-label" style={{ color: "#00ffff" }}>
                Brightness: <span style={{ color: "#ffff00" }}>{values.brightness}</span>
              </label>
              <input type="range" min={-100} max={100} value={values.brightness} onChange={(e) => set("brightness", Number(e.target.value))} />
            </div>
            <div className="control-row">
              <label className="control-label" style={{ color: "#00ffff" }}>
                Contrast: <span style={{ color: "#ffff00" }}>{values.contrast}</span>
              </label>
              <input type="range" min={-100} max={100} value={values.contrast} onChange={(e) => set("contrast", Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>

      <hr className="rainbow-hr" />

      <button className="btn-download" onClick={onDownload} disabled={!hasImage}>
        {"DOWNLOAD"}
      </button>
      <div style={{ textAlign: "center", color: "#808080", fontSize: "9px", marginTop: "4px", fontFamily: "'VT323', monospace" }}>
        {"Right-click > Save As for MAXIMUM quality!!!"}
      </div>
    </div>
  );
}
