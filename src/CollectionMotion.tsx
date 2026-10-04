import { useEffect } from "react";
import { useStore } from "./store";
export default function CollectionMotion() {
  const { products, categories } = useStore();
  const signature =
    products
      .map((p) => `${p.id}:${p.categories.map((c) => c.id).join(",")}`)
      .join("|") + categories.map((c) => `${c.id}:${c.name}`).join("|");
  useEffect(() => {
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
        const context = gsap.context(
          () => {
            gsap.utils
              .toArray<HTMLElement>(".collection-tile-image")
              .forEach((frame) => {
                gsap.fromTo(
                  frame,
                  { clipPath: "inset(12% 0% 12% 0%)" },
                  {
                    clipPath: "inset(0% 0% 0% 0%)",
                    duration: 1.15,
                    ease: "power3.out",
                    scrollTrigger: {
                      trigger: frame,
                      start: "top 90%",
                      once: true,
                    },
                  },
                );
              });
            gsap.utils
              .toArray<HTMLElement>(".collection-section.wrap")
              .forEach((section) => {
                gsap.from(section.querySelector(".section-heading"), {
                  y: 24,
                  opacity: 0.7,
                  duration: 0.65,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: section,
                    start: "top 92%",
                    once: true,
                    fastScrollEnd: true,
                  },
                });
                gsap.from(section.querySelectorAll(".product-photo"), {
                  y: 30,
                  opacity: 0.7,
                  stagger: 0.07,
                  duration: 0.8,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: section,
                    start: "top 88%",
                    once: true,
                    fastScrollEnd: true,
                  },
                });
              });
          },
          document.querySelector("main") || undefined,
        );
        return () => context.revert();
      });
      let frame = 0;
      const refresh = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      const observer = new ResizeObserver(refresh);
      const main = document.querySelector("main");
      if (main) observer.observe(main);
      document.fonts.ready.then(() => {
        if (!cancelled) refresh();
      });
      dispose = () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        media.revert();
      };
    })();
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [signature]);
  return null;
}
