"use client";

import { useEffect, useRef, useState } from "react";

function broadcastPlaying(playing: boolean) {
  window.dispatchEvent(new CustomEvent("webamp-playing", { detail: playing }));
}

export default function WebampPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webampRef = useRef<unknown>(null);
  const initedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);
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
            metaData: { artist: "Claas Herrmann", title: "Raskolnikow (Original Mix)" },
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

      // Center all webamp windows on screen after render
      setTimeout(() => {
        const webampEl = document.getElementById("webamp");
        if (!webampEl) return;
        const windows = webampEl.querySelectorAll<HTMLElement>('[style*="position"]');
        let totalH = 0;
        const dims: { el: HTMLElement; h: number }[] = [];
        windows.forEach((w) => {
          if (w.offsetWidth > 100) {
            dims.push({ el: w, h: w.offsetHeight });
            totalH += w.offsetHeight;
          }
        });
        const startTop = Math.max(20, Math.round((window.innerHeight - totalH) / 2));
        const left = Math.max(20, Math.round((window.innerWidth - 275) / 2));
        let currentTop = startTop;
        dims.forEach(({ el, h }) => {
          el.style.top = currentTop + "px";
          el.style.left = left + "px";
          currentTop += h;
        });
      }, 300);
      webamp.play();
      broadcastPlaying(true);

      pollRef.current = setInterval(() => {
        broadcastPlaying(webamp.getMediaStatus() === "PLAYING");
      }, 300);

      webamp.onClose(() => {
        broadcastPlaying(false);
        if (pollRef.current) clearInterval(pollRef.current);
        setVisible(false);
        initedRef.current = false;
      });
    };

    initWebamp();

    return () => {
      broadcastPlaying(false);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [visible]);

  return (
    <>
      {!visible && (
        <button
          className="btn-retro btn-party-mode"
          onClick={() => setVisible(true)}
          style={{ position: "fixed", bottom: "10px", left: "10px", zIndex: 999, fontSize: "13px", padding: "6px 14px", fontWeight: "bold" }}
        >
          {"🎵 Party Mode"}
        </button>
      )}
      {visible && <div ref={containerRef} id="webamp-container" />}
    </>
  );
}
