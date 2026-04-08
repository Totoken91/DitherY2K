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

      // Center the main window on screen
      const mainW = 275;
      const mainH = 116;
      const left = Math.round((window.innerWidth - mainW) / 2);
      const top = Math.round((window.innerHeight - mainH) / 2 - 50);

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
        windowLayout: {
          main: { position: { top, left } },
          equalizer: { position: { top: top + mainH, left } },
          playlist: { position: { top: top + mainH + 116, left } },
        },
      });

      await webamp.renderWhenReady(containerRef.current!);
      webampRef.current = webamp;
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
          className="btn-retro"
          onClick={() => setVisible(true)}
          style={{ position: "fixed", bottom: "10px", left: "10px", zIndex: 999, fontSize: "12px", padding: "4px 10px" }}
        >
          {"🎵 Party Mode"}
        </button>
      )}
      {visible && <div ref={containerRef} id="webamp-container" />}
    </>
  );
}
