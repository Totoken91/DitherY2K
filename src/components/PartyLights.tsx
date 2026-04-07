"use client";

import { useEffect, useState } from "react";

export default function PartyLights() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setIsPlaying((e as CustomEvent).detail);
    };
    window.addEventListener("webamp-playing", handler);
    return () => window.removeEventListener("webamp-playing", handler);
  }, []);

  if (!isPlaying) return null;

  return (
    <div className="party-overlay" aria-hidden="true">
      {/* Spotlights */}
      <div className="spotlight spotlight-1" />
      <div className="spotlight spotlight-2" />
      <div className="spotlight spotlight-3" />
      <div className="spotlight spotlight-4" />
      {/* Lasers */}
      <div className="laser laser-1" />
      <div className="laser laser-2" />
      <div className="laser laser-3" />
    </div>
  );
}
