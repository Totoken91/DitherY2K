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

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [controls, setControls] = useState<ControlValues>(DEFAULT_CONTROLS);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref to the latest final canvas for download
  const finalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Process image whenever image or controls change (debounced)
  const runProcessing = useCallback(
    (img: HTMLImageElement, ctrl: ControlValues) => {
      setIsProcessing(true);

      // Use requestAnimationFrame + setTimeout to let the UI update before heavy work
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

  // Debounce control changes
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
      // Immediate processing (no debounce for first load)
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
      {/* Upload zone (shown when no image) */}
      {!image && (
        <div style={{ padding: "20px" }}>
          <UploadZone onImageLoaded={handleImageLoaded} />
        </div>
      )}

      {/* Main content when image is loaded */}
      {image && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Main area */}
          <div style={{ flex: 1, minWidth: "300px" }}>
            {/* Re-upload */}
            <div style={{ marginBottom: "12px" }}>
              <UploadZone onImageLoaded={handleImageLoaded} />
            </div>

            {/* Preview */}
            <Preview
              originalImage={image}
              resultCanvas={resultCanvas}
              isProcessing={isProcessing}
            />
          </div>

          {/* Controls sidebar */}
          <div style={{ width: "260px", flexShrink: 0 }}>
            <Controls
              values={controls}
              onChange={setControls}
              onDownload={handleDownload}
              hasImage={!!resultCanvas}
            />
          </div>
        </div>
      )}
    </div>
  );
}
