"use client";

import { useEffect, useRef } from "react";

interface PreviewProps {
  originalImage: HTMLImageElement | null;
  resultCanvas: HTMLCanvasElement | null;
  isProcessing: boolean;
}

export default function Preview({
  originalImage,
  resultCanvas,
  isProcessing,
}: PreviewProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!originalImage || !originalCanvasRef.current) return;
    const canvas = originalCanvasRef.current;
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(originalImage, 0, 0);
  }, [originalImage]);

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
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      {/* Original */}
      <div
        className="panel-sunken"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "6px",
          position: "relative",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "Impact, sans-serif",
            fontSize: "15px",
            color: "#00ffff",
            textShadow: "1px 1px 0 #000",
            marginBottom: "4px",
          }}
        >
          {"~ ORIGINAL ~"}
        </div>
        <canvas
          ref={originalCanvasRef}
          style={{
            maxWidth: "100%",
            maxHeight: "400px",
            imageRendering: "pixelated",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>

      {/* Result */}
      <div
        className="panel-sunken"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "6px",
          position: "relative",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "Impact, sans-serif",
            fontSize: "15px",
            color: "#00ffff",
            textShadow: "1px 1px 0 #000",
            marginBottom: "4px",
          }}
        >
          {"~ DITHERED ~"}
        </div>
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
            maxWidth: "100%",
            maxHeight: "400px",
            imageRendering: "pixelated",
            display: "block",
            margin: "0 auto",
            opacity: isProcessing ? 0.4 : 1,
            transition: "opacity 0.2s",
          }}
        />
      </div>
    </div>
  );
}
