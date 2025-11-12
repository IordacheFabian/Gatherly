import React, { useEffect, useMemo, useRef } from "react";

/**
 * BubbleBackdrop
 * - Keeps the SAME color palette you provided
 * - Looks good in containers OR as a full-viewport background while scrolling
 * - Pixel-perfect DPR scaling, resize-safe, and reduced-motion friendly
 */

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

type Props = {
  className?: string;
  style?: React.CSSProperties;
  /**
   * Number of particles.
   * Consider lowering a bit if you target very low-end devices.
   */
  count?: number;
  /**
   * When true, the canvas is fixed to the viewport and remains visible while scrolling.
   * It will sit behind your content.
   */
  fullscreen?: boolean;
  /**
   * Optional z-index when fullscreen (use a low/negative value to keep it behind content).
   */
  zIndex?: number;
};

export default function BubbleBackdrop({
  className,
  style,
  count = 40,
  fullscreen = true,
  zIndex = -1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[] | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const dprRef = useRef<number>(Math.max(1, window.devicePixelRatio || 1));

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    // Force ctx to non-null for inner functions
    const ctx = canvas.getContext("2d", { willReadFrequently: false }) as CanvasRenderingContext2D;
    if (!ctx) return;

    // --- particle factory ---
    function createParticles(n: number, w: number, h: number) {
      const minDim = Math.max(1, Math.min(w, h));
      const arr: Particle[] = [];
      for (let i = 0; i < n; i++) {
        const baseSize = (30 + Math.random() * 36) / minDim; // normalized
        arr.push({
          x: Math.random(),
          y: Math.random(),
          r: baseSize,
          // dark purplish -> deep maroon range (approx 320..360 and 0..20)
          hue:
            Math.random() < 0.5
              ? 320 + Math.random() * 40 // purples & wine reds
              : Math.random() * 20, // reddish tones near 0°

          // medium-low saturation for a muted, moody look
          sat: 25 + Math.random() * 25,

          // darker lightness for depth, matching the gradient's tones
          light: 18 + Math.random() * 15,

          phase: Math.random() * Math.PI * 2,
          speed: 0.18 + Math.random() * 0.7,
          ampX: 0.008 + Math.random() * 0.05,
          ampY: 0.008 + Math.random() * 0.05,
          // slightly lower max alpha for subtler glow
          alpha: 0.06 + Math.random() * 0.22,
        });
      }
      return arr;
    }

    // --- size helpers ---
    function targetSize() {
      if (fullscreen) {
        return { width: window.innerWidth, height: window.innerHeight };
      }
      const rect = canvas.getBoundingClientRect();
      return { width: rect?.width || 0, height: rect?.height || 0 };
    }

    function resize() {
      const { width, height } = targetSize();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      dprRef.current = dpr;

      const bw = Math.max(1, Math.floor(width * dpr));
      const bh = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;

      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particlesRef.current = createParticles(count, width, height);

      if (reduceMotion) drawFrame(performance.now(), true);
    }

    function drawFrame(ts: number, singleFrame = false) {
      lastTs.current = ts;
      const { width: w, height: h } = targetSize();
      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";

      const t = ts / 1000;
      const particles = particlesRef.current || [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const ox = Math.cos(t * p.speed + p.phase) * p.ampX * w;
        const oy = Math.sin(t * (p.speed * 0.9) + p.phase * 1.3) * p.ampY * h;

        const cx = p.x * w + ox;
        const cy = p.y * h + oy;

        const radius = Math.max(2, p.r * Math.min(w, h));

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const colorStopInner = `hsla(${p.hue},${p.sat}%,${p.light}%,${Math.min(0.9, p.alpha * 8)})`;
        const colorStopMid = `hsla(${p.hue},${p.sat}%,${p.light}%,${p.alpha})`;
        const colorStopOuter = `hsla(${p.hue},${p.sat}%,${p.light}%,${p.alpha * 0.06})`;

        g.addColorStop(0, colorStopInner);
        g.addColorStop(0.35, colorStopMid);
        g.addColorStop(1, colorStopOuter);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // subtle center haze
      {
        const gg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h));
        gg.addColorStop(0, "rgba(255,255,255,0.02)");
        gg.addColorStop(1, "rgba(0,0,0,0.02)");
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = "source-over";

      if (!singleFrame) {
        rafRef.current = requestAnimationFrame(drawFrame);
      }
    }

    // Initial state
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);

    // If we are fullscreen, we also want to watch for viewport changes (mobile address bar etc.)
    let visHandler: (() => void) | null = null;
    if (fullscreen) {
      visHandler = () => resize();
      document.addEventListener("visibilitychange", visHandler);
    }

    // Kick things off
    resize();
    if (!reduceMotion) rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      if (visHandler) document.removeEventListener("visibilitychange", visHandler);
    };
    // count/fullscreen/reduceMotion control re-run
  }, [count, fullscreen, reduceMotion]);

  const baseStyle: React.CSSProperties = fullscreen
    ? {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex,
        pointerEvents: "none",
      }
    : {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      };

  return <canvas ref={canvasRef} className={className} style={{ ...baseStyle, ...style }} />;
}

