"use client";
import { memo, useEffect, useRef, type RefObject } from "react";
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, type Material, type Mesh } from "three";
import type { AtmosphereInput, AtmosphereDynamics } from "./RoyalAtmosphere";

// The installed ShaderGradient surface exposes these Three.js uniforms in userData.
// Keep the motion driver isolated: uniforms and refs change, React does not render per frame.
type GradientUniforms = Record<string, { value: number }>;
const uniformNames = [
  "uTime",
  "uNoiseStrength",
  "uNoiseDensity",
  "uFrequency",
  "uAmplitude",
] as const;
function readUniforms(material: Material): GradientUniforms | null {
  const data = material.userData as GradientUniforms;
  return uniformNames.every(
    (name) => data[name] && Number.isFinite(data[name].value),
  )
    ? data
    : null;
}

function SilkMotion({
  input,
  dynamics,
  paused,
}: {
  input: RefObject<AtmosphereInput>;
  dynamics: RefObject<AtmosphereDynamics>;
  paused: boolean;
}) {
  const scene = useThree((state) => state.scene);
  const setFrameloop = useThree((state) => state.setFrameloop);
  const invalidate = useThree((state) => state.invalidate);
  const mesh = useRef<Mesh | null>(null);
  useEffect(() => {
    setFrameloop(paused ? "demand" : "always");
    invalidate();
    return () => setFrameloop("always");
  }, [paused, setFrameloop, invalidate]);

  useFrame((_, delta) => {
    if (!mesh.current?.parent) {
      const surface = scene.getObjectByName("shadergradient-mesh");
      if (surface && "isMesh" in surface) mesh.current = surface as Mesh;
    }
    const surface = mesh.current;
    if (!surface) return;
    const material = (
      Array.isArray(surface.material) ? surface.material[0] : surface.material
    ) as Material;
    const uniforms = readUniforms(material);
    if (!uniforms) return;
    const dt = Math.min(delta, 0.05);
    const current = dynamics.current;
    const target = input.current;
    if (!paused) {
      // Damped spring motion carries momentum after a gesture without abrupt resets.
      current.vx =
        (current.vx + (target.x - current.x) * 22 * dt) * Math.exp(-dt * 8.5);
      current.vy =
        (current.vy + (target.y - current.y) * 22 * dt) * Math.exp(-dt * 8.5);
      current.x += current.vx * dt;
      current.y += current.vy * dt;
      current.energy +=
        (target.energy - current.energy) * (1 - Math.exp(-dt * 4));
      target.energy *= Math.exp(-dt * 2.2);
      current.time += dt * (0.3 + current.energy * 0.3);
    }

    // Broad rose folds flow continuously; gestures add a soft, decaying swish.
    uniforms.uTime.value = current.time;
    uniforms.uNoiseStrength.value =
      2.05 + current.energy * 0.36 + current.y * 0.09;
    // Keep the spatial structure stable: gestures move folds rather than rebuilding noise.
    uniforms.uNoiseDensity.value = 0.85;
    uniforms.uFrequency.value = 2.4;
    uniforms.uAmplitude.value = 0.18 + current.energy * 0.065;
    surface.position.x = current.x * 0.22 + Math.sin(current.time * 0.3) * 0.08;
    surface.position.y = -current.y * 0.16;
    surface.rotation.x = current.y * 0.04;
    surface.rotation.y = -current.x * 0.04;
    surface.rotation.z =
      MathUtils.degToRad(24) + current.x * 0.055 - current.y * 0.025;
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
  dynamics,
  paused,
}: {
  input: RefObject<AtmosphereInput>;
  dynamics: RefObject<AtmosphereDynamics>;
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
      <SilkMotion input={input} dynamics={dynamics} paused={paused} />
    </ShaderGradientCanvas>
  );
}
