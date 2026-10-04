import { useEffect, useRef } from "react";

export default function KineticText({
  text,
  scroll = false,
}: {
  text: string;
  scroll?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
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
        const words = node.querySelectorAll(".kinetic-word");
        if (scroll)
          gsap.from(words, {
            color: "#6f3a56",
            y: 14,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: {
              trigger: node,
              start: "top 85%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          });
        else
          gsap.from(words, {
            yPercent: 112,
            rotation: 4,
            stagger: 0.045,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: node, start: "top 92%", once: true },
          });
      });
      dispose = () => media.revert();
    })();
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [text, scroll]);
  return (
    <span className="kinetic-text" ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, i) => (
          <span className="kinetic-mask" key={`${word}-${i}`}>
            <span className="kinetic-word">{word}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
