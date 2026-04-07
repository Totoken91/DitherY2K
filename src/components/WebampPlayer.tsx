"use client";

import { useEffect, useRef } from "react";

export default function WebampPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webampRef = useRef<unknown>(null);
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const initWebamp = async () => {
      const Webamp = (await import("webamp")).default;

      if (!Webamp.browserIsSupported()) return;

      const webamp = new Webamp({
        initialTracks: [
          {
            metaData: { artist: "Darude", title: "Sandstorm" },
            url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
            duration: 5.322286,
          },
        ],
        initialSkin: {
          url: "https://archive.org/cors/winampskin_Purple_Glow/Purple_Glow.wsz",
        },
        zIndex: 100,
      });

      if (containerRef.current) {
        await webamp.renderWhenReady(containerRef.current);
        webampRef.current = webamp;

        // Move the rendered webamp element into our container
        const webampEl = document.getElementById("webamp");
        if (webampEl && containerRef.current) {
          // Override default absolute positioning to fit in sidebar
          webampEl.style.position = "relative";
          webampEl.style.top = "0";
          webampEl.style.left = "0";
          webampEl.style.right = "auto";
          webampEl.style.bottom = "auto";
          containerRef.current.appendChild(webampEl);
        }
      }
    };

    initWebamp();

    return () => {
      if (webampRef.current) {
        (webampRef.current as { dispose: () => void }).dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        transform: "scale(0.72)",
        transformOrigin: "top left",
        width: "138%",
        minHeight: "116px",
      }}
    />
  );
}
