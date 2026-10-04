import { useEffect, useRef, useState } from "react";
export default function BrandSignature() {
  const ref = useRef<HTMLDivElement>(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`brand-signature brand-signature-seal${visible ? " is-revealed" : ""}`}
    >
      <img
        src="/brand-emblem-transparent.png"
        width="2000"
        height="2000"
        alt="Saalankruta crest. Every Woman's Dream."
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
