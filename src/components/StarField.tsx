"use client";

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.3,
        brightness: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    init();
    window.addEventListener('resize', init);

    let t = 0;
    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of starsRef.current) {
        const alpha = star.brightness * (0.6 + 0.4 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset));
        const glow = star.size > 1.2;

        if (glow) {
          const grad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
          grad.addColorStop(0, `rgba(255,248,220,${alpha})`);
          grad.addColorStop(1, 'rgba(255,248,220,0)');
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,220,${alpha})`;
        ctx.fill();
      }

      // Occasional bright "cross" stars
      for (const star of starsRef.current) {
        if (star.size > 1.5) {
          const alpha = star.brightness * 0.5 * (0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset));
          ctx.strokeStyle = `rgba(255,240,180,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 4, star.y);
          ctx.lineTo(star.x + star.size * 4, star.y);
          ctx.moveTo(star.x, star.y - star.size * 4);
          ctx.lineTo(star.x, star.y + star.size * 4);
          ctx.stroke();
        }
      }

      t++;
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
