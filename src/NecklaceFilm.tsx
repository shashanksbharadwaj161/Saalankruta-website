import { useEffect, useRef, type RefObject } from "react";
import { asset } from "./assets";

/** Native decoding keeps the film smooth and independent of scroll velocity. */
export default function NecklaceFilm({
  videoRef,
  active,
  paused,
  visible,
  ready,
  failed,
  onPlaybackChange,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
  paused: boolean;
  visible: boolean;
  ready: () => void;
  failed: () => void;
  onPlaybackChange: (playing: boolean) => void;
}) {
  const callbacks = useRef({ ready, failed, onPlaybackChange });
  callbacks.current = { ready, failed, onPlaybackChange };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const loaded = () => callbacks.current.ready();
    const playing = () => {
      callbacks.current.ready();
      callbacks.current.onPlaybackChange(true);
    };
    const stopped = () => callbacks.current.onPlaybackChange(false);
    const error = () => {
      callbacks.current.failed();
      stopped();
    };
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("playing", playing);
    video.addEventListener("pause", stopped);
    video.addEventListener("error", error);
    if (video.readyState >= 2) loaded();
    return () => {
      video.pause();
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("playing", playing);
      video.removeEventListener("pause", stopped);
      video.removeEventListener("error", error);
    };
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    if (active && !paused) {
      void video.play().catch(() => {
        if (!cancelled) callbacks.current.onPlaybackChange(false);
      });
    } else {
      video.pause();
    }
    return () => {
      cancelled = true;
      video.pause();
    };
  }, [active, paused, videoRef]);

  return (
    <video
      ref={videoRef}
      className="cinematic-film"
      data-ready={visible}
      muted
      playsInline
      loop
      preload="auto"
      poster={asset("/media/necklace-poster.jpg")}
      tabIndex={-1}
      aria-hidden="true"
    >
      <source src={asset("/media/necklace-film.mp4")} type="video/mp4" />
    </video>
  );
}
