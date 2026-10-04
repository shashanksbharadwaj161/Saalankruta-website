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

/** Stable editorial copy and a short cinema-only pin keep the whole film visible. */
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
    let cancelled = false,
      dispose: (() => void) | undefined;
    const initialHash = location.hash;
    const initialScroll = scrollY;
    let interacted = false;
    const markInteraction = () => {
      interacted = true;
    };
    window.addEventListener("wheel", markInteraction, { passive: true });
    window.addEventListener("touchstart", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const cinema = node.querySelector<HTMLElement>(".necklace-cinema");
      if (!cinema) return;
      const header = document.querySelector<HTMLElement>(".boutique-header");
      const caption = cinema.querySelector<HTMLElement>(
        ".necklace-cinema-footer",
      );
      const controls = cinema.querySelector<HTMLElement>(
        ".necklace-film-actions",
      );
      const measure = () => {
        const height = Math.ceil(header?.getBoundingClientRect().height || 80);
        const chrome = Math.ceil(
          (caption?.getBoundingClientRect().height || 0) +
            (controls?.getBoundingClientRect().height || 0),
        );
        node.style.setProperty("--cinema-header-offset", height + "px");
        node.style.setProperty("--cinema-chrome-height", chrome + "px");
        return height;
      };
      measure();
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const sync = (value: number) => {
          // The final 16% of the short pin holds the last frame while decoding settles.
          progress.current = Math.min(1, Math.max(0, value / 0.84));
          invalidate.current?.();
        };
        ScrollTrigger.create({
          id: "saalankruta-necklace-film",
          trigger: cinema,
          pin: cinema,
          pinSpacing: true,
          start: () => "top " + (measure() + 8) + "px",
          end: () => "+=" + Math.round(innerHeight * 0.9),
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => sync(self.progress),
          onRefresh: (self) => sync(self.progress),
        });
        return () => {
          progress.current = 0;
        };
      });
      let frame = 0;
      const refresh = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (cancelled) return;
          measure();
          ScrollTrigger.refresh();
        });
      };
      const observer = new ResizeObserver(refresh);
      if (header) observer.observe(header);
      if (caption) observer.observe(caption);
      if (controls) observer.observe(controls);
      window.addEventListener("resize", refresh);
      document.fonts.ready.then(refresh);
      // Deep links loaded before React mounts must account for the new pin spacer.
      const alignInitialHash = () => {
        if (
          cancelled ||
          interacted ||
          !initialHash ||
          location.hash !== initialHash
        )
          return;
        if (Math.abs(scrollY - initialScroll) > 2) return;
        let id: string;
        try {
          id = decodeURIComponent(initialHash.slice(1));
        } catch {
          return;
        }
        ScrollTrigger.refresh();
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "instant", block: "start" });
      };
      document.fonts.ready.then(() => requestAnimationFrame(alignInitialHash));
      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("resize", refresh);
        media.revert();
        node.style.removeProperty("--cinema-header-offset");
        node.style.removeProperty("--cinema-chrome-height");
      };
    })();
    return () => {
      cancelled = true;
      dispose?.();
      window.removeEventListener("wheel", markInteraction);
      window.removeEventListener("touchstart", markInteraction);
      window.removeEventListener("keydown", markInteraction);
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
              <p className="necklace-scroll-cue">Scroll to move the necklace</p>
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
    </section>
  );
}
