"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import UploadZone from "@/components/UploadZone";
import Controls, { type ControlValues } from "@/components/Controls";
import Hampopo from "@/components/Hampopo";

const WebampPlayer = dynamic(() => import("@/components/WebampPlayer"), {
  ssr: false,
});
import Preview from "@/components/Preview";
import Guestbook from "@/components/Guestbook";
import PartyLights from "@/components/PartyLights";
import {
  loadImageFromFile,
  processImage,
  downloadPNG,
} from "@/lib/image-processing";

const DEFAULT_CONTROLS: ControlValues = {
  resolution: "vga",
  cropRatio: "free",
  upscaleEnabled: false,
  upscaleFactor: 2,
  brightness: 0,
  contrast: 0,
  algorithm: "floyd-steinberg",
  colorCount: 16,
  paletteMode: "auto",
  customPalette: ["#000000", "#ffffff", "#ff0000", "#0000ff"],
  threshold: 128,
};

const BADGES = [
  { src: "https://capstasher.neocities.org/88x31Buttons/000%20Y2K%20NEOCITIES%20BUTTON%2001.png", alt: "Y2K Neocities" },
  { src: "https://capstasher.neocities.org/88x31Buttons/angellogo.gif", alt: "Angel" },
  { src: "https://capstasher.neocities.org/88x31Buttons/ani_face.gif", alt: "Face" },
  { src: "https://capstasher.neocities.org/88x31Buttons/17.gif", alt: "17" },
  { src: "https://capstasher.neocities.org/88x31Buttons/128.gif", alt: "128" },
  { src: "https://capstasher.neocities.org/88x31Buttons/104.gif", alt: "104" },
  { src: "https://capstasher.neocities.org/88x31Buttons/button.gif", alt: "Button" },
  { src: "https://capstasher.neocities.org/88x31Buttons/geocites.gif", alt: "GeoCities" },
  { src: "https://capstasher.neocities.org/88x31Buttons/imissxp.gif", alt: "I Miss XP" },
  { src: "https://capstasher.neocities.org/88x31Buttons/kanto.gif", alt: "Kanto" },
  { src: "https://capstasher.neocities.org/88x31Buttons/pizzza.gif", alt: "Pizza" },
  { src: "https://capstasher.neocities.org/88x31Buttons/rainbowhouselogoanimal.gif", alt: "Rainbow House" },
  { src: "https://capstasher.neocities.org/88x31Buttons/tumblr_p7th88cRMg1x4py3to1_100.gif", alt: "Tumblr 1" },
  { src: "https://capstasher.neocities.org/88x31Buttons/tumblr_ptml3xpk7A1xwjivko2_100.gif", alt: "Tumblr 2" },
];

