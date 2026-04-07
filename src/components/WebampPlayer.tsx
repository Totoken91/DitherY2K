"use client";

import { useEffect, useRef } from "react";

export default function WebampPlayer() {
  const initedRef = useRef(false);
  const webampRef = useRef<unknown>(null);

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
        zIndex: 1000,
      });

      await webamp.renderWhenReady(document.body);
      webampRef.current = webamp;

      // Fix: Webamp's container takes up the full page by default.
      // Force it to be a fixed overlay that doesn't interfere with layout.
      const webampEl = document.getElementById("webamp");
      if (webampEl) {
        webampEl.style.position = "fixed";
        webampEl.style.top = "0";
        webampEl.style.left = "0";
        webampEl.style.width = "0";
        webampEl.style.height = "0";
        webampEl.style.overflow = "visible";
        webampEl.style.pointerEvents = "none";
        // Re-enable pointer events on the actual windows inside
        const children = webampEl.querySelectorAll<HTMLElement>(":scope > div");
        children.forEach((child) => {
          child.style.pointerEvents = "auto";
        });
      }
    };

    initWebamp();

    return () => {
      if (webampRef.current) {
        (webampRef.current as { dispose: () => void }).dispose();
      }
    };
  }, []);

  return null;
}
