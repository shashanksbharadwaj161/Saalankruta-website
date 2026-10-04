"use client";
import { useEffect, useRef } from "react";
import fragment from "./shaders/glass-edge.frag?raw";
import { quad, shaderProgram } from "./webgl";
export default function GlassEdge() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia("(prefers-reduced-transparency: reduce)").matches)
      return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    let program: WebGLProgram;
    try {
      program = shaderProgram(
        gl,
        "attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}",
        fragment,
      );
    } catch {
      return;
    }
    gl.useProgram(program);
    const buffer = quad(gl, program, "a_position");
    const resolution = gl.getUniformLocation(program, "u_resolution"),
      radius = gl.getUniformLocation(program, "u_radius");
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(radius, rect.width < 768 ? 12 : 16);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => {
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);
  return <canvas className="glass-edge" ref={ref} aria-hidden="true" />;
}
