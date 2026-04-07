"use client";

import { useEffect, useState } from "react";

export default function Hampopo() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setIsPlaying((e as CustomEvent).detail);
    };
    window.addEventListener("webamp-playing", handler);
    return () => window.removeEventListener("webamp-playing", handler);
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", margin: "4px 0" }}>
      {/* Left Hampopo */}
      <div className="hampopo-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hampopo.png"
          alt="Hampopo"
          className={isPlaying ? "hampopo hampopo-beat-left" : ""}
          style={{ width: "56px", height: "auto" }}
        />
        {isPlaying && (
          <>
            <span className="hampopo-star">{"✦"}</span>
            <span className="hampopo-star">{"★"}</span>
            <span className="hampopo-star">{"✧"}</span>
            <span className="hampopo-star">{"❤"}</span>
            <span className="hampopo-star">{"✦"}</span>
            <span className="hampopo-star">{"★"}</span>
          </>
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

      {/* Right Hampopo (slightly different timing) */}
      <div className="hampopo-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hampopo.png"
          alt="Hampopo"
          className={isPlaying ? "hampopo hampopo-beat-right" : ""}
          style={{ width: "56px", height: "auto", transform: "scaleX(-1)" }}
        />
        {isPlaying && (
          <>
            <span className="hampopo-star">{"✦"}</span>
            <span className="hampopo-star">{"★"}</span>
            <span className="hampopo-star">{"✧"}</span>
            <span className="hampopo-star">{"❤"}</span>
            <span className="hampopo-star">{"✦"}</span>
            <span className="hampopo-star">{"★"}</span>
          </>
        )}
      </div>
    </div>
  );
}
