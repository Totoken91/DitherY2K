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
    },
    [handleFile]
  );

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      style={{
        border: dragging ? "3px dashed #00FF00" : "3px dashed #FFFF00",
        borderRadius: 0,
        padding: "30px 20px",
        textAlign: "center",
        background: dragging ? "rgba(0,255,0,0.1)" : "rgba(0,0,0,0.3)",
        cursor: "pointer",
        fontFamily: "'Comic Sans MS', cursive",
        color: "#FFFF00",
        fontSize: "16px",
        transition: "border-color 0.2s",
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        style={{ display: "none" }}
      />
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>
        {">> "}Drop your image here!!{" <<"}
      </div>
      <div style={{ color: "#00FFFF" }}>
        ...or click to browse (JPG, PNG, WebP)
      </div>
    </div>
  );
}
