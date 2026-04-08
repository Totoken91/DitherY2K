"use client";

import { type DitherAlgorithm, type DigicamColorCast } from "@/lib/dithering";
import {
  type ResolutionPreset,
  type ProcessingMode,
  RESOLUTION_PRESETS,
} from "@/lib/image-processing";

export interface ControlValues {
  mode: ProcessingMode;
  // Shared
  resolution: ResolutionPreset;
  upscaleEnabled: boolean;
  upscaleFactor: number;
  brightness: number;
  contrast: number;
  // Dither
  algorithm: DitherAlgorithm;
  colorCount: number;
  threshold: number;
  // Digicam
  digicamNoise: number;
  digicamJpegQuality: number;
  digicamBloom: number;
  digicamColorCast: DigicamColorCast;
  digicamVignette: boolean;
  digicamChromatic: boolean;
  digicamDateStamp: boolean;
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
  resolution: ResolutionPreset;
}

const DIGICAM_PRESETS: DigicamPreset[] = [
  { label: "📱 Flip Phone", noise: 80, jpeg: 20, bloom: 0, cast: "warm", vignette: true, chromatic: true, dateStamp: true, resolution: "snes" },
  { label: "📷 Digicam", noise: 35, jpeg: 65, bloom: 25, cast: "warm", vignette: true, chromatic: true, dateStamp: true, resolution: "vga" },
  { label: "🎮 Nintendo DS", noise: 25, jpeg: 75, bloom: 0, cast: "cool", vignette: false, chromatic: false, dateStamp: false, resolution: "snes" },
  { label: "💻 Webcam", noise: 60, jpeg: 35, bloom: 0, cast: "cool", vignette: true, chromatic: true, dateStamp: false, resolution: "vga" },
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
      resolution: p.resolution,
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
            fontFamily: "Impact, sans-serif",
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
            fontFamily: "Impact, sans-serif",
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
            <label className="control-label">
              {">> "}Colors: <span style={{ color: "#ffff00" }}>{values.colorCount}</span>
            </label>
            <input
              type="range" min={2} max={64} value={values.colorCount}
              onChange={(e) => set("colorCount", Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

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
              </select>
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
          </div>
        </div>
      )}

      <hr className="rainbow-hr" />

      <button className="btn-download" onClick={onDownload} disabled={!hasImage}>
        {"⬇ DOWNLOAD YOUR IMAGE ⬇"}
      </button>
      <div style={{
        textAlign: "center", color: "#808080", fontSize: "9px",
        marginTop: "3px", fontFamily: "'Comic Sans MS', cursive",
      }}>
        {"Right-click > Save As for MAXIMUM quality!!!"}
      </div>
    </div>
  );
}
