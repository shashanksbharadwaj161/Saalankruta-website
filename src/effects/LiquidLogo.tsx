"use client";
import { useEffect, useRef } from "react";
import fragment from "./shaders/liquid-logo.frag?raw";
import vertex from "./shaders/liquid-logo.vert?raw";
import { quad, shaderProgram } from "./webgl";
// The original, unmodified logo stays underneath. The MIT liquid-logo shader
// adds a low-opacity metallic reflection only while the footer is visible.
export default function LiquidLogo() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    let program: WebGLProgram;
    try {
      program = shaderProgram(gl, vertex, fragment);
    } catch {
      return;
    }
    gl.useProgram(program);
    const buffer = quad(gl, program, "aVertexPosition");
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const time = uniform("u_time"),
      resolution = uniform("u_resolution");
    const values = {
      u_speed: 0.12,
      u_iterations: 8,
      u_scale: 3.12,
      u_dotFactor: 0.04,
      u_dotMultiplier: 0.21,
      u_vOffset: 5.1,
      u_intensityFactor: 0.07,
      u_expFactor: 0.2,
      u_noiseIntensity: 0.35,
      u_colorShift: 0.1,
      u_logoOpacity: 1,
      u_logoScale: 1,
      u_logoAspectRatio: 2.5,
      u_logoInteractStrength: 0.2,
    };
    Object.entries(values).forEach(([name, value]) =>
      gl.uniform1f(uniform(name), value),
    );
    gl.uniform3f(uniform("u_colorFactors"), 1.1, 0.7, 0.9);
    gl.uniform1i(uniform("u_logoBlendMode"), 0);
    gl.uniform1i(uniform("u_logoTexture"), 0);
    let frame = 0,
      visible = false,
      loaded = false,
      disposed = false;
    const draw = (stamp: number) => {
      frame = 0;
      if (disposed || !loaded || !visible || document.hidden || reduce.matches)
        return;
      gl.uniform1f(time, stamp / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(draw);
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (loaded && visible && !document.hidden && !reduce.matches)
        frame = requestAnimationFrame(draw);
    };
    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      loaded = true;
      update();
    };
    image.src = "/logo.png";
    const resize = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      update();
    });
    resize.observe(canvas);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      update();
    });
    intersection.observe(canvas);
    document.addEventListener("visibilitychange", update);
    reduce.addEventListener("change", update);
    return () => {
      disposed = true;
      image.onload = null;
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", update);
      reduce.removeEventListener("change", update);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);
  return <canvas className="liquid-logo" ref={ref} aria-hidden="true" />;
}
