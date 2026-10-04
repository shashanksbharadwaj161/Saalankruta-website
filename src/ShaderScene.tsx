"use client";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
// Brand-specific rose silk and pale gold. A single low-density canvas;
// no camera controls, environment texture requests, or product distortion.
export default function ShaderScene() {
  return (
    <ShaderGradientCanvas
      pixelDensity={1}
      pointerEvents="none"
      powerPreference="low-power"
      style={{ position: "absolute", inset: 0 }}
    >
      <ShaderGradient
        control="props"
        type="plane"
        animate="on"
        color1="#f5dbe8"
        color2="#b76b95"
        color3="#ddc397"
        uSpeed={0.12}
        uStrength={1.8}
        uFrequency={3.5}
        uDensity={1.1}
        uAmplitude={1}
        cDistance={3.8}
        cPolarAngle={90}
        cAzimuthAngle={0}
        rotationX={0}
        rotationY={0}
        rotationZ={30}
        lightType="3d"
        brightness={1.1}
        grain="off"
        reflection={0}
      />
    </ShaderGradientCanvas>
  );
}
