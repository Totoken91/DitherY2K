"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import UploadZone from "@/components/UploadZone";
import Controls, { type ControlValues } from "@/components/Controls";
import Preview from "@/components/Preview";
import {
  loadImageFromFile,
  processImage,
  downloadPNG,
} from "@/lib/image-processing";

const DEFAULT_CONTROLS: ControlValues = {
  algorithm: "floyd-steinberg",
  colorCount: 2,
  threshold: 128,
  brightness: 0,
  contrast: 0,
  resolution: "vga",
  upscaleEnabled: false,
  upscaleFactor: 2,
};

const BADGES = [
  { src: "https://cyber.dabamos.de/88x31/netscape.gif", alt: "Netscape Now" },
  { src: "https://cyber.dabamos.de/88x31/ie_logo.gif", alt: "IE" },
  { src: "https://cyber.dabamos.de/88x31/html.gif", alt: "HTML" },
  { src: "https://cyber.dabamos.de/88x31/notepad.gif", alt: "Made with Notepad" },
  { src: "https://cyber.dabamos.de/88x31/www.gif", alt: "WWW" },
  { src: "https://cyber.dabamos.de/88x31/javascript.gif", alt: "JavaScript" },
  { src: "https://cyber.dabamos.de/88x31/css.gif", alt: "CSS" },
  { src: "https://cyber.dabamos.de/88x31/fire.gif", alt: "Fire" },
];

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [controls, setControls] = useState<ControlValues>(DEFAULT_CONTROLS);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const runProcessing = useCallback(
    (img: HTMLImageElement, ctrl: ControlValues) => {
      setIsProcessing(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            const result = processImage(img, {
              algorithm: ctrl.algorithm,
              colorCount: ctrl.colorCount,
              threshold: ctrl.threshold,
              brightness: ctrl.brightness,
              contrast: ctrl.contrast,
              resolution: ctrl.resolution,
              upscaleFactor: ctrl.upscaleEnabled ? ctrl.upscaleFactor : 1,
            });
            finalCanvasRef.current = result.final;
            setResultCanvas(result.final);
          } finally {
            setIsProcessing(false);
          }
        }, 0);
      });
    },
    []
  );

  useEffect(() => {
    if (!image) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runProcessing(image, controls);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [image, controls, runProcessing]);

  const handleImageLoaded = useCallback(
    async (file: File) => {
      const img = await loadImageFromFile(file);
      setImage(img);
      runProcessing(img, controls);
    },
    [controls, runProcessing]
  );

  const handleDownload = useCallback(() => {
    if (finalCanvasRef.current) {
      downloadPNG(
        finalCanvasRef.current,
        controls.algorithm,
        controls.colorCount
      );
    }
  }, [controls.algorithm, controls.colorCount]);

  return (
    <div>
      {/* ===== MARQUEE ===== */}
      <div className="marquee">
        <span>
          {"★ Welcome to DitherY2K ★ The BEST dithering tool on the web!!! ★ Make your images look like it's 1999!!! ★ FREE forever!!! ★ No sign-up required!!! ★ "}
        </span>
      </div>

      {/* ===== HEADER ===== */}
      <div className="geo-header">
        <h1 className="wordart">DitherY2K</h1>
        <br />
        <span className="wordart-subtitle">
          {'"'}The Ultimate Retro Image Ditherer!!!{'"'}
        </span>
        <div style={{ marginTop: "10px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://textfiles.com/underconstruction/HesijeLing5049construction.gif"
            alt="Under Construction"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>

      <hr className="rainbow-hr" />

      {/* ===== TABLE LAYOUT: SIDEBAR + MAIN ===== */}
      <div className="geo-table" style={{ padding: "0 8px" }}>
        {/* --- SIDEBAR --- */}
        <div className="geo-sidebar">
          {/* Cool Links */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"☆ Cool Links ☆"}</div>
            <a
              className="sidebar-link"
              href="https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering"
              target="_blank"
              rel="noopener noreferrer"
            >
              {">> "}Floyd-Steinberg
            </a>
            <a
              className="sidebar-link"
              href="https://surma.dev/things/ditherpunk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {">> "}Ditherpunk article
            </a>
            <a
              className="sidebar-link"
              href="https://en.wikipedia.org/wiki/Ordered_dithering"
              target="_blank"
              rel="noopener noreferrer"
            >
              {">> "}Ordered Dithering
            </a>
          </div>

          {/* Site Stats */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"☆ Site Stats ☆"}</div>
            <div className="sidebar-text">
              <span style={{ color: "#00ffff" }}>Online since:</span>
              <br />
              <span style={{ color: "#ffff00" }}>January 2003</span>
              <br />
              <br />
              <span style={{ color: "#00ffff" }}>Total hits:</span>
              <br />
              <span style={{ color: "#ff69b4" }}>
                <span className="blink">48,731</span>
              </span>
              <br />
              <br />
              <span style={{ color: "#00ffff" }}>Last update:</span>
              <br />
              <span style={{ color: "#ffff00" }}>April 2026</span>
            </div>
          </div>

          {/* Under Construction GIF */}
          <div className="sidebar-section" style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://textfiles.com/underconstruction/CosijeLing5012construction.gif"
              alt="Under Construction"
              style={{ imageRendering: "pixelated", maxWidth: "100%" }}
            />
          </div>

          {/* Badges */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"☆ Badges ☆"}</div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                justifyContent: "center",
              }}
            >
              {BADGES.slice(0, 4).map((badge) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={badge.alt}
                  src={badge.src}
                  alt={badge.alt}
                  className="badge-88x31"
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="geo-main">
          {/* Upload zone */}
          <div style={{ marginBottom: "12px" }}>
            <UploadZone onImageLoaded={handleImageLoaded} />
          </div>

          {/* Preview */}
          {image && (
            <Preview
              originalImage={image}
              resultCanvas={resultCanvas}
              isProcessing={isProcessing}
            />
          )}

          {/* Controls */}
          {image && (
            <div style={{ marginTop: "12px" }}>
              <Controls
                values={controls}
                onChange={setControls}
                onDownload={handleDownload}
                hasImage={!!resultCanvas}
              />
            </div>
          )}
        </div>
      </div>

      <hr className="rainbow-hr" />

      {/* ===== FOOTER ===== */}
      <div className="geo-footer">
        <div style={{ marginBottom: "10px" }}>
          <span style={{ color: "#ffffff", fontSize: "14px" }}>
            You are visitor #{" "}
          </span>
          <span className="visitor-counter">00048731</span>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <button
            className="btn-retro tilt-right"
            onClick={() => alert("Thanks for signing! 📝")}
          >
            {"📖 Sign my Guestbook!"}
          </button>
        </div>

        {/* Footer badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          {BADGES.map((badge) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={badge.alt}
              src={badge.src}
              alt={badge.alt}
              className="badge-88x31"
            />
          ))}
        </div>

        <div
          style={{
            color: "#808080",
            fontSize: "12px",
            fontFamily: "'Comic Sans MS', cursive",
          }}
        >
          {"© 2003-2026 DitherY2K | Best viewed in Netscape Navigator 4.0 at 800x600"}
        </div>
      </div>
    </div>
  );
}
