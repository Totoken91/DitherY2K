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
            metaData: { artist: "DJ Mike Llama", title: "Llama Whippin' Intro" },
            url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
            duration: 5.322286,
          },
        ],
        initialSkin: {
          url: "https://archive.org/cors/winampskin_Purple_Glow/Purple_Glow.wsz",
        },
        zIndex: 100,
      });

      // Render into a temporary off-screen div first
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      document.body.appendChild(tempDiv);

      await webamp.renderWhenReady(tempDiv);
      webampRef.current = webamp;

      // Now grab the #webamp element that was appended to body and move it into our container
      const moveWebamp = () => {
        const webampEl = document.getElementById("webamp");
        if (webampEl && containerRef.current) {
          // Reset all positioning so it flows inside the container
          webampEl.style.position = "relative";
          webampEl.style.top = "0";
          webampEl.style.left = "0";
          webampEl.style.right = "auto";
          webampEl.style.bottom = "auto";
          webampEl.style.width = "100%";

          // Also fix the inner draggable windows
          const windows = webampEl.querySelectorAll<HTMLElement>('[class*="window"]');
          windows.forEach((w) => {
            w.style.position = "relative";
            w.style.top = "0";
            w.style.left = "0";
          });

          containerRef.current.appendChild(webampEl);
          // Clean up temp div
          tempDiv.remove();
        }
      };

      // Small delay to ensure webamp has fully rendered
      setTimeout(moveWebamp, 500);
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
        width: "139%", // compensate for scale(0.72) so it fills the sidebar
        minHeight: "232px",
      }}
    />
  );
}
