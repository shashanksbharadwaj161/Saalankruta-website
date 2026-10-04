import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import RoyalAtmosphere from "./RoyalAtmosphere";

const Scene = lazy(() => import("./NecklaceFilm"));
const headline = ["Jewellery", "in", "motion."];

class SafeScene extends Component<
  { children: ReactNode; failed: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.failed();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** One editorial introduction and an intact horizontal brand film, in normal flow. */
export default function NecklaceStory({
  paused,
  onPauseChange,
}: {
  paused: boolean;
  onPauseChange: (paused: boolean) => void;
}) {
  const ref = useRef<HTMLElement>(null),
    progress = useRef(0),
    invalidate = useRef<(() => void) | null>(null),
    [enabled, setEnabled] = useState(false),
    [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () =>
      setEnabled(visible && !document.hidden && !motion.matches);
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        update();
      },
      { rootMargin: "250px" },
    );
    observer.observe(node);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false,
      dispose: (() => void) | undefined;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(progress, {
          current: 1,
          ease: "none",
          onUpdate: () => invalidate.current?.(),
          scrollTrigger: {
            trigger: node,
            start: "top top",
            end: "bottom 35%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });
        return () => {
          progress.current = 0;
        };
      });
      dispose = () => media.revert();
    })();
    return () => {
      cancelled = true;
      dispose?.();
      invalidate.current = null;
    };
  }, []);

  return (
    <section
      className="necklace-story"
      ref={ref}
      aria-labelledby="necklace-story-title"
    >
      <div className="necklace-stage">
        <RoyalAtmosphere paused={paused} />
        <div className="necklace-heading">
          <p className="necklace-edition">THE SAALANKRUTA BOUTIQUE</p>
          <div className="necklace-title-row">
            <h1 id="necklace-story-title" aria-label="Jewellery in motion.">
              {headline.map((word, index) => (
                <span
                  className="necklace-word-mask"
                  aria-hidden="true"
                  key={word}
                >
                  <span style={{ animationDelay: index * 55 + "ms" }}>
                    {word}
                  </span>
                </span>
              ))}
            </h1>
            <Link
              className="necklace-discover"
              to="/product-category/necklace/"
            >
              Discover necklaces <ArrowUpRight size={19} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="necklace-cinema">
          <div className="necklace-art" aria-hidden="true">
            <img
              className={
                "necklace-fallback " + (enabled && ready ? "scene-ready" : "")
              }
              src="/media/necklace-poster.jpg"
              alt=""
              loading="eager"
              fetchPriority="high"
            />
            {enabled && (
              <SafeScene failed={() => setReady(false)}>
                <Suspense fallback={null}>
                  <Scene
                    progress={progress}
                    invalidate={invalidate}
                    ready={() => setReady(true)}
                    failed={() => setReady(false)}
                    paused={paused}
                    flowing
                  />
                </Suspense>
              </SafeScene>
            )}
          </div>
        </div>

        <div className="necklace-cinema-footer">
          <div className="necklace-caption">
            <p>
              Find a piece for your everyday. Or a day you will always remember.
            </p>
            <span className="necklace-art-note">
              Brand film · imagined jewellery
            </span>
          </div>
          <div className="necklace-film-actions">
            <button
              className="film-toggle"
              onClick={() => onPauseChange(!paused)}
              aria-pressed={paused}
              aria-label={paused ? "Resume motion" : "Pause motion"}
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
              {paused ? "Resume motion" : "Pause motion"}
            </button>
            <a href="#necklace-collection" className="necklace-skip">
              Go to the collection <ArrowDown size={14} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
