import React, { useEffect, useRef } from "react";

type Particle = {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  r: number; // normalized radius (0..1 relative to min(width,height))
  hue: number;
  sat: number;
  light: number;
  phase: number;
  speed: number;
  ampX: number;
  ampY: number;
  alpha: number;
};

export default function BubbleBackdrop({
  className,
  style,
  count = 14,
}: {
  className?: string;
  style?: React.CSSProperties;
  count?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[] | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Recreate particles so sizes adapt to new canvas
      particlesRef.current = createParticles(count);
    }

    function createParticles(n: number) {
      const rect = canvas.getBoundingClientRect();
      const minDim = Math.min(rect.width || 1, rect.height || 1);
      const arr: Particle[] = [];
      for (let i = 0; i < n; i++) {
        const baseSize = (10 + Math.random() * 36) / minDim; // normalized
        arr.push({
          x: Math.random(),
          y: Math.random(),
          r: baseSize,
          hue: 215 + Math.random() * 40, // bluish-purple range
          sat: 70 + Math.random() * 20,
          light: 50 + Math.random() * 10,
          phase: Math.random() * Math.PI * 2,
          speed: 0.2 + Math.random() * 0.9,
          ampX: 0.01 + Math.random() * 0.06,
          ampY: 0.01 + Math.random() * 0.06,
          alpha: 0.08 + Math.random() * 0.28,
        });
      }
      return arr;
    }

    particlesRef.current = createParticles(count);
    resize();

    let mounted = true;

    function draw(ts: number) {
      if (!mounted) return;
      // update last timestamp (dt was unused)
      lastTs.current = ts;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // clear
      ctx.clearRect(0, 0, w, h);

      // blend mode for nice light overlaps
      ctx.globalCompositeOperation = "lighter";

      const t = ts / 1000;

      const particles = particlesRef.current!;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // smooth organic motion using sin/cos layered by phase and speed
        const ox = Math.cos(t * p.speed + p.phase) * p.ampX * w;
        const oy = Math.sin(t * (p.speed * 0.9) + p.phase * 1.3) * p.ampY * h;

        const cx = p.x * w + ox;
        const cy = p.y * h + oy;

        const radius = Math.max(2, p.r * Math.min(w, h));

        // radial gradient for soft glow
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const colorStopInner = `hsla(${p.hue},${p.sat}%,${p.light}%,${Math.min(
          0.9,
          p.alpha * 8
        )})`;
        const colorStopMid = `hsla(${p.hue},${p.sat}%,${p.light}%,${p.alpha})`;
        const colorStopOuter = `hsla(${p.hue},${p.sat}%,${p.light}%,${
          p.alpha * 0.06
        })`;

        g.addColorStop(0, colorStopInner);
        g.addColorStop(0.35, colorStopMid);
        g.addColorStop(1, colorStopOuter);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // subtle vignette or haze layer for depth (optional)
      // draw a very faint, large gradient in center to add depth
      {
        const gg = ctx.createRadialGradient(
          w / 2,
          h / 2,
          Math.min(w, h) * 0.2,
          w / 2,
          h / 2,
          Math.max(w, h)
        );
        gg.addColorStop(0, "rgba(255,255,255,0.02)");
        gg.addColorStop(1, "rgba(0,0,0,0.02)");
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, w, h);
      }

      // restore blend mode
      ctx.globalCompositeOperation = "source-over";

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    // reposition on scroll/resize if size changed
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      ro.disconnect();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
