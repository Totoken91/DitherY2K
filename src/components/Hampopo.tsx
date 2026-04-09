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
    <div className="hampopo-row">
      {/* Left Hampopo */}
      <div className="hampopo-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hampopo.png"
          alt="Hampopo"
          className={`hampopo ${isPlaying ? "hampopo-beat-left" : ""}`}
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

      {/* Title — stars are inside the h1 so they never wrap separately */}
      <h1
        className="wordart"
        onClick={() => alert("You found the secret!! You are a true webmaster 🏆")}
        style={{ cursor: "pointer" }}
      >
        <span className="spin-star">{"✦"}</span>
        {" DitherY2K "}
        <span className="spin-star-reverse">{"✦"}</span>
      </h1>

      {/* Right Hampopo */}
      <div className="hampopo-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hampopo.png"
          alt="Hampopo"
          className={`hampopo ${isPlaying ? "hampopo-beat-right" : ""}`}
          style={{ transform: isPlaying ? undefined : "scaleX(-1)" }}
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
