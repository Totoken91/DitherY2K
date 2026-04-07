"use client";

import { useEffect, useRef, useState } from "react";

// Broadcast playing state via custom events so other components can react
function broadcastPlaying(isPlaying: boolean) {
  window.dispatchEvent(new CustomEvent("webamp-playing", { detail: isPlaying }));
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

      webamp.play();
      broadcastPlaying(true);

      // Poll playing state (webamp doesn't have a reliable event for pause/stop)
      pollRef.current = setInterval(() => {
        const status = webamp.getMediaStatus();
        broadcastPlaying(status === "PLAYING");
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
      {visible && <div ref={containerRef} id="webamp-container" />}
    </>
  );
}
