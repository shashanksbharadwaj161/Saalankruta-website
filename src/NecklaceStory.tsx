import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { asset } from "./assets";
import NecklaceFilm from "./NecklaceFilm";
import "./cinematic-hero.css";

type ConnectionPreference = EventTarget & {
  saveData?: boolean;
  effectiveType?: string;
};

/** Brand cinema plays in normal document flow; scrolling never seeks or pins it. */
export default function NecklaceStory({
  paused,
  onPauseChange,
}: {
  paused: boolean;
  onPauseChange: (paused: boolean) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canAnimate, setCanAnimate] = useState(false);
  const [inView, setInView] = useState(false);
  const [mountFilm, setMountFilm] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: ConnectionPreference }
    ).connection;
    let visible = false;
    const update = () => {
      const allowed =
        !motion.matches &&
        !connection?.saveData &&
        !["slow-2g", "2g"].includes(connection?.effectiveType || "");
      const active = visible && !document.hidden;
      setCanAnimate(allowed);
      setInView(active);
      // Load once, then pause in place as the visitor moves through the store.
      if (allowed && active) setMountFilm(true);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    motion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!canAnimate || paused) return;
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(min-width: 1024px)", () => {
          const context = gsap.context(() => {
            // Small opposing movements make the composition open up on scroll.
            // There is deliberately no pin, artificial track, or video seeking.
            gsap.to(".cinematic-visual", {
              y: -24,
              ease: "none",
              scrollTrigger: {
                trigger: node,
                start: "top top+=80",
                end: "bottom top+=80",
                scrub: 0.8,
              },
            });
            gsap.to(".cinematic-copy", {
              y: -42,
              ease: "none",
              scrollTrigger: {
                trigger: node,
                start: "top top+=80",
                end: "bottom top+=80",
                scrub: 0.8,
              },
            });
          }, node);
          return () => context.revert();
        });
        cleanup = () => media.revert();
      })
      // The composition and native film remain usable if animation cannot load.
      .catch(() => undefined);
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [canAnimate, paused]);

  const togglePlayback = () => {
    if (playing) {
      videoRef.current?.pause();
      onPauseChange(true);
    } else {
      onPauseChange(false);
      // A direct gesture also recovers browsers that rejected muted autoplay.
      void videoRef.current?.play().catch(() => setPlaying(false));
    }
  };

  return (
    <section
      ref={ref}
      className="cinematic-hero"
      aria-labelledby="cinematic-title"
      data-motion-paused={paused}
    >
      <div className="cinematic-inner">
        <div className="cinematic-layout">
          <div className="cinematic-copy">
            <p className="cinematic-eyebrow">The Saalankruta boutique</p>
            <h1 id="cinematic-title" className="cinematic-title">
              <span className="cinematic-line">
                <span>A little</span>
              </span>
              <span className="cinematic-line">
                <em>more drama.</em>
              </span>
            </h1>
            <p className="cinematic-description">
              Jewellery for the everyday, the unforgettable, and everything in
              between.
            </p>
            <div className="cinematic-actions">
              <Link className="cinematic-shop" to="/shop/">
                Explore the collection
                <span aria-hidden="true">
                  <ArrowUpRight size={20} strokeWidth={1.5} />
                </span>
              </Link>
            </div>
          </div>

          <figure className="cinematic-visual">
            <div className="cinematic-frame">
              <div className="cinematic-media" aria-hidden="true">
                <img
                  className="cinematic-poster"
                  src={asset("/media/necklace-poster.jpg")}
                  alt=""
                  width={1280}
                  height={720}
                  loading="eager"
                  fetchPriority="high"
                />
                {mountFilm && (
                  <NecklaceFilm
                    videoRef={videoRef}
                    active={canAnimate && inView}
                    paused={paused}
                    ready={() => setReady(true)}
                    failed={() => setReady(false)}
                    onPlaybackChange={setPlaying}
                    visible={ready}
                  />
                )}
              </div>
              {canAnimate && mountFilm && (
                <button
                  type="button"
                  className="cinematic-playback"
                  onClick={togglePlayback}
                  aria-label={playing ? "Pause motion" : "Play motion"}
                  aria-pressed={!playing}
                >
                  {playing ? (
                    <Pause size={15} strokeWidth={1.7} />
                  ) : (
                    <Play size={15} strokeWidth={1.7} />
                  )}
                  <span>{playing ? "Pause" : "Play"}</span>
                </button>
              )}
            </div>
            <figcaption className="cinematic-caption">
              <span>Brand film · imagined jewellery</span>
              <Link to="/product-category/necklace/">
                Shop necklaces <ArrowUpRight size={16} strokeWidth={1.5} />
              </Link>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
