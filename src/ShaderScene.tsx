"use client";
import { memo, useEffect, useRef, type RefObject } from "react";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, type Material, type Mesh } from "three";
import type { AtmosphereInput } from "./RoyalAtmosphere";

// The installed ShaderGradient surface exposes these Three.js uniforms in userData.
// Keep the motion driver isolated: uniforms and refs change, React does not render per frame.
type GradientUniforms = Record<string, { value: number }>;

function SilkMotion({
  input,
  paused,
}: {
  input: RefObject<AtmosphereInput>;
  paused: boolean;
}) {
  const scene = useThree((state) => state.scene);
  const setFrameloop = useThree((state) => state.setFrameloop);
  const invalidate = useThree((state) => state.invalidate);
  const mesh = useRef<Mesh | null>(null);
  const state = useRef({ x: 0, y: 0, energy: 0, time: 0 });
  useEffect(() => {
    setFrameloop(paused ? "demand" : "always");
    invalidate();
    return () => setFrameloop("always");
  }, [paused, setFrameloop, invalidate]);

  useFrame((_, delta) => {
    if (paused) return;
    if (!mesh.current) {
      const surface = scene.getObjectByName("shadergradient-mesh");
      if (surface && "isMesh" in surface) mesh.current = surface as Mesh;
    }
    const surface = mesh.current;
    if (!surface) return;
    const material = (
      Array.isArray(surface.material) ? surface.material[0] : surface.material
    ) as Material;
    const uniforms = material.userData as GradientUniforms;
    if (!uniforms.uTime || !uniforms.uNoiseStrength) return;
    const dt = Math.min(delta, 0.05);
    const smooth = 1 - Math.exp(-dt * 3.2);
    const current = state.current;
    const target = input.current;
    current.x += (target.x - current.x) * smooth;
    current.y += (target.y - current.y) * smooth;
    current.energy +=
      (target.energy - current.energy) * (1 - Math.exp(-dt * 4.5));
    target.energy *= Math.exp(-dt * 3.5);
    current.time += dt * (0.45 + current.energy * 0.6);

    // Broad rose folds flow continuously; gestures add a soft, decaying swish.
    uniforms.uTime.value = current.time;
    uniforms.uNoiseStrength.value =
      2.2 + current.energy * 1.05 + current.y * 0.16;
    uniforms.uNoiseDensity.value = 0.85 + Math.abs(current.x) * 0.08;
    uniforms.uFrequency.value = 2.4 + current.energy * 0.55;
    uniforms.uAmplitude.value = 0.18 + current.energy * 0.17;
    surface.position.x = current.x * 0.45 + Math.sin(current.time * 0.3) * 0.08;
    surface.position.y = -current.y * 0.28;
    surface.rotation.x = current.y * 0.07;
    surface.rotation.y = -current.x * 0.07;
    surface.rotation.z =
      MathUtils.degToRad(24) + current.x * 0.09 - current.y * 0.035;
  });
  return null;
}

const RoseSilk = memo(function RoseSilk() {
  return (
    <ShaderGradient
      control="props"
      type="waterPlane"
      animate="off"
      color1="#fce8f1"
      color2="#dc91b7"
      color3="#f1dba8"
      uTime={0}
      uSpeed={0.38}
      uStrength={2.2}
      uFrequency={2.4}
      uDensity={0.85}
      uAmplitude={0.18}
      cDistance={3.8}
      cPolarAngle={90}
      cAzimuthAngle={0}
      rotationX={0}
      rotationY={0}
      rotationZ={24}
      positionX={0}
      positionY={0}
      positionZ={0}
      enableTransition={false}
      enableCameraUpdate={false}
      lightType="3d"
      brightness={1.3}
      grain="off"
      reflection={0}
    />
  );
});

// Brand-specific rose silk and restrained pale gold. The parent owns passive input.
// No orbit gestures, grain, HDR downloads, or transformations of product imagery.
export default function ShaderScene({
  input,
  paused,
}: {
  input: RefObject<AtmosphereInput>;
  paused: boolean;
}) {
  return (
    <ShaderGradientCanvas
      pixelDensity={1}
      pointerEvents="none"
      powerPreference="low-power"
      style={{ position: "absolute", inset: 0 }}
    >
      <RoseSilk />
      <SilkMotion input={input} paused={paused} />
    </ShaderGradientCanvas>
  );
}
