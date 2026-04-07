"use client";

import { useEffect, useRef } from "react";

interface PreviewProps {
  originalImage: HTMLImageElement | null;
  resultCanvas: HTMLCanvasElement | null;
  isProcessing: boolean;
}

const panelLabelStyle: React.CSSProperties = {
  textAlign: "center",
  fontFamily: "Impact, sans-serif",
  fontSize: "16px",
  color: "#00FFFF",
  textShadow: "1px 1px 0 #000",
  marginBottom: "4px",
};

const panelStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "3px inset #808080",
  background: "#000",
  padding: "4px",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const canvasStyle: React.CSSProperties = {
  maxWidth: "100%",
  maxHeight: "400px",
  imageRendering: "pixelated",
  display: "block",
};

export default function Preview({
  originalImage,
  resultCanvas,
  isProcessing,
}: PreviewProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw original image onto canvas
  useEffect(() => {
    if (!originalImage || !originalCanvasRef.current) return;
    const canvas = originalCanvasRef.current;
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(originalImage, 0, 0);
  }, [originalImage]);

  // Draw result onto canvas
  useEffect(() => {
    if (!resultCanvas || !resultCanvasRef.current) return;
    const canvas = resultCanvasRef.current;
    canvas.width = resultCanvas.width;
    canvas.height = resultCanvas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(resultCanvas, 0, 0);
  }, [resultCanvas]);

  if (!originalImage) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      {/* Original */}
      <div style={panelStyle}>
        <div style={panelLabelStyle}>~ ORIGINAL ~</div>
        <canvas ref={originalCanvasRef} style={canvasStyle} />
      </div>

      {/* Result */}
      <div style={panelStyle}>
        <div style={panelLabelStyle}>~ DITHERED ~</div>
        {isProcessing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <div className="retro-spinner" />
          </div>
        )}
        <canvas
          ref={resultCanvasRef}
          style={{
            ...canvasStyle,
            opacity: isProcessing ? 0.4 : 1,
            transition: "opacity 0.2s",
          }}
        />
      </div>
    </div>
  );
}
