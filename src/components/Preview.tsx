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

  if (!originalImage) {
    return (
      <div className="panel-double-bevel">
        <div className="panel-double-bevel-inner" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ color: "#808080", fontFamily: "'Press Start 2P', cursive", fontSize: "14px", textShadow: "0 0 4px #333" }}>
            {">> INSERT COIN TO CONTINUE <<"}
          </div>
          <div style={{ color: "#555", fontSize: "11px", marginTop: "8px", fontFamily: "'Comic Neue', cursive" }}>
            {"(upload an image you n00b!!)"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-container">
      {/* Original */}
      <div className="panel-double-bevel" style={{ flex: 1, minWidth: 0 }}>
        <div className="panel-double-bevel-inner">
          <div style={{
            textAlign: "center",
            fontFamily: "'Silkscreen', cursive",
            fontSize: "13px",
            color: "#00ffff",
            textShadow: "1px 1px 0 #000",
            marginBottom: "3px",
          }}>
            {"~ ORIGINAL ~"}
          </div>
          <canvas
            ref={originalCanvasRef}
            style={{
              maxWidth: "100%",
              maxHeight: "380px",
              imageRendering: "pixelated",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
      </div>

      {/* Result */}
      <div className="panel-double-bevel" style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <div className="panel-double-bevel-inner">
          <div style={{
            textAlign: "center",
            fontFamily: "'Silkscreen', cursive",
            fontSize: "13px",
            color: "#00ffff",
            textShadow: "1px 1px 0 #000",
            marginBottom: "3px",
          }}>
            {"~ DITHERED ~"}
          </div>
          {isProcessing && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}>
              <div className="retro-spinner" />
            </div>
          )}
          <canvas
            ref={resultCanvasRef}
            style={{
              maxWidth: "100%",
              maxHeight: "380px",
              imageRendering: "pixelated",
              display: "block",
              margin: "0 auto",
              opacity: isProcessing ? 0.4 : 1,
              transition: "opacity 0.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
