import { lazy, Suspense, useEffect, useRef, useState } from "react";
const LiquidLogo = lazy(() => import("./effects/LiquidLogo"));
export default function BrandSignature() {
  const ref = useRef<HTMLDivElement>(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) =>
      setVisible(entries[0].isIntersecting),
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="brand-signature">
      <img src="/logo.png" width="230" height="85" alt="Saalankruta" />
      {visible && (
        <Suspense fallback={null}>
          <LiquidLogo />
        </Suspense>
      )}
    </div>
  );
}
