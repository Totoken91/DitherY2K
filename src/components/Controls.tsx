"use client";

import { type DitherAlgorithm, type PaletteMode } from "@/lib/dithering";
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
  threshold: number;
}

interface ControlsProps {
  values: ControlValues;
  onChange: (values: ControlValues) => void;
  onDownload: () => void;
  hasImage: boolean;
}

export default function Controls({
  values,
  onChange,
  onDownload,
  hasImage,
}: ControlsProps) {
  const set = <K extends keyof ControlValues>(key: K, val: ControlValues[K]) => {
    onChange({ ...values, [key]: val });
  };

  return (
    <div className="controls-panel" style={{ marginTop: "4px" }}>
      <div className="controls-title" style={{ color: "#ff00ff" }}>
        {"✧ Dither Settings ✧"}
      </div>

      <div className="controls-grid">
        {/* Resolution */}
        <div className="control-row">
          <label className="control-label">{">> "}Resolution:</label>
          <select
            value={values.resolution}
            onChange={(e) => set("resolution", e.target.value as ResolutionPreset)}
            className="select-retro"
          >
            {Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>{preset.label}</option>
            ))}
          </select>
        </div>

        {/* Crop */}
        <div className="control-row">
          <label className="control-label">{">> "}Crop:</label>
          <select
            value={values.cropRatio}
            onChange={(e) => set("cropRatio", e.target.value as CropRatio)}
            className="select-retro"
          >
            <option value="free">Free (original)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="3:4">3:4 (Portrait)</option>
            <option value="4:3">4:3 (Landscape)</option>
          </select>
        </div>

        {/* Upscale */}
        <div className="control-row">
          <label className="control-label" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={values.upscaleEnabled}
              onChange={(e) => set("upscaleEnabled", e.target.checked)}
              style={{ marginRight: "4px" }}
            />
            Upscale NN
          </label>
          {values.upscaleEnabled && (
            <select
              value={values.upscaleFactor}
              onChange={(e) => set("upscaleFactor", Number(e.target.value))}
              className="select-retro"
            >
              <option value={2}>2x</option>
              <option value={3}>3x</option>
              <option value={4}>4x</option>
            </select>
          )}
        </div>

        {/* Brightness */}
        <div className="control-row">
          <label className="control-label" style={{ color: "#00ffff" }}>
            Brightness: <span style={{ color: "#ffff00" }}>{values.brightness}</span>
          </label>
          <input
            type="range" min={-100} max={100} value={values.brightness}
            onChange={(e) => set("brightness", Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        {/* Contrast */}
        <div className="control-row">
          <label className="control-label" style={{ color: "#00ffff" }}>
            Contrast: <span style={{ color: "#ffff00" }}>{values.contrast}</span>
          </label>
          <input
            type="range" min={-100} max={100} value={values.contrast}
            onChange={(e) => set("contrast", Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        {/* Algorithm */}
        <div className="control-row">
          <label className="control-label">{">> "}Algorithm:</label>
          <select
            value={values.algorithm}
            onChange={(e) => set("algorithm", e.target.value as DitherAlgorithm)}
            className="select-retro"
          >
            <option value="floyd-steinberg">Floyd-Steinberg</option>
            <option value="atkinson">Atkinson (Mac)</option>
            <option value="ordered">Ordered / Bayer 8x8</option>
            <option value="threshold">Threshold</option>
          </select>
        </div>

        {/* Palette */}
        <div className="control-row">
          <label className="control-label">{">> "}Palette:</label>
          <select
            value={values.paletteMode}
            onChange={(e) => set("paletteMode", e.target.value as PaletteMode)}
            className="select-retro"
          >
            <option value="auto">Auto (Median Cut)</option>
            <option value="gameboy">Game Boy</option>
            <option value="cga">CGA</option>
            <option value="ega">EGA (16 colors)</option>
            <option value="grayscale">Grayscale</option>
          </select>
        </div>

        {(values.paletteMode === "auto" || values.paletteMode === "grayscale") && (
          <div className="control-row">
            <label className="control-label">
              {">> "}Colors: <span style={{ color: "#ffff00" }}>{values.colorCount}</span>
            </label>
            <input
              type="range" min={2} max={64} value={values.colorCount}
              onChange={(e) => set("colorCount", Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>
        )}

        {values.algorithm === "threshold" && (
          <div className="control-row" style={{ gridColumn: "1 / -1" }}>
            <label className="control-label">
              {">> "}Threshold: <span style={{ color: "#ffff00" }}>{values.threshold}</span>
            </label>
            <input
              type="range" min={0} max={255} value={values.threshold}
              onChange={(e) => set("threshold", Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>
        )}
      </div>

      <hr className="rainbow-hr" />

      <button className="btn-download" onClick={onDownload} disabled={!hasImage}>
        {"DOWNLOAD"}
      </button>
      <div style={{
        textAlign: "center", color: "#808080", fontSize: "9px",
        marginTop: "3px", fontFamily: "'VT323', monospace",
      }}>
        {"Right-click > Save As for MAXIMUM quality!!!"}
      </div>
    </div>
  );
}
