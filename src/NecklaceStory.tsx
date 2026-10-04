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

/** A wide film rests briefly on a native sticky track while the visitor scrolls. */
export default function NecklaceStory({
  paused,
  onPauseChange,
}: {
  paused: boolean;
  onPauseChange: (paused: boolean) => void;
}) {
  const ref = useRef<HTMLElement>(null),
    progress = useRef(0),
    retainedTime = useRef(0),
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
    const track = node.querySelector<HTMLElement>(".necklace-track");
    const cinema = node.querySelector<HTMLElement>(".necklace-cinema");
    const art = node.querySelector<HTMLElement>(".necklace-art");
    if (!track || !cinema || !art) return;
    const header = document.querySelector<HTMLElement>(".boutique-header");
    const caption = cinema.querySelector<HTMLElement>(
      ".necklace-cinema-footer",
    );
    const controls = cinema.querySelector<HTMLElement>(
      ".necklace-film-actions",
    );
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false,
      frame = 0,
      measureFrame = 0,
      top = 88,
      distance = 0,
      sticky = true;
    const sync = () => {
      frame = 0;
      if (disposed || motion.matches) return;
      const rect = track.getBoundingClientRect();
      // No scroll interception, fixed positioning, or pin-spacer refreshes.
      // The last 10% lets the final decoded frame settle before the track releases.
      const travel = sticky
        ? distance * 0.9
        : Math.max(160, rect.height - top - innerHeight * 0.18);
      const next = Math.min(1, Math.max(0, (top - rect.top) / travel));
      if (Math.abs(progress.current - next) < 0.0001) return;
      progress.current = next;
      invalidate.current?.();
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(sync);
    };
    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      const height = Math.ceil(header?.getBoundingClientRect().height || 80);
      const chrome = Math.ceil(
        (caption?.getBoundingClientRect().height || 0) +
          (controls?.getBoundingClientRect().height || 0),
      );
      node.style.setProperty("--cinema-header-offset", height + "px");
      node.style.setProperty("--cinema-chrome-height", chrome + "px");
      top = height + 8;
      const width = art.getBoundingClientRect().width;
      const minimumMedia = innerWidth < 768 ? (width * 9) / 16 : width / 2.8;
      // Short or very wide viewports use ordinary flow rather than an excessive crop.
      sticky =
        !motion.matches && innerHeight - top - chrome - 8 >= minimumMedia;
      node.dataset.cinemaSticky = String(sticky);
      distance = Math.max(
        1,
        parseFloat(getComputedStyle(track, "::after").height),
      );
      schedule();
    };
    const scheduleMeasure = () => {
      if (!disposed && !measureFrame)
        measureFrame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    if (header) observer.observe(header);
    if (caption) observer.observe(caption);
    if (controls) observer.observe(controls);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("pageshow", scheduleMeasure);
    motion.addEventListener("change", scheduleMeasure);
    document.fonts.ready.then(scheduleMeasure);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("pageshow", scheduleMeasure);
      motion.removeEventListener("change", scheduleMeasure);
      node.style.removeProperty("--cinema-header-offset");
      node.style.removeProperty("--cinema-chrome-height");
    };
  }, []);

  return (
    <section
      className="necklace-story"
      data-cinema-sticky="true"
      ref={ref}
      aria-labelledby="necklace-story-title"
    >
      <div className="necklace-stage">
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

        <div className="necklace-track">
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
                      frozenTime={retainedTime}
                    />
                  </Suspense>
                </SafeScene>
              )}
            </div>
            <div className="necklace-cinema-footer">
              <div className="necklace-caption">
                <p>
                  Find a piece for your everyday. Or a day you will always
                  remember.
                </p>
                <span className="necklace-art-note">
                  Brand film · imagined jewellery
                </span>
                <p className="necklace-scroll-cue">
                  Scroll to move the necklace
                </p>
              </div>
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
      </div>
    </section>
  );
}
