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
  { src: "https://cyber.dabamos.de/88x31/ie_logo.gif", alt: "Internet Explorer" },
  { src: "https://cyber.dabamos.de/88x31/html.gif", alt: "HTML" },
  { src: "https://cyber.dabamos.de/88x31/notepad.gif", alt: "Made with Notepad" },
  { src: "https://cyber.dabamos.de/88x31/www.gif", alt: "World Wide Web" },
  { src: "https://cyber.dabamos.de/88x31/javascript.gif", alt: "JavaScript" },
  { src: "https://cyber.dabamos.de/88x31/css.gif", alt: "CSS" },
  { src: "https://cyber.dabamos.de/88x31/fire.gif", alt: "Fire" },
];

const VISITOR_NUMBER = "00048731";

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [controls, setControls] = useState<ControlValues>(DEFAULT_CONTROLS);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
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
      downloadPNG(finalCanvasRef.current, controls.algorithm, controls.colorCount);
    }
  }, [controls.algorithm, controls.colorCount]);

  return (
    <div>
      {/* ===== MARQUEE ===== */}
      <div className="marquee">
        <span>
          {"★ Welcome to DitherY2K ★ The BEST dithering tool on the web!!! ★ Make your images look like it's 1999!!! ★ FREE forever!!! ★ No sign-up required!!! ★ Now with 4 algorithms!!! ★ "}
        </span>
      </div>

      {/* ===== HEADER ===== */}
      <div className="geo-header">
        {/* Fire divider top */}
        <div className="gif-divider">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://web.archive.org/web/2009/http://www.geocities.com/SoHo/7373/bar.gif"
            alt="decorative fire bar"
            style={{ height: "16px" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        <h1 className="wordart">{"✧ DitherY2K ✧"}</h1>
        <br />
        <span className="wordart-subtitle">
          {'"The Ultimate Retro Image Ditherer!!!"'}
        </span>
        <span className="new-badge">NEW!</span>

        <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "12px", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://textfiles.com/underconstruction/HesijeLing5049construction.gif"
            alt="Under Construction"
            className="sparkle"
            style={{ imageRendering: "pixelated" }}
          />
          <span className="fire-text" style={{ fontFamily: "Impact, sans-serif", fontSize: "14px" }}>
            {">>> UNDER CONSTRUCTION <<<"}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://textfiles.com/underconstruction/HesijeLing5049construction.gif"
            alt="Under Construction"
            className="sparkle"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* Fire divider bottom */}
        <div className="gif-divider" style={{ marginTop: "8px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://web.archive.org/web/2009/http://www.geocities.com/SoHo/7373/bar.gif"
            alt="decorative fire bar"
            style={{ height: "16px" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      </div>

      <hr className="rainbow-hr" />

      {/* ===== TABLE LAYOUT: SIDEBAR + MAIN ===== */}
      <div className="geo-table" style={{ padding: "0 8px" }}>
        {/* --- SIDEBAR --- */}
        <div className="geo-sidebar">
          {/* Welcome message */}
          <div className="sidebar-section">
            <div className="sidebar-title glow-pink">{"★ Welcome! ★"}</div>
            <div className="sidebar-text" style={{ color: "#ffff00" }}>
              Welcome to my awesome dithering tool!! Made with{" "}
              <span style={{ color: "#ff0000" }}>{"<3"}</span> and lots of{" "}
              <span style={{ color: "#00ffff" }}>JavaScript</span>
              <br /><br />
              <span style={{ color: "#ff69b4", fontSize: "11px" }}>
                {">> "}Best viewed in{" "}
                <span className="blink" style={{ color: "#00ff00" }}>800x600</span>
              </span>
            </div>
          </div>

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
              <span className="new-badge">NEW!</span>
            </a>
            <a
              className="sidebar-link"
              href="https://en.wikipedia.org/wiki/Ordered_dithering"
              target="_blank"
              rel="noopener noreferrer"
            >
              {">> "}Ordered Dithering
            </a>
            <a
              className="sidebar-link"
              href="https://en.wikipedia.org/wiki/Atkinson_dithering"
              target="_blank"
              rel="noopener noreferrer"
            >
              {">> "}Atkinson (Mac)
            </a>
          </div>

          {/* Site Stats */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"☆ Site Stats ☆"}</div>
            <div className="sidebar-text">
              <span style={{ color: "#00ffff" }}>{">> "}Online since:</span>
              <br />
              <span style={{ color: "#ffff00" }}>January 2003</span>
              <br /><br />
              <span style={{ color: "#00ffff" }}>{">> "}Total hits:</span>
              <br />
              <span className="blink" style={{ color: "#ff69b4", fontWeight: "bold" }}>
                48,731
              </span>
              <br /><br />
              <span style={{ color: "#00ffff" }}>{">> "}Last update:</span>
              <br />
              <span style={{ color: "#ffff00" }}>April 2026</span>
              <br /><br />
              <span style={{ color: "#00ffff" }}>{">> "}Webmaster:</span>
              <br />
              <span style={{ color: "#ff6600" }}>xX_D1th3rM4st3r_Xx</span>
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
            <div style={{ color: "#ff0000", fontSize: "11px", marginTop: "4px" }}>
              {"More features coming soon!!!"}
            </div>
          </div>

          {/* Sidebar Badges */}
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

          {/* Guestbook in sidebar */}
          <div className="sidebar-section" style={{ textAlign: "center" }}>
            <button
              className="btn-retro tilt-left"
              onClick={() => alert("Thanks for signing! 📝")}
              style={{ fontSize: "12px" }}
            >
              {"📖 Sign my Guestbook!"}
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="geo-main">
          {/* Upload zone */}
          <div className="groove-box">
            <UploadZone onImageLoaded={handleImageLoaded} />
          </div>

          {/* Preview */}
          {image && (
            <div className="groove-box">
              <Preview
                originalImage={image}
                resultCanvas={resultCanvas}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {/* Controls */}
          {image && (
            <div style={{ marginTop: "8px" }}>
              <Controls
                values={controls}
                onChange={setControls}
                onDownload={handleDownload}
                hasImage={!!resultCanvas}
              />
            </div>
          )}

          {/* Info section */}
          {!image && (
            <div className="outset-box" style={{ marginTop: "12px" }}>
              <div style={{
                fontFamily: "Impact, sans-serif",
                color: "#ff00ff",
                fontSize: "18px",
                textShadow: "2px 2px 0 #000",
                marginBottom: "8px",
                textAlign: "center",
              }}>
                {"~ HOW TO USE ~"}
              </div>
              <div style={{ color: "#ffffff", fontSize: "13px", lineHeight: "1.8" }}>
                <span style={{ color: "#ffff00" }}>{"1."}</span>{" "}
                Upload an image (drag & drop or click)
                <br />
                <span style={{ color: "#ffff00" }}>{"2."}</span>{" "}
                Pick a <span style={{ color: "#00ffff" }}>dithering algorithm</span>
                <br />
                <span style={{ color: "#ffff00" }}>{"3."}</span>{" "}
                Adjust colors, resolution, brightness & contrast
                <br />
                <span style={{ color: "#ffff00" }}>{"4."}</span>{" "}
                Download your <span className="rainbow-text">sick retro image!!!</span>
                <br /><br />
                <span style={{ color: "#ff69b4", fontSize: "11px" }}>
                  {">> "}Supports Floyd-Steinberg, Atkinson, Ordered Bayer & Threshold
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="rainbow-hr" />

      {/* ===== FOOTER ===== */}
      <div className="geo-footer">
        {/* Divider GIF */}
        <div className="gif-divider" style={{ marginBottom: "12px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://web.archive.org/web/2009/http://www.geocities.com/SoHo/7373/bar.gif"
            alt="decorative bar"
            style={{ height: "12px" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        {/* Visitor Counter */}
        <div style={{ marginBottom: "12px" }}>
          <span style={{ color: "#ffffff", fontSize: "14px" }}>
            You are visitor #
          </span>
          <span
            className="visitor-counter"
            style={{
              display: "inline-flex",
              gap: "0",
              padding: "4px 6px",
              border: "2px inset #808080",
              background: "#000",
            }}
          >
            {VISITOR_NUMBER.split("").map((digit, i) => (
              <span key={i} className="visitor-digit">
                {digit}
              </span>
            ))}
          </span>
        </div>

        {/* Guestbook button */}
        <div style={{ marginBottom: "12px" }}>
          <button
            className="btn-retro tilt-right"
            onClick={() => alert("Thanks for signing! 📝")}
          >
            {"📖 Sign my Guestbook!"}
          </button>
        </div>

        {/* Email the webmaster */}
        <div style={{ marginBottom: "12px" }}>
          <span style={{ color: "#00ffff", fontSize: "12px" }}>
            {"📧 Email the webmaster: "}
            <span style={{ color: "#ffff00" }}>xX_D1th3rM4st3r_Xx@geocities.com</span>
          </span>
        </div>

        {/* Footer badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            justifyContent: "center",
            marginBottom: "12px",
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

        {/* Divider GIF */}
        <div className="gif-divider" style={{ marginBottom: "8px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://web.archive.org/web/2009/http://www.geocities.com/SoHo/7373/bar.gif"
            alt="decorative bar"
            style={{ height: "12px" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        <div style={{
          color: "#808080",
          fontSize: "11px",
          fontFamily: "'Comic Sans MS', cursive",
        }}>
          {"© 2003-2026 DitherY2K"}
          <br />
          <span style={{ color: "#666" }}>
            {"Best viewed in Netscape Navigator 4.0 at 800x600 | Made with "}
            <span style={{ color: "#ff0000" }}>{"♥"}</span>
            {" and too much free time"}
          </span>
        </div>
      </div>
    </div>
  );
}
