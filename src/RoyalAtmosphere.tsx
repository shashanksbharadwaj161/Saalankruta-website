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

export type AtmosphereInput = {
  x: number;
  y: number;
  energy: number;
  updatedAt: number;
};

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
export default function RoyalAtmosphere({
  paused = false,
}: {
  paused?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null),
    input = useRef<AtmosphereInput>({ x: 0, y: 0, energy: 0, updatedAt: 0 }),
    pausedRef = useRef(paused),
    [enabled, setEnabled] = useState(false);
  pausedRef.current = paused;
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
  useEffect(() => {
    const surface = ref.current?.parentElement;
    if (!enabled || !surface) return;
    const reset = () => {
      input.current.x = 0;
      input.current.y = 0;
      input.current.energy = 0;
      input.current.updatedAt = 0;
    };
    const update = (clientX: number, clientY: number, impulse = 0) => {
      if (pausedRef.current) return;
      const bounds = surface.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const x = Math.max(
        -1,
        Math.min(1, ((clientX - bounds.left) / bounds.width) * 2 - 1),
      );
      const y = Math.max(
        -1,
        Math.min(1, ((clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      const now = performance.now();
      const previous = input.current;
      const elapsed = Math.max(16, now - previous.updatedAt) / 1000;
      const speed = Math.min(
        1.2,
        (Math.hypot(x - previous.x, y - previous.y) / elapsed) * 0.12,
      );
      previous.energy = Math.max(previous.energy, speed, impulse);
      previous.x = x;
      previous.y = y;
      previous.updatedAt = now;
    };
    const pointer = (event: PointerEvent) => {
      // Touch events continue during native page scrolling; pointer events may cancel.
      if (event.pointerType !== "touch")
        update(
          event.clientX,
          event.clientY,
          event.type === "pointerdown" ? 0.7 : 0,
        );
    };
    const touch = (event: TouchEvent) => {
      const point = event.touches[0];
      if (point)
        update(
          point.clientX,
          point.clientY,
          event.type === "touchstart" ? 0.9 : 0,
        );
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== "touch") reset();
    };
    const passive = { passive: true } as const;
    surface.addEventListener("pointerenter", pointer, passive);
    surface.addEventListener("pointermove", pointer, passive);
    surface.addEventListener("pointerdown", pointer, passive);
    surface.addEventListener("pointerleave", leave, passive);
    surface.addEventListener("pointerup", reset, passive);
    surface.addEventListener("touchstart", touch, passive);
    surface.addEventListener("touchmove", touch, passive);
    surface.addEventListener("touchend", reset, passive);
    surface.addEventListener("touchcancel", reset, passive);
    return () => {
      reset();
      surface.removeEventListener("pointerenter", pointer);
      surface.removeEventListener("pointermove", pointer);
      surface.removeEventListener("pointerdown", pointer);
      surface.removeEventListener("pointerleave", leave);
      surface.removeEventListener("pointerup", reset);
      surface.removeEventListener("touchstart", touch);
      surface.removeEventListener("touchmove", touch);
      surface.removeEventListener("touchend", reset);
      surface.removeEventListener("touchcancel", reset);
    };
  }, [enabled]);
  return (
    <div className="royal-atmosphere" ref={ref} aria-hidden="true">
      {enabled && (
        <SafeEffect>
          <Suspense fallback={null}>
            <Gradient input={input} paused={paused} />
          </Suspense>
        </SafeEffect>
      )}
    </div>
  );
}
