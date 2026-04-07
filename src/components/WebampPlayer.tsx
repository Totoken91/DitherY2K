"use client";

import { useEffect, useRef, useState } from "react";

export default function WebampPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webampRef = useRef<unknown>(null);
  const initedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible || initedRef.current || !containerRef.current) return;
    initedRef.current = true;

    const initWebamp = async () => {
      const Webamp = (await import("webamp")).default;

      if (!Webamp.browserIsSupported()) return;

      const webamp = new Webamp({
        initialTracks: [
          {
            metaData: {
              artist: "Claas Herrmann",
              title: "Raskolnikow (Original Mix)",
            },
            url: "/music.mp3",
          },
        ],
        initialSkin: {
          url: "https://archive.org/cors/winampskin_Purple_Glow/Purple_Glow.wsz",
        },
        zIndex: 1000,
      });

      await webamp.renderWhenReady(containerRef.current!);
      webampRef.current = webamp;

      // Auto-play
      webamp.play();

      // If user closes Webamp via its own close button, hide our toggle
      webamp.onClose(() => {
        setVisible(false);
        initedRef.current = false;
      });
    };

    initWebamp();
  }, [visible]);

  return (
    <>
      {/* Toggle button — always visible */}
      {!visible && (
        <button
          className="btn-retro"
          onClick={() => setVisible(true)}
          style={{
            position: "fixed",
            bottom: "10px",
            left: "10px",
            zIndex: 999,
            fontSize: "12px",
            padding: "4px 10px",
          }}
        >
          {"🎵 Open Winamp"}
        </button>
      )}

      {/* Webamp container — only mounted when visible */}
      {visible && <div ref={containerRef} id="webamp-container" />}
    </>
  );
}
