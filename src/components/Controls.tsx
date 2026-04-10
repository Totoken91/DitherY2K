"use client";

import { type DitherAlgorithm, type DigicamColorCast, type PaletteMode } from "@/lib/dithering";
import {
  type ResolutionPreset,
  type DigicamResolutionPreset,
  type ProcessingMode,
  RESOLUTION_PRESETS,
  DIGICAM_RESOLUTION_PRESETS,
} from "@/lib/image-processing";

export interface ControlValues {
  mode: ProcessingMode;
  // Shared
  resolution: ResolutionPreset;
  digicamResolution: DigicamResolutionPreset;
  upscaleEnabled: boolean;
  upscaleFactor: number;
  brightness: number;
  contrast: number;
  // Dither
  algorithm: DitherAlgorithm;
  colorCount: number;
  paletteMode: PaletteMode;
  threshold: number;
  // Digicam
  digicamNoise: number;
  digicamJpegQuality: number;
  digicamBloom: number;
  digicamColorCast: DigicamColorCast;
  digicamVignette: boolean;
  digicamChromatic: boolean;
  digicamDateStamp: boolean;
  digicamBarrelDistortion: number;
  digicamBlur: number;
  digicamSaturationBoost: number;
  digicamDynamicRangeCompress: boolean;
}

interface ControlsProps {
  values: ControlValues;
  onChange: (values: ControlValues) => void;
  onDownload: () => void;
  hasImage: boolean;
}

interface DigicamPreset {
  label: string;
  noise: number;
  jpeg: number;
  bloom: number;
  cast: DigicamColorCast;
  vignette: boolean;
  chromatic: boolean;
  dateStamp: boolean;
  resolution: DigicamResolutionPreset;
  barrel: number;
  blur: number;
  saturation: number;
  dr: boolean;
}

const DIGICAM_PRESETS: DigicamPreset[] = [
  { label: "Nokia 7650", noise: 55, jpeg: 30, bloom: 0, cast: "warm", vignette: true, chromatic: true, dateStamp: false, resolution: "nokia", barrel: 40, blur: 45, saturation: 15, dr: true },
  { label: "RAZR V3", noise: 65, jpeg: 25, bloom: 0, cast: "warm", vignette: true, chromatic: true, dateStamp: false, resolution: "flip", barrel: 30, blur: 50, saturation: 10, dr: true },
  { label: "SE T610", noise: 75, jpeg: 15, bloom: 0, cast: "green", vignette: true, chromatic: true, dateStamp: false, resolution: "flip", barrel: 25, blur: 55, saturation: 5, dr: true },
  { label: "Digicam 2MP", noise: 20, jpeg: 75, bloom: 25, cast: "warm", vignette: true, chromatic: true, dateStamp: true, resolution: "digicam2", barrel: 8, blur: 10, saturation: 25, dr: false },
  { label: "PowerShot", noise: 15, jpeg: 80, bloom: 20, cast: "warm", vignette: true, chromatic: true, dateStamp: true, resolution: "digicam1", barrel: 12, blur: 12, saturation: 20, dr: false },
  { label: "DSi", noise: 35, jpeg: 55, bloom: 0, cast: "cool", vignette: false, chromatic: false, dateStamp: false, resolution: "dsi", barrel: 18, blur: 25, saturation: 5, dr: true },
  { label: "Webcam '03", noise: 60, jpeg: 40, bloom: 0, cast: "cool", vignette: true, chromatic: true, dateStamp: false, resolution: "webcam", barrel: 50, blur: 35, saturation: 0, dr: true },
];

