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
export type AtmosphereDynamics = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  time: number;
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
  active = true,
  global: wholePage = false,
}: {
  paused?: boolean;
  active?: boolean;
  global?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null),
    input = useRef<AtmosphereInput>({ x: 0, y: 0, energy: 0, updatedAt: 0 }),
    dynamics = useRef<AtmosphereDynamics>({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      energy: 0,
      time: 0,
    }),
    pausedRef = useRef(paused),
    [enabled, setEnabled] = useState(false);
  pausedRef.current = paused;
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
      transparency = matchMedia("(prefers-reduced-transparency: reduce)");
    let visible = false;
    const update = () =>
      setEnabled(
        active &&
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
  }, [active]);
  useEffect(() => {
    const element = ref.current?.parentElement;
    const surface = wholePage ? window : element;
    if (!enabled || !surface) return;
    let frame = 0;
    let point: { x: number; y: number; impulse: number } | null = null;
    let touchId: number | null = null;
    const release = () => {
      if (!pausedRef.current && point) {
        input.current.energy = Math.max(input.current.energy, point.impulse);
      }
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      point = null;
      input.current.x = 0;
      input.current.y = 0;
      input.current.updatedAt = 0;
    };
    const flush = () => {
      frame = 0;
      if (!point || pausedRef.current) return;
      const { x: clientX, y: clientY, impulse } = point;
      point = null;
      const bounds = wholePage
        ? { left: 0, top: 0, width: innerWidth, height: innerHeight }
        : element!.getBoundingClientRect();
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
      const speed = previous.updatedAt
        ? Math.min(
            1.2,
            (Math.hypot(x - previous.x, y - previous.y) / elapsed) * 0.12,
          )
        : 0;
      previous.energy = Math.max(previous.energy, speed, impulse);
      previous.x = x;
      previous.y = y;
      previous.updatedAt = now;
    };
    const update = (x: number, y: number, impulse = 0) => {
      if (pausedRef.current) return;
      point = { x, y, impulse: Math.max(point?.impulse || 0, impulse) };
      if (!frame) frame = requestAnimationFrame(flush);
    };
    const pointer = (event: PointerEvent) => {
      // Touch events continue during native page scrolling; pointer events may cancel.
      if (event.pointerType !== "touch")
        update(
          event.clientX,
          event.clientY,
          event.type === "pointerdown" ? 0.55 : 0,
        );
    };
    const touch = (event: TouchEvent) => {
      if (touchId === null)
        touchId = event.changedTouches[0]?.identifier ?? null;
      const point = [...event.touches].find((t) => t.identifier === touchId);
      if (point)
        update(
          point.clientX,
          point.clientY,
          event.type === "touchstart" ? 0.7 : 0,
        );
    };
    const endTouch = (event: TouchEvent) => {
      if ([...event.changedTouches].some((t) => t.identifier === touchId)) {
        touchId = null;
        release();
      }
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== "touch") release();
    };
    const wheel = (event: WheelEvent) => {
      if (pausedRef.current) return;
      input.current.energy = Math.max(
        input.current.energy,
        Math.min(0.6, Math.abs(event.deltaY) / 350),
      );
    };
    const passive = { passive: true } as const;
    const events: [string, EventListener][] = [
      ["pointerenter", pointer as EventListener],
      ["pointermove", pointer as EventListener],
      ["pointerdown", pointer as EventListener],
      ["pointerleave", leave as EventListener],
      ["pointerup", leave as EventListener],
      ["pointercancel", leave as EventListener],
      ["touchstart", touch as EventListener],
      ["touchmove", touch as EventListener],
      ["touchend", endTouch as EventListener],
      ["touchcancel", endTouch as EventListener],
      ["wheel", wheel as EventListener],
    ];
    events.forEach(([name, handler]) =>
      surface.addEventListener(name, handler, passive),
    );
    return () => {
      release();
      events.forEach(([name, handler]) =>
        surface.removeEventListener(name, handler),
      );
    };
  }, [enabled, wholePage]);
  return (
    <div className="royal-atmosphere" ref={ref} aria-hidden="true">
      {enabled && (
        <SafeEffect>
          <Suspense fallback={null}>
            <Gradient input={input} dynamics={dynamics} paused={paused} />
          </Suspense>
        </SafeEffect>
      )}
    </div>
  );
}
