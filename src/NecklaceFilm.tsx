import { useEffect, useRef, type RefObject } from "react";

/** Scroll-driven brand art, with a single coalesced seek targeting the latest progress. */
export default function NecklaceFilm({
  progress,
  invalidate,
  ready,
  failed,
  paused,
  frozenTime,
}: {
  progress: RefObject<number>;
  invalidate: RefObject<(() => void) | null>;
  ready: () => void;
  failed: () => void;
  paused: boolean;
  frozenTime?: RefObject<number>;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const pausedRef = useRef(paused);
  const previousPaused = useRef(paused);
  const callbacks = useRef({ ready, failed });
  pausedRef.current = paused;
  callbacks.current = { ready, failed };
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let disposed = false,
      frame = 0,
      revealed = false;
    const reveal = () => {
      if (!revealed && video.readyState >= 2) {
        revealed = true;
        callbacks.current.ready();
      }
    };
    const seekFrame = () => {
      frame = 0;
      if (disposed) return;
      if (video.error) return;
      if (
        !Number.isFinite(video.duration) ||
        video.duration <= 0 ||
        video.seeking
      )
        return;
      const target = Math.min(
        video.duration - 0.025,
        Math.max(
          0,
          pausedRef.current
            ? (frozenTime?.current ?? video.currentTime)
            : progress.current * video.duration,
        ),
      );
      if (Math.abs(video.currentTime - target) > 0.03) {
        try {
          video.currentTime = target;
        } catch {
          callbacks.current.failed();
        }
      } else {
        reveal();
      }
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(seekFrame);
    };
    const loaded = () => {
      video.pause();
      schedule();
    };
    const seeked = () => {
      if (frozenTime) frozenTime.current = video.currentTime;
      reveal();
      schedule();
    };
    const error = () => callbacks.current.failed();
    invalidate.current = schedule;
    video.addEventListener("loadedmetadata", loaded);
    video.addEventListener("loadeddata", loaded);
    video.addEventListener("seeked", seeked);
    video.addEventListener("error", error);
    if (video.readyState >= 1) loaded();
    return () => {
      disposed = true;
      if (
        frozenTime &&
        !pausedRef.current &&
        video.readyState >= 1 &&
        Number.isFinite(video.currentTime)
      )
        frozenTime.current = video.currentTime;
      cancelAnimationFrame(frame);
      invalidate.current = null;
      video.pause();
      video.removeEventListener("loadedmetadata", loaded);
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("seeked", seeked);
      video.removeEventListener("error", error);
    };
  }, [invalidate, progress, frozenTime]);
  useEffect(() => {
    const video = ref.current;
    video?.pause();
    if (
      paused &&
      !previousPaused.current &&
      frozenTime &&
      video &&
      video.readyState >= 1
    )
      frozenTime.current = video.currentTime;
    previousPaused.current = paused;
    invalidate.current?.();
  }, [paused, invalidate, frozenTime]);
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
