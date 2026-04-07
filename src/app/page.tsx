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
  { src: "/gifs/badge-netscape.png", alt: "Netscape Now" },
  { src: "/gifs/badge-html.png", alt: "HTML" },
  { src: "/gifs/badge-js.png", alt: "JavaScript" },
  { src: "/gifs/badge-css.png", alt: "CSS" },
  { src: "/gifs/badge-fire.png", alt: "Fire!" },
  { src: "/gifs/badge-www.png", alt: "WWW" },
  { src: "/gifs/badge-y2k.png", alt: "Y2K" },
  { src: "/gifs/badge-notepad.png", alt: "Notepad" },
];

const AWARDS = [
  { src: "/gifs/award-best.png", alt: "Best of Web 2003" },
  { src: "/gifs/award-top.png", alt: "Top 100 Sites" },
  { src: "/gifs/award-choice.png", alt: "Webmaster's Choice" },
];

const VISITOR_NUMBER = "00048731";

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [controls, setControls] = useState<ControlValues>(DEFAULT_CONTROLS);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ditheredCount, setDitheredCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevImageRef = useRef<HTMLImageElement | null>(null);

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

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", margin: "6px 0" }}>
          <span className="spin-star">{"✦"}</span>
          <span className="spin-star-reverse">{"✧"}</span>
          <h1
            className="wordart"
            onClick={() => alert("You found the secret!! You are a true webmaster 🏆")}
            style={{ cursor: "pointer" }}
          >
            {"✧ DitherY2K ✧"}
          </h1>
          <span className="spin-star-reverse">{"✧"}</span>
          <span className="spin-star">{"✦"}</span>
        </div>

        <div>
          <span className="wordart-subtitle">
            {'"The Ultimate Retro Image Ditherer!!!"'}
          </span>
          <span className="new-badge">NEW!</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "center", margin: "6px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gifs/under-construction.png" alt="Under Construction" className="sparkle" style={{ height: "20px", imageRendering: "pixelated" }} />
          <span className="fire-text" style={{ fontFamily: "Impact, sans-serif", fontSize: "12px" }}>
            {"⚠️ UNDER CONSTRUCTION ⚠️"}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gifs/under-construction.png" alt="Under Construction" className="sparkle" style={{ height: "20px", imageRendering: "pixelated" }} />
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
          {/* Webmaster */}
          <div className="sidebar-section">
            <div className="sidebar-title glow-pink">{"★ Welcome! ★"}</div>
            <div className="sidebar-text">
              <span style={{ color: "#ffff00" }}>This site made by</span>
              <br />
              <span style={{ color: "#ff6600", fontWeight: "bold" }}>xX_D1th3rM4st3r_Xx</span>
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

          {/* Under Construction */}
          <div className="sidebar-section" style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gifs/under-construction2.png" alt="Under Construction" style={{ imageRendering: "pixelated" }} />
            <div style={{ color: "#ff0000", fontSize: "10px" }}>More features soon!!!</div>
          </div>

          {/* Awards */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"🏆 Awards 🏆"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", justifyContent: "center" }}>
              {AWARDS.map((a) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={a.alt} src={a.src} alt={a.alt} className="badge-88x31" />
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="sidebar-section">
            <div className="sidebar-title">{"☆ Badges ☆"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", justifyContent: "center" }}>
              {BADGES.slice(0, 4).map((b) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={b.alt} src={b.src} alt={b.alt} className="badge-88x31" />
              ))}
            </div>
          </div>

          {/* Guestbook */}
          <div className="sidebar-section" style={{ textAlign: "center" }}>
            <button className="btn-retro tilt-left" onClick={() => alert("Thanks for signing! 📝")} style={{ fontSize: "11px" }}>
              {"📖 Sign Guestbook!"}
            </button>
          </div>

          {/* Email */}
          <div className="sidebar-section" style={{ textAlign: "center" }}>
            <span style={{ color: "#00ffff", fontSize: "10px" }}>
              {"📧 "}
              <span style={{ color: "#ffff00" }}>xX_D1th3rM4st3r_Xx</span>
              <br />
              <span style={{ color: "#808080" }}>@geocities.com</span>
            </span>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="geo-main">
          {/* Upload zone */}
          <div className="groove-box" style={{ padding: "4px" }}>
            <UploadZone onImageLoaded={handleImageLoaded} />
          </div>

          {/* Preview */}
          {image && (
            <div className="groove-box" style={{ padding: "4px" }}>
              <Preview
                originalImage={image}
                resultCanvas={resultCanvas}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {/* Controls — directly under preview, always visible */}
          {image && (
            <Controls
              values={controls}
              onChange={setControls}
              onDownload={handleDownload}
              hasImage={!!resultCanvas}
            />
          )}

          {/* How to use (when no image) */}
          {!image && (
            <div className="outset-box" style={{ marginTop: "4px" }}>
              <div style={{
                fontFamily: "Impact, sans-serif",
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
            {VISITOR_NUMBER.split("").map((d, i) => (
              <span key={i} className="visitor-digit">{d}</span>
            ))}
          </span>
        </div>

        {/* Buttons row */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "6px" }}>
          <button className="btn-retro" onClick={() => alert("Thanks for signing! 📝")} style={{ fontSize: "11px" }}>
            {"📖 Sign Guestbook!"}
          </button>
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

        <div style={{ color: "#808080", fontSize: "10px", fontFamily: "'Comic Sans MS', cursive" }}>
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
    </div>
  );
}
