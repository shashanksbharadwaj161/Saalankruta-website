"use client";
import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
const Gradient = lazy(() => import("./ShaderScene"));
class SafeEffect extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
// An ornamental background, independent of product images or commerce controls.
// Load only in view, stop when hidden, and use CSS when motion is reduced.
export default function RoyalAtmosphere() {
  const ref = useRef<HTMLDivElement>(null),
    [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
      transparency = matchMedia("(prefers-reduced-transparency: reduce)");
    let visible = false;
    const update = () =>
      setEnabled(
        visible &&
          !document.hidden &&
          !reduced.matches &&
          !transparency.matches,
      );
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    if (ref.current) observer.observe(ref.current);
    reduced.addEventListener("change", update);
    transparency.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", update);
      transparency.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return (
    <div className="royal-atmosphere" ref={ref} aria-hidden="true">
      {enabled && (
        <SafeEffect>
          <Suspense fallback={null}>
            <Gradient />
          </Suspense>
        </SafeEffect>
      )}
    </div>
  );
}
