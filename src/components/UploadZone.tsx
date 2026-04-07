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
      // Reset so re-uploading the same file triggers onChange again
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
      style={{
        border: dragging ? "3px dashed #00FF00" : "3px dashed #FFFF00",
        padding: "24px 16px",
        textAlign: "center",
        background: dragging ? "rgba(0,255,0,0.1)" : "rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "border-color 0.2s",
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
        style={{
          fontSize: "24px",
          color: "#ffff00",
          fontFamily: "Impact, sans-serif",
          textShadow: "2px 2px 0 #000",
          marginBottom: "6px",
        }}
      >
        {">> "}Drop your image here!!{" <<"}
      </div>
      <div
        style={{
          color: "#00ffff",
          fontSize: "13px",
          fontFamily: "'Comic Sans MS', cursive",
        }}
      >
        ...or click to browse (JPG, PNG, WebP)
      </div>
    </div>
  );
}
