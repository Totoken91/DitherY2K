"use client";

import { type DitherAlgorithm } from "@/lib/dithering";
import {
  type ResolutionPreset,
  RESOLUTION_PRESETS,
} from "@/lib/image-processing";

export interface ControlValues {
  algorithm: DitherAlgorithm;
  colorCount: number;
  threshold: number;
  brightness: number;
  contrast: number;
  resolution: ResolutionPreset;
  upscaleEnabled: boolean;
  upscaleFactor: number;
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
  const set = <K extends keyof ControlValues>(
    key: K,
    val: ControlValues[K]
  ) => {
    onChange({ ...values, [key]: val });
  };

  return (
    <div className="sidebar-section">
      <div
        className="sidebar-title"
        style={{ fontSize: "20px", color: "#ff00ff", marginBottom: "14px" }}
      >
        {"~ CONTROLS ~"}
      </div>

      {/* Algorithm */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            color: "#00ff00",
            fontSize: "13px",
            marginBottom: "3px",
            textShadow: "1px 1px 0 #000",
          }}
        >
          {">> "}Algorithm:
        </label>
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

      {/* Colors */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            color: "#00ff00",
            fontSize: "13px",
            marginBottom: "3px",
            textShadow: "1px 1px 0 #000",
          }}
        >
          {">> "}Colors:{" "}
          <span style={{ color: "#ffff00" }}>{values.colorCount}</span>
        </label>
        <input
          type="range"
          min={2}
          max={64}
          value={values.colorCount}
          onChange={(e) => set("colorCount", Number(e.target.value))}
          style={{ width: "100%", cursor: "pointer" }}
        />
      </div>

      {/* Threshold (only visible for threshold algo) */}
      {values.algorithm === "threshold" && (
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              color: "#00ff00",
              fontSize: "13px",
              marginBottom: "3px",
              textShadow: "1px 1px 0 #000",
            }}
          >
            {">> "}Threshold:{" "}
            <span style={{ color: "#ffff00" }}>{values.threshold}</span>
          </label>
          <input
            type="range"
            min={0}
            max={255}
            value={values.threshold}
            onChange={(e) => set("threshold", Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>
      )}

      {/* Resolution */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            color: "#00ff00",
            fontSize: "13px",
            marginBottom: "3px",
            textShadow: "1px 1px 0 #000",
          }}
        >
          {">> "}Resolution:
        </label>
        <select
          value={values.resolution}
          onChange={(e) =>
            set("resolution", e.target.value as ResolutionPreset)
          }
          className="select-retro"
        >
          {Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Upscale */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            color: "#00ff00",
            fontSize: "13px",
            textShadow: "1px 1px 0 #000",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={values.upscaleEnabled}
            onChange={(e) => set("upscaleEnabled", e.target.checked)}
            style={{ marginRight: "6px" }}
          />
          Upscale NN
        </label>
        {values.upscaleEnabled && (
          <select
            value={values.upscaleFactor}
            onChange={(e) => set("upscaleFactor", Number(e.target.value))}
            className="select-retro"
            style={{ marginTop: "4px" }}
          >
            <option value={2}>2x</option>
            <option value={3}>3x</option>
            <option value={4}>4x</option>
          </select>
        )}
      </div>

      <hr className="rainbow-hr" />

      {/* Brightness */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            color: "#00ffff",
            fontSize: "13px",
            marginBottom: "3px",
            textShadow: "1px 1px 0 #000",
          }}
        >
          Brightness:{" "}
          <span style={{ color: "#ffff00" }}>{values.brightness}</span>
        </label>
        <input
          type="range"
          min={-100}
          max={100}
          value={values.brightness}
          onChange={(e) => set("brightness", Number(e.target.value))}
          style={{ width: "100%", cursor: "pointer" }}
        />
      </div>

      {/* Contrast */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            color: "#00ffff",
            fontSize: "13px",
            marginBottom: "3px",
            textShadow: "1px 1px 0 #000",
          }}
        >
          Contrast:{" "}
          <span style={{ color: "#ffff00" }}>{values.contrast}</span>
        </label>
        <input
          type="range"
          min={-100}
          max={100}
          value={values.contrast}
          onChange={(e) => set("contrast", Number(e.target.value))}
          style={{ width: "100%", cursor: "pointer" }}
        />
      </div>

      {/* Download */}
      <button
        className="btn-retro"
        onClick={onDownload}
        disabled={!hasImage}
        style={{
          width: "100%",
          fontSize: "16px",
          fontWeight: "bold",
          padding: "10px",
          marginTop: "4px",
        }}
      >
        {"⬇ DOWNLOAD PNG ⬇"}
      </button>
    </div>
  );
}