export default function Controls({
  values,
  onChange,
  onDownload,
  hasImage,
}: ControlsProps) {
  const set = <K extends keyof ControlValues>(key: K, val: ControlValues[K]) => {
    onChange({ ...values, [key]: val });
  };

  const applyPreset = (p: DigicamPreset) => {
    onChange({
      ...values,
      digicamNoise: p.noise,
      digicamJpegQuality: p.jpeg,
      digicamBloom: p.bloom,
      digicamColorCast: p.cast,
      digicamVignette: p.vignette,
      digicamChromatic: p.chromatic,
      digicamDateStamp: p.dateStamp,
      digicamResolution: p.resolution,
      digicamBarrelDistortion: p.barrel,
      digicamBlur: p.blur,
      digicamSaturationBoost: p.saturation,
      digicamDynamicRangeCompress: p.dr,
    });
  };

  const isDither = values.mode === "dither";
  const isDigicam = values.mode === "digicam";

  return (
    <div className="controls-panel" style={{ marginTop: "4px" }}>
      {/* ===== MODE TOGGLE ===== */}
      <div style={{ display: "flex", gap: "0", marginBottom: "8px" }}>
        <button
          className={isDither ? "btn-retro" : "btn-retro"}
          onClick={() => set("mode", "dither")}
          style={{
            flex: 1,
            fontSize: "13px",
            fontFamily: "'Silkscreen', cursive",
            padding: "6px",
            background: isDither ? "#c0c0c0" : "#808080",
            borderTop: isDither ? "2px solid #000" : "2px solid #fff",
            borderLeft: isDither ? "2px solid #000" : "2px solid #fff",
            borderBottom: isDither ? "2px solid #fff" : "2px solid #000",
            borderRight: isDither ? "2px solid #fff" : "2px solid #000",
            color: isDither ? "#000" : "#ccc",
          }}
        >
          {"🎨 DITHER"}
        </button>
        <button
          onClick={() => set("mode", "digicam")}
          style={{
            flex: 1,
            fontSize: "13px",
            fontFamily: "'Silkscreen', cursive",
            padding: "6px",
            cursor: "pointer",
            background: isDigicam ? "#c0c0c0" : "#808080",
            borderTop: isDigicam ? "2px solid #000" : "2px solid #fff",
            borderLeft: isDigicam ? "2px solid #000" : "2px solid #fff",
            borderBottom: isDigicam ? "2px solid #fff" : "2px solid #000",
            borderRight: isDigicam ? "2px solid #fff" : "2px solid #000",
            color: isDigicam ? "#000" : "#ccc",
          }}
        >
          {"📷 DIGICAM Y2K"}
        </button>
      </div>

      <div className="controls-title" style={{ color: "#ff00ff", fontSize: "14px", marginBottom: "6px" }}>
        {isDigicam ? "✧ Y2K Camera Mode ✧" : "✧ Dither Settings ✧"}
      </div>

      {/* ===== SHARED CONTROLS ===== */}
      <div className="controls-grid">
        {/* Resolution — conditional on mode */}
        <div className="control-row">
          <label className="control-label">{">> "}Resolution:</label>
          {isDither ? (
            <select
              value={values.resolution}
              onChange={(e) => set("resolution", e.target.value as ResolutionPreset)}
              className="select-retro"
            >
              {Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>{preset.label}</option>
              ))}
            </select>
          ) : (
            <select
              value={values.digicamResolution}
              onChange={(e) => set("digicamResolution", e.target.value as DigicamResolutionPreset)}
              className="select-retro"
            >
              {Object.entries(DIGICAM_RESOLUTION_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>{preset.label}</option>
              ))}
            </select>
          )}
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
      </div>

      <hr className="rainbow-hr" />

      {/* ===== DITHER-SPECIFIC ===== */}
      {isDither && (
        <div className="controls-grid">
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
      )}

      {/* ===== DIGICAM-SPECIFIC ===== */}
      {isDigicam && (
        <div>
          {/* Presets */}
          <div className="control-row" style={{ marginBottom: "6px" }}>
            <label className="control-label" style={{ color: "#ff69b4" }}>{">> "}Presets:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
              {DIGICAM_PRESETS.map((p) => (
                <button
                  key={p.label}
                  className="btn-retro"
                  onClick={() => applyPreset(p)}
                  style={{ fontSize: "10px", padding: "2px 6px" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="controls-grid">
            <div className="control-row">
              <label className="control-label">
                CCD Noise: <span style={{ color: "#ffff00" }}>{values.digicamNoise}</span>
              </label>
              <input
                type="range" min={0} max={100} value={values.digicamNoise}
                onChange={(e) => set("digicamNoise", Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>

            <div className="control-row">
              <label className="control-label">
                JPEG Quality: <span style={{ color: "#ffff00" }}>{values.digicamJpegQuality}</span>
              </label>
              <input
                type="range" min={0} max={100} value={values.digicamJpegQuality}
                onChange={(e) => set("digicamJpegQuality", Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>

            <div className="control-row">
              <label className="control-label">
                CCD Bloom: <span style={{ color: "#ffff00" }}>{values.digicamBloom}</span>
              </label>
              <input
                type="range" min={0} max={100} value={values.digicamBloom}
                onChange={(e) => set("digicamBloom", Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>

            <div className="control-row">
              <label className="control-label">Color Cast:</label>
              <select
                value={values.digicamColorCast}
                onChange={(e) => set("digicamColorCast", e.target.value as DigicamColorCast)}
                className="select-retro"
              >
                <option value="none">None</option>
                <option value="warm">Warm (CCD)</option>
                <option value="cool">Cool (Fluorescent)</option>
                <option value="green">Green (CMOS)</option>
              </select>
            </div>

            <div className="control-row">
              <label className="control-label">
                Barrel Distort: <span style={{ color: "#ffff00" }}>{values.digicamBarrelDistortion}</span>
              </label>
              <input type="range" min={0} max={100} value={values.digicamBarrelDistortion}
                onChange={(e) => set("digicamBarrelDistortion", Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }} />
            </div>

            <div className="control-row">
              <label className="control-label">
                Lens Blur: <span style={{ color: "#ffff00" }}>{values.digicamBlur}</span>
              </label>
              <input type="range" min={0} max={100} value={values.digicamBlur}
                onChange={(e) => set("digicamBlur", Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }} />
            </div>

            <div className="control-row">
              <label className="control-label">
                Saturation: <span style={{ color: "#ffff00" }}>{values.digicamSaturationBoost}</span>
              </label>
              <input type="range" min={0} max={100} value={values.digicamSaturationBoost}
                onChange={(e) => set("digicamSaturationBoost", Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "6px" }}>
            <label className="control-label" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={values.digicamVignette} onChange={(e) => set("digicamVignette", e.target.checked)} style={{ marginRight: "3px" }} />
              Vignette
            </label>
            <label className="control-label" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={values.digicamChromatic} onChange={(e) => set("digicamChromatic", e.target.checked)} style={{ marginRight: "3px" }} />
              Chromatic
            </label>
            <label className="control-label" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={values.digicamDateStamp} onChange={(e) => set("digicamDateStamp", e.target.checked)} style={{ marginRight: "3px" }} />
              Date Stamp
            </label>
            <label className="control-label" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={values.digicamDynamicRangeCompress} onChange={(e) => set("digicamDynamicRangeCompress", e.target.checked)} style={{ marginRight: "3px" }} />
              Lo-fi DR
            </label>
          </div>
        </div>
      )}

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
