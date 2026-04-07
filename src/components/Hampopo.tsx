"use client";

import { useEffect, useState, useRef } from "react";

export default function Hampopo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bass, setBass] = useState(0);
  const leftRef = useRef<HTMLImageElement>(null);
  const rightRef = useRef<HTMLImageElement>(null);
  const starsLeftRef = useRef<HTMLDivElement>(null);
  const starsRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { playing, bass: b } = (e as CustomEvent).detail;
      setIsPlaying(playing);
      setBass(b);
    };
    window.addEventListener("webamp-audio", handler);
    return () => window.removeEventListener("webamp-audio", handler);
  }, []);

  // Apply bass-driven transforms directly via refs for smooth performance
  useEffect(() => {
    if (!isPlaying) {
      // Reset transforms when not playing
      if (leftRef.current) leftRef.current.style.transform = "none";
      if (rightRef.current) rightRef.current.style.transform = "scaleX(-1)";
      return;
    }

    // Bass drives the bounce height and scale
    const bounce = bass * 18; // max 18px jump
    const scale = 1 + bass * 0.08; // max 8% scale up
    const rotL = bass * -6; // tilt left
    const rotR = bass * 6; // tilt right

    if (leftRef.current) {
      leftRef.current.style.transform =
        `translateY(-${bounce}px) rotate(${rotL}deg) scale(${scale})`;
    }
    if (rightRef.current) {
      rightRef.current.style.transform =
        `translateY(-${bounce}px) scaleX(-1) rotate(${rotR}deg) scale(${scale})`;
    }
  }, [bass, isPlaying]);

  // Stars visibility based on bass threshold
  const showStars = isPlaying && bass > 0.3;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", margin: "4px 0" }}>
      {/* Left Hampopo */}
      <div className="hampopo-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={leftRef}
          src="/hampopo.png"
          alt="Hampopo"
          className="hampopo"
          style={{ width: "56px", height: "auto", transition: "transform 0.08s ease-out" }}
        />
        {showStars && (
          <div ref={starsLeftRef}>
            <span className="hampopo-star">{"✦"}</span>
            <span className="hampopo-star">{"★"}</span>
            <span className="hampopo-star">{"✧"}</span>
            <span className="hampopo-star">{"❤"}</span>
            <span className="hampopo-star">{"✦"}</span>
            <span className="hampopo-star">{"★"}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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

      {/* Right Hampopo */}
      <div className="hampopo-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={rightRef}
          src="/hampopo.png"
          alt="Hampopo"
          className="hampopo"
          style={{ width: "56px", height: "auto", transform: "scaleX(-1)", transition: "transform 0.08s ease-out" }}
        />
        {showStars && (
          <div ref={starsRightRef}>
            <span className="hampopo-star">{"✦"}</span>
            <span className="hampopo-star">{"★"}</span>
            <span className="hampopo-star">{"✧"}</span>
            <span className="hampopo-star">{"❤"}</span>
            <span className="hampopo-star">{"✦"}</span>
            <span className="hampopo-star">{"★"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
