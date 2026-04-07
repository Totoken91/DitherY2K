"use client";

import { type DitherAlgorithm } from "@/lib/dithering";
import { type ResolutionPreset, RESOLUTION_PRESETS } from "@/lib/image-processing";

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

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#00FF00",
  fontFamily: "'Comic Sans MS', cursive",
  fontSize: "13px",
  marginBottom: "2px",
  textShadow: "1px 1px 0 #000",
};

const sliderContainerStyle: React.CSSProperties = {
  marginBottom: "12px",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "4px",
  fontFamily: "'Comic Sans MS', cursive",
  fontSize: "13px",
  background: "#C0C0C0",
  borderTop: "2px solid #000",
  borderLeft: "2px solid #000",
  borderBottom: "2px solid #fff",
  borderRight: "2px solid #fff",
  cursor: "pointer",
};

const sliderStyle: React.CSSProperties = {
  width: "100%",
  cursor: "pointer",
};

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
    <div
      style={{
        background: "rgba(0,0,0,0.4)",
        border: "3px ridge #808080",
        padding: "12px",
      }}
    >
      <div
        style={{
          color: "#FF00FF",
          fontFamily: "Impact, sans-serif",
          fontSize: "18px",
          textAlign: "center",
          marginBottom: "12px",
          textShadow: "2px 2px 0 #000",
        }}
      >
        ~ CONTROLS ~
      </div>

      {/* Algorithm */}
      <div style={sliderContainerStyle}>
        <label style={labelStyle}>Algorithm:</label>
        <select
          value={values.algorithm}
          onChange={(e) => set("algorithm", e.target.value as DitherAlgorithm)}
          style={selectStyle}
        >
          <option value="floyd-steinberg">Floyd-Steinberg</option>
          <option value="atkinson">Atkinson (Mac)</option>
          <option value="ordered">Ordered / Bayer 8x8</option>
          <option value="threshold">Threshold</option>
        </select>
      </div>

      {/* Color count */}
      <div style={sliderContainerStyle}>
        <label style={labelStyle}>
          Colors: <span style={{ color: "#FFFF00" }}>{values.colorCount}</span>
        </label>
        <input
          type="range"
          min={2}
          max={64}
          value={values.colorCount}
          onChange={(e) => set("colorCount", Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Threshold (only for threshold algo) */}
      {values.algorithm === "threshold" && (
        <div style={sliderContainerStyle}>
          <label style={labelStyle}>
            Threshold:{" "}
            <span style={{ color: "#FFFF00" }}>{values.threshold}</span>
          </label>
          <input
            type="range"
            min={0}
            max={255}
            value={values.threshold}
            onChange={(e) => set("threshold", Number(e.target.value))}
            style={sliderStyle}
          />
        </div>
      )}

      {/* Resolution */}
      <div style={sliderContainerStyle}>
        <label style={labelStyle}>Resolution:</label>
        <select
          value={values.resolution}
          onChange={(e) =>
            set("resolution", e.target.value as ResolutionPreset)
          }
          style={selectStyle}
        >
          {Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Upscale */}
      <div style={sliderContainerStyle}>
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={values.upscaleEnabled}
            onChange={(e) => set("upscaleEnabled", e.target.checked)}
            style={{ marginRight: "6px" }}
          />
          Upscale Nearest-Neighbor
        </label>
        {values.upscaleEnabled && (
          <select
            value={values.upscaleFactor}
            onChange={(e) => set("upscaleFactor", Number(e.target.value))}
            style={{ ...selectStyle, marginTop: "4px" }}
          >
            <option value={2}>2x</option>
            <option value={3}>3x</option>
            <option value={4}>4x</option>
          </select>
        )}
      </div>

      {/* Brightness */}
      <div style={sliderContainerStyle}>
        <label style={labelStyle}>
          Brightness:{" "}
          <span style={{ color: "#FFFF00" }}>{values.brightness}</span>
        </label>
        <input
          type="range"
          min={-100}
          max={100}
          value={values.brightness}
          onChange={(e) => set("brightness", Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Contrast */}
      <div style={sliderContainerStyle}>
        <label style={labelStyle}>
          Contrast:{" "}
          <span style={{ color: "#FFFF00" }}>{values.contrast}</span>
        </label>
        <input
          type="range"
          min={-100}
          max={100}
          value={values.contrast}
          onChange={(e) => set("contrast", Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Download button */}
      <button
        onClick={onDownload}
        disabled={!hasImage}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "8px",
          fontFamily: "'Comic Sans MS', cursive",
          fontSize: "16px",
          fontWeight: "bold",
          background: hasImage ? "#C0C0C0" : "#888",
          borderTop: "2px solid #fff",
          borderLeft: "2px solid #fff",
          borderBottom: "2px solid #000",
          borderRight: "2px solid #000",
          cursor: hasImage ? "pointer" : "not-allowed",
          color: "#000",
        }}
      >
        {">>> DOWNLOAD PNG <<<"}
      </button>
    </div>
  );
}