// Visitor number is fetched from the API

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [controls, setControls] = useState<ControlValues>(DEFAULT_CONTROLS);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ditheredCount, setDitheredCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState("00000000");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch + increment visitor count on mount
  useEffect(() => {
    fetch("/api/visit", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setVisitorCount(String(d.count).padStart(8, "0")))
      .catch(() => {});
  }, []);
  const finalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevImageRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const runProcessing = useCallback(
    (img: HTMLImageElement, ctrl: ControlValues) => {
      setIsProcessing(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            const result = processImage(img, {
              resolution: ctrl.resolution,
              cropRatio: ctrl.cropRatio,
              upscaleFactor: ctrl.upscaleEnabled ? ctrl.upscaleFactor : 1,
              brightness: ctrl.brightness,
              contrast: ctrl.contrast,
              dither: {
                algorithm: ctrl.algorithm,
                colorCount: ctrl.colorCount,
                paletteMode: ctrl.paletteMode,
                customPalette: ctrl.customPalette,
                threshold: ctrl.threshold,
                brightness: ctrl.brightness,
                contrast: ctrl.contrast,
              },
            });
            finalCanvasRef.current = result.final;
            setResultCanvas(result.final);
            setDitheredCount((c) => c + 1);
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
    const isNewImage = prevImageRef.current !== image;
    prevImageRef.current = image;
    const delay = isNewImage ? 0 : 200;
    debounceRef.current = setTimeout(() => {
      runProcessing(image, controls);
    }, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [image, controls, runProcessing]);

  const handleImageLoaded = useCallback(async (file: File) => {
    try {
      const img = await loadImageFromFile(file);
      setImage(img);
      // Scroll to preview after a short delay (let React render first)
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch {
      alert("Failed to load image. Please try a different file.");
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (finalCanvasRef.current) {
      downloadPNG(finalCanvasRef.current, controls.algorithm, controls.colorCount);
    }
  }, [controls.algorithm, controls.colorCount]);

  return (
    <div id="top">
      {/* ===== TOP MARQUEE ===== */}
      <div className="marquee">
        <span>
          {"★ Welcome to DitherY2K ★ The BEST dithering tool on the web!!! ★ Make your images look like it's 1999!!! ★ FREE forever!!! ★ No sign-up required!!! ★ Now with 4 algorithms!!! ★ Rated #1 by nobody!!! ★ "}
        </span>
      </div>

      {/* ===== HEADER ===== */}
      <div className="geo-header">
        <div className="gif-divider">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gifs/fire-bar.png" alt="" style={{ width: "100%", height: "8px" }} />
        </div>

        {/* Hampopo + Title */}
        <Hampopo />

        <div>
          <span className="wordart-subtitle">
            {'"The Ultimate Retro Image Ditherer!!!"'}
          </span>
          <span className="new-badge">NEW!</span>
        </div>

        <div className="mobile-hide" style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center", margin: "6px 0" }}>
          <span className="blink" style={{ color: "#ff0000", fontSize: "14px" }}>{"⚠️"}</span>
          <span className="rainbow-text" style={{ fontFamily: "'Silkscreen', cursive", fontSize: "14px" }}>
            {"WARNING : EXTREMELY COOL"}
          </span>
          <span className="blink" style={{ color: "#ff0000", fontSize: "14px" }}>{"⚠️"}</span>
        </div>

        <div className="gif-divider">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gifs/fire-bar.png" alt="" style={{ width: "100%", height: "8px" }} />
        </div>
      </div>

      {/* ===== RAINBOW DIVIDER ===== */}
      <div className="gif-divider">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gifs/rainbow-divider.png" alt="" style={{ width: "100%", height: "6px" }} />
      </div>

      {/* ===== TABLE LAYOUT ===== */}
      <div className="geo-table" style={{ padding: "0 4px" }}>
        {/* --- SIDEBAR --- */}
        <div className="geo-sidebar">
          {/* Mobile: collapsible toggle */}
          <button
            className="btn-retro sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: "100%", marginBottom: "4px", fontSize: "12px", textAlign: "center" }}
          >
            {sidebarOpen ? "▼ Hide Site Info ▼" : "★ Show Site Info ★"}
          </button>
          <div className={`sidebar-content ${sidebarOpen ? "sidebar-open" : ""}`}>
          {/* Webmaster */}
          <div className="sidebar-section">
            <div className="sidebar-title glow-pink">{"★ Welcome! ★"}</div>
            <div className="sidebar-text">
              <span style={{ color: "#ffff00" }}>This site made by</span>
              <br />
              <span style={{ color: "#ff6600", fontWeight: "bold" }}>totoken</span>
              <hr className="rainbow-hr" />
              <span style={{ color: "#ff69b4", fontSize: "10px" }}>
                {">> "}
                <a href="#" style={{ color: "#00ffff", fontSize: "10px" }}>
                  Best viewed in Netscape Navigator 4.0 at 800×600
                </a>
              </span>
            </div>
          </div>

          {/* Cool Links */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"☆ Cool Links ☆"}</div>
            <a className="sidebar-link" href="https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering" target="_blank" rel="noopener noreferrer">
              {">> "}Floyd-Steinberg
            </a>
            <a className="sidebar-link" href="https://surma.dev/things/ditherpunk/" target="_blank" rel="noopener noreferrer">
              {">> "}Ditherpunk<span className="new-badge">NEW!</span>
            </a>
            <a className="sidebar-link" href="https://en.wikipedia.org/wiki/Ordered_dithering" target="_blank" rel="noopener noreferrer">
              {">> "}Ordered Dithering
            </a>
            <a className="sidebar-link" href="https://en.wikipedia.org/wiki/Atkinson_dithering" target="_blank" rel="noopener noreferrer">
              {">> "}Atkinson (Mac)
            </a>
          </div>

          {/* Site Stats */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"☆ Site Stats ☆"}</div>
            <div className="sidebar-text">
              <span style={{ color: "#00ffff" }}>Online since:</span>{" "}
              <span style={{ color: "#ffff00" }}>Jan 2003</span>
              <br />
              <span style={{ color: "#00ffff" }}>Hits:</span>{" "}
              <span className="blink" style={{ color: "#ff69b4", fontWeight: "bold" }}>48,731</span>
              <br />
              <span style={{ color: "#00ffff" }}>Updated:</span>{" "}
              <span style={{ color: "#ffff00" }}>Apr 2026</span>
              <br />
              <span style={{ color: "#00ffff" }}>Images dithered:</span>{" "}
              <span style={{ color: "#00ff00", fontWeight: "bold" }}>{ditheredCount}</span>
            </div>
          </div>

          {/* Extremely Cool */}
          <div className="sidebar-section" style={{ textAlign: "center" }}>
            <div className="blink" style={{ color: "#ff0000", fontSize: "11px", fontWeight: "bold" }}>{"⚠️ WARNING ⚠️"}</div>
            <div className="rainbow-text" style={{ fontSize: "12px", fontFamily: "'Silkscreen', cursive", margin: "2px 0" }}>EXTREMELY COOL</div>
            <div style={{ color: "#ffff00", fontSize: "10px" }}>More features soon!!!</div>
          </div>

          {/* Badges */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"☆ Badges ☆"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", justifyContent: "center" }}>
              {BADGES.slice(0, 6).map((b) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={b.alt} src={b.src} alt={b.alt} className="badge-88x31" />
              ))}
            </div>
          </div>

          {/* Guestbook */}
          <div className="sidebar-section" style={{ textAlign: "center" }}>
            <Guestbook />
          </div>

          {/* Email */}
          <div className="sidebar-section" style={{ textAlign: "center" }}>
            <span style={{ color: "#00ffff", fontSize: "10px" }}>
              {"📧 "}
              <span style={{ color: "#ffff00" }}>totoken</span>
              <br />
              <span style={{ color: "#808080" }}>@geocities.com</span>
            </span>
          </div>
          </div>{/* end sidebar-content */}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="geo-main">
          <div className="main-flow">
            {/* Upload zone */}
            <div className="groove-box main-upload" style={{ padding: "4px" }}>
              <UploadZone onImageLoaded={handleImageLoaded} />
            </div>

            {/* Controls */}
            {image && (
              <div className="main-controls">
                <Controls
                  values={controls}
                  onChange={setControls}
                  onDownload={handleDownload}
                  hasImage={!!resultCanvas}
                />
              </div>
            )}

            {/* Preview */}
            {image && (
              <div ref={previewRef} className="groove-box main-preview" style={{ padding: "4px" }}>
                <Preview
                  originalImage={image}
                  resultCanvas={resultCanvas}
                  isProcessing={isProcessing}
                />
              </div>
            )}

          </div>{/* end main-flow */}

          {/* How to use (when no image) */}
          {!image && (
            <div className="outset-box" style={{ marginTop: "4px" }}>
              <div style={{
                fontFamily: "'Silkscreen', cursive",
                color: "#ff00ff",
                fontSize: "16px",
                textShadow: "2px 2px 0 #000",
                marginBottom: "6px",
                textAlign: "center",
              }}>
                {"~~ DiThEr SeTtInGs ~~"}
              </div>
              <div style={{ color: "#ffffff", fontSize: "12px", lineHeight: "1.7" }}>
                <span style={{ color: "#ffff00" }}>{"1."}</span> Upload an image (drag & drop or click)
                <br />
                <span style={{ color: "#ffff00" }}>{"2."}</span> Pick a{" "}
                <span style={{ color: "#00ffff" }}>dithering algorithm</span>
                <br />
                <span style={{ color: "#ffff00" }}>{"3."}</span> Adjust colors, resolution & more
                <br />
                <span style={{ color: "#ffff00" }}>{"4."}</span> Download your{" "}
                <span className="rainbow-text">sick retro image!!!</span>
                <hr className="rainbow-hr" />
                <span style={{ color: "#ff69b4", fontSize: "10px" }}>
                  Supports: Floyd-Steinberg, Atkinson, Ordered Bayer & Threshold
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== RAINBOW DIVIDER ===== */}
      <div className="gif-divider">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gifs/rainbow-divider.png" alt="" style={{ width: "100%", height: "6px" }} />
      </div>

      {/* ===== FOOTER ===== */}
      <div className="geo-footer">
        <div className="gif-divider" style={{ marginBottom: "6px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gifs/fire-bar.png" alt="" style={{ width: "60%", height: "8px" }} />
        </div>

        {/* Visitor counter */}
        <div style={{ marginBottom: "6px" }}>
          <span style={{ color: "#ffffff", fontSize: "12px" }}>You are visitor # </span>
          <span className="visitor-counter">
            {visitorCount.split("").map((d, i) => (
              <span key={i} className="visitor-digit">{d}</span>
            ))}
          </span>
        </div>

        {/* Buttons row */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "6px" }}>
          <button className="btn-retro" onClick={() => alert("Nice try hacker!! 😎")} style={{ fontSize: "11px" }}>
            {"👀 View Source"}
          </button>
          <a href="#top" className="btn-retro" style={{ fontSize: "11px", textDecoration: "none", color: "#000" }}>
            {"↑ Back to Top"}
          </a>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", justifyContent: "center", marginBottom: "6px" }}>
          {BADGES.map((b) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={b.alt} src={b.src} alt={b.alt} className="badge-88x31" />
          ))}
        </div>

        <div className="gif-divider" style={{ marginBottom: "4px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gifs/fire-bar.png" alt="" style={{ width: "60%", height: "6px" }} />
        </div>

        <div style={{ color: "#808080", fontSize: "10px", fontFamily: "'VT323', monospace" }}>
          {"© 2003-2026 DitherY2K. All rights reserved."}
          <br />
          <span style={{ color: "#666" }}>
            {"Unauthorized dithering is prohibited. Made with "}
            <span style={{ color: "#ff0000" }}>{"♥"}</span>
            {" and too much free time"}
          </span>
        </div>
      </div>

      {/* ===== BOTTOM MARQUEE (reverse) ===== */}
      <div className="marquee marquee-reverse">
        <span>
          {"♪ Thanks for visiting DitherY2K ♪ Come back soon!!! ♪ Tell your friends!!! ♪ Add me to your bookmarks!!! ♪ Sign my guestbook!!! ♪ "}
        </span>
      </div>

      {/* Party lights overlay (only when music plays) */}
      <PartyLights />

      {/* Webamp — renders as floating Winamp player */}
      <WebampPlayer />
    </div>
  );
}
