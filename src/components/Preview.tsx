"use client";

import { useEffect, useRef, useState } from "react";

interface PreviewProps {
  originalImage: HTMLImageElement | null;
  resultCanvas: HTMLCanvasElement | null;
  isProcessing: boolean;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export default function Preview({
  originalImage,
  resultCanvas,
  isProcessing,
}: PreviewProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mobileTab, setMobileTab] = useState<"dithered" | "original">("dithered");
  const isMobile = useIsMobile();

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

  const labelStyle = {
    textAlign: "center" as const,
    fontFamily: "'Silkscreen', cursive",
    fontSize: "13px",
    color: "#00ffff",
    textShadow: "1px 1px 0 #000",
    marginBottom: "3px",
  };

  const canvasStyle = {
    width: "100%",
    maxHeight: isMobile ? "300px" : "380px",
    imageRendering: "pixelated" as const,
    display: "block",
    margin: "0 auto",
  };

  // Mobile: single image with toggle tabs
  if (isMobile) {
    return (
      <div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "0" }}>
          <button
            onClick={() => setMobileTab("original")}
            style={{
              flex: 1, padding: "6px", fontSize: "11px",
              fontFamily: "'Silkscreen', cursive",
              color: mobileTab === "original" ? "#000" : "#aaa",
              background: mobileTab === "original" ? "#c0c0c0" : "#606060",
              borderTop: mobileTab === "original" ? "2px solid #000" : "2px solid #fff",
              borderLeft: mobileTab === "original" ? "2px solid #000" : "2px solid #fff",
              borderBottom: mobileTab === "original" ? "2px solid #fff" : "2px solid #000",
              borderRight: mobileTab === "original" ? "2px solid #fff" : "2px solid #000",
              cursor: "pointer",
            }}
          >
            ORIGINAL
          </button>
          <button
            onClick={() => setMobileTab("dithered")}
            style={{
              flex: 1, padding: "6px", fontSize: "11px",
              fontFamily: "'Silkscreen', cursive",
              color: mobileTab === "dithered" ? "#000" : "#aaa",
              background: mobileTab === "dithered" ? "#c0c0c0" : "#606060",
              borderTop: mobileTab === "dithered" ? "2px solid #000" : "2px solid #fff",
              borderLeft: mobileTab === "dithered" ? "2px solid #000" : "2px solid #fff",
              borderBottom: mobileTab === "dithered" ? "2px solid #fff" : "2px solid #000",
              borderRight: mobileTab === "dithered" ? "2px solid #fff" : "2px solid #000",
              cursor: "pointer",
            }}
          >
            DITHERED
          </button>
        </div>

        <div className="panel-double-bevel" style={{ position: "relative" }}>
          <div className="panel-double-bevel-inner">
            {isProcessing && mobileTab === "dithered" && (
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)", zIndex: 10,
              }}>
                <div className="retro-spinner" />
              </div>
            )}
            <canvas
              ref={mobileTab === "original" ? originalCanvasRef : resultCanvasRef}
              style={{
                ...canvasStyle,
                opacity: isProcessing && mobileTab === "dithered" ? 0.4 : 1,
              }}
            />
            {/* Hidden canvas to keep both refs alive */}
            <canvas
              ref={mobileTab === "original" ? resultCanvasRef : originalCanvasRef}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop: side by side
  return (
    <div className="preview-container">
      <div className="panel-double-bevel" style={{ flex: 1, minWidth: 0 }}>
        <div className="panel-double-bevel-inner">
          <div style={labelStyle}>{"~ ORIGINAL ~"}</div>
          <canvas ref={originalCanvasRef} style={canvasStyle} />
        </div>
      </div>

      <div className="panel-double-bevel" style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <div className="panel-double-bevel-inner">
          <div style={labelStyle}>{"~ DITHERED ~"}</div>
          {isProcessing && (
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", zIndex: 10,
            }}>
              <div className="retro-spinner" />
            </div>
          )}
          <canvas
            ref={resultCanvasRef}
            style={{ ...canvasStyle, opacity: isProcessing ? 0.4 : 1, transition: "opacity 0.2s" }}
          />
        </div>
      </div>
    </div>
  );
}
