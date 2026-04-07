"use client";

import { useEffect, useRef, useState } from "react";

// Broadcast audio state: { playing: boolean, bass: number (0-1) }
function broadcastAudio(playing: boolean, bass: number) {
  window.dispatchEvent(
    new CustomEvent("webamp-audio", { detail: { playing, bass } })
  );
}

export default function WebampPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webampRef = useRef<unknown>(null);
  const initedRef = useRef(false);
  const rafRef = useRef<number>(0);
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

      // Set up Web Audio API analyser to detect bass
      let analyser: AnalyserNode | null = null;
      let dataArray: Uint8Array<ArrayBuffer> | null = null;

      const setupAnalyser = () => {
        // Webamp creates an <audio> element — find it
        const audioEl = document.querySelector<HTMLAudioElement>(
          "#webamp audio, audio"
        );
        if (!audioEl) return;

        try {
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(audioEl);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
          dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
        } catch {
          // May fail if already connected — fall back to polling
        }
      };

      // Delay analyser setup to let audio element initialize
      setTimeout(setupAnalyser, 1000);

      // Animation loop: read bass level and broadcast
      const tick = () => {
        const status = webamp.getMediaStatus();
        const isPlaying = status === "PLAYING";

        let bass = 0;
        if (isPlaying && analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray);
          // Average the low frequencies (first 8 bins ≈ 0-350Hz)
          let sum = 0;
          for (let i = 0; i < 8; i++) {
            sum += dataArray[i];
          }
          bass = sum / (8 * 255); // normalize to 0-1
        }

        broadcastAudio(isPlaying, bass);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      webamp.onClose(() => {
        broadcastAudio(false, 0);
        cancelAnimationFrame(rafRef.current);
        setVisible(false);
        initedRef.current = false;
      });
    };

    initWebamp();

    return () => {
      broadcastAudio(false, 0);
      cancelAnimationFrame(rafRef.current);
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
