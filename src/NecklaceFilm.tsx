import { useEffect, useRef, type RefObject } from "react";

/** The film is decorative brand art. Product photographs remain authoritative. */
export default function NecklaceFilm({
  progress,
  invalidate,
  ready,
  failed,
  paused,
  flowing,
}: {
  progress: RefObject<number>;
  invalidate: RefObject<(() => void) | null>;
  ready: () => void;
  failed: () => void;
  paused: boolean;
  flowing: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const callbacks = useRef({ ready, failed });
  callbacks.current = { ready, failed };
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let disposed = false;
    const seek = () => {
      if (
        disposed ||
        paused ||
        !Number.isFinite(video.duration) ||
        video.seeking
      )
        return;
      const target = Math.min(
        video.duration - 0.05,
        Math.max(0, progress.current * video.duration),
      );
      if (Math.abs(video.currentTime - target) > 0.045)
        video.currentTime = target;
    };
    const mode = () => {
      video.pause();
      if (!paused) seek();
    };
    const loaded = () => {
      callbacks.current.ready();
      mode();
    };
    const error = () => callbacks.current.failed();
    invalidate.current = seek;
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("seeked", seek);
    video.addEventListener("error", error);
    if (video.readyState >= 2) loaded();
    else mode();
    return () => {
      disposed = true;
      invalidate.current = null;
      video.pause();
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("seeked", seek);
      video.removeEventListener("error", error);
    };
  }, [invalidate, progress, paused, flowing]);
  return (
    <video
      ref={ref}
      className="necklace-film"
      muted
      playsInline
      preload="auto"
      poster="/media/necklace-poster.jpg"
      tabIndex={-1}
      aria-hidden="true"
    >
      <source src="/media/necklace-film.mp4" type="video/mp4" />
    </video>
  );
}
