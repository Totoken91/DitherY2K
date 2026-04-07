"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onImageLoaded: (file: File) => void;
}

export default function UploadZone({ onImageLoaded }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (validTypes.includes(file.type)) {
        onImageLoaded(file);
      }
    },
    [onImageLoaded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`marching-ants ${dragging ? "marching-ants-active" : ""}`}
      style={{
        padding: "18px 12px",
        textAlign: "center",
        background: dragging ? "rgba(0,255,0,0.08)" : "rgba(0,0,0,0.4)",
        cursor: 'url("https://kiunlo.neocities.org/cursors/WoW/frostmourne_cursor.png"), pointer',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        style={{ display: "none" }}
      />
      <div
        className="pulse"
        style={{
          fontSize: "20px",
          color: "#ffff00",
          fontFamily: "Impact, sans-serif",
          textShadow: "2px 2px 0 #000",
          marginBottom: "4px",
        }}
      >
        {">> "}Drop your image here!!{" <<"}
      </div>
      <div style={{ color: "#00ffff", fontSize: "11px", fontFamily: "'Comic Sans MS', cursive" }}>
        ...or click to browse (JPG, PNG, WebP)
      </div>
    </div>
  );
}
