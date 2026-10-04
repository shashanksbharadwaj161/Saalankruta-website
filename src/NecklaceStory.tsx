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
export default function NecklaceStory() {
  const ref = useRef<HTMLElement>(null),
    progress = useRef(0),
    invalidate = useRef<(() => void) | null>(null),
    [enabled, setEnabled] = useState(false),
    [ready, setReady] = useState(false),
    [paused, setPaused] = useState(false),
    [flowing, setFlowing] = useState(false),
    [chapter, setChapter] = useState(0);
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
    const stage = ref.current?.querySelector<HTMLElement>(".necklace-stage");
    if (!stage) return;
    let disposed = false;
    let measuredWidth = 0,
      measuredHeight = 0,
      needsFlow = false;
    const measure = () => {
      if (disposed) return;
      if (measuredWidth !== innerWidth || measuredHeight !== innerHeight) {
        measuredWidth = innerWidth;
        measuredHeight = innerHeight;
        needsFlow = false;
      }
      const top =
        parseFloat(getComputedStyle(stage).getPropertyValue("--story-top")) ||
        105;
      // Keep the safe layout through chapter changes; reconsider it on resize.
      needsFlow ||=
        stage.getBoundingClientRect().height > innerHeight - top + 2;
      setFlowing(needsFlow);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    window.addEventListener("resize", measure);
    document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false,
      dispose: (() => void) | undefined;
    if (flowing) {
      setChapter(0);
      return;
    }
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add(
        "(prefers-reduced-motion: no-preference) and (min-height: 741px)",
        () => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: node,
              start: "top 110px",
              end: "bottom bottom",
              scrub: 0.65,
              invalidateOnRefresh: true,
              onUpdate: (self) =>
                setChapter(Math.min(2, Math.floor(self.progress * 3))),
            },
          });
          timeline.to(
            progress,
            {
              current: 1,
              duration: 1,
              ease: "none",
              onUpdate: () => invalidate.current?.(),
            },
            0,
          );
        },
      );
      dispose = () => media.revert();
    })();
    return () => {
      cancelled = true;
      dispose?.();
      invalidate.current = null;
    };
  }, [flowing]);
  const chapters = [
    {
      title: (
        <>
          Jewellery,
          <br />
          <em>in a different light.</em>
        </>
      ),
      copy: "Jewellery has a way of turning a moment into a memory.",
    },
    {
      title: (
        <>
          Let the details
          <br />
          <em>draw you closer.</em>
        </>
      ),
      copy: "Explore necklaces, pendants and pieces that feel personal.",
    },
    {
      title: (
        <>
          Your story.
          <br />
          <em>Your Saalankruta.</em>
        </>
      ),
      copy: "Find a piece for the everyday, or something for a day you will always remember.",
    },
  ];
  return (
    <section
      className={`necklace-story ${flowing ? "is-flowing" : ""}`}
      ref={ref}
      aria-labelledby="necklace-story-title"
    >
      <div className="necklace-stage">
        <div className="necklace-art" aria-hidden="true">
          {
            <img
              className={`necklace-fallback ${enabled && ready ? "scene-ready" : ""}`}
              src="/media/necklace-poster.jpg"
              alt=""
              loading="lazy"
            />
          }
          {enabled && (
            <SafeScene failed={() => setReady(false)}>
              <Suspense fallback={null}>
                <Scene
                  progress={progress}
                  invalidate={invalidate}
                  ready={() => setReady(true)}
                  failed={() => setReady(false)}
                  paused={paused}
                  flowing={flowing}
                />
              </Suspense>
            </SafeScene>
          )}
          <span className="necklace-art-note">
            A Saalankruta brand film · imagined jewellery
          </span>
        </div>
        <div className="necklace-copy">
          <span className="eyebrow">THE NECKLACE STORY</span>
          <h2 id="necklace-story-title" key={chapter}>
            {chapters[chapter].title}
          </h2>
          <p>{chapters[chapter].copy}</p>
          <Link className="primary" to="/product-category/necklace/">
            Discover necklaces <ArrowUpRight size={18} />
          </Link>
          <div className="necklace-chapters" aria-hidden="true">
            {chapters.map((_, i) => (
              <span className={chapter === i ? "active" : ""} key={i}>
                0{i + 1}
              </span>
            ))}
            <ArrowDown size={16} />
            <span>Scroll to explore</span>
          </div>
          <a className="text-link" href="#necklace-collection">
            Go to the collection
          </a>
          <button
            className="film-toggle"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            {paused ? "Enable film motion" : "Pause film motion"}
          </button>
        </div>
      </div>
    </section>
  );
}
