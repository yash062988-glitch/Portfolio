"use client";

import React, { useEffect, useRef } from "react";

export default function CertificatesThreeBg({ speedMultiplierRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let width = 0;
    let height = 0;

    const stars = [];
    const shootingStars = [];
    
    // Parallax scroll offsets
    let starOffset = 0;
    let orbitOffset = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.parentNode.getBoundingClientRect();
      width = rect.width * dpr;
      height = rect.height * dpr;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      
      // Initialize stars
      stars.length = 0;
      const count = Math.min(100, Math.floor((width * height) / 12000));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1,
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
          parallaxFactor: Math.random() * 0.2 + 0.05 // different depth scroll speeds
        });
      }
    };

    window.addEventListener("resize", resize);
    resize();

    // Spawn shooting stars occasionally
    const spawnShootingStar = () => {
      if (shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.6,
          y: Math.random() * height * 0.4,
          dx: Math.random() * 3 + 2,
          dy: Math.random() * 1.5 + 1,
          len: Math.random() * 80 + 40,
          speed: Math.random() * 4 + 4,
          alpha: 1
        });
      }
    };

    const tick = (now) => {
      ctx.clearRect(0, 0, width, height);

      // Read dynamic speed multiplier from parent ref
      const speedMult = speedMultiplierRef ? speedMultiplierRef.current : 1.0;

      // Update background scrolling offsets
      starOffset -= 0.15 * speedMult;
      orbitOffset -= 0.35 * speedMult;

      // 1. Draw static background faint orbit lines with parallax scroll offsets
      ctx.strokeStyle = "rgba(233, 177, 93, 0.025)";
      ctx.lineWidth = 0.75;
      
      ctx.save();
      ctx.translate(orbitOffset % width, 0);
      
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.5, Math.min(width, height) * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width * 1.2, height * 0.5, Math.min(width, height) * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.3, Math.min(width, height) * 0.25, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width * 1.8, height * 0.3, Math.min(width, height) * 0.25, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();

      // 2. Draw stars with individual horizontal parallax speeds
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.speed;
        const currentAlpha = Math.max(0.1, Math.min(0.8, s.alpha + Math.sin(s.phase) * 0.2));
        ctx.globalAlpha = currentAlpha;
        
        // Calculate coordinate including horizontal drift parallax offset
        let drawX = (s.x + starOffset * s.parallaxFactor * 10) % width;
        if (drawX < 0) drawX += width;
        
        ctx.beginPath();
        ctx.arc(drawX, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw shooting stars
      ctx.globalAlpha = 1.0;
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ctx.strokeStyle = `rgba(233, 177, 93, ${ss.alpha})`;
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x + ss.dx * ss.len * 0.1, ss.y + ss.dy * ss.len * 0.1);
        ctx.stroke();

        // Update shooting star coordinates
        ss.x += ss.dx * ss.speed * speedMult;
        ss.y += ss.dy * ss.speed * speedMult;
        ss.alpha -= 0.02 * speedMult;

        if (ss.alpha <= 0 || ss.x > width || ss.y > height) {
          shootingStars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1.0;
      if (Math.random() < 0.005 && speedMult > 0.1) {
        spawnShootingStar();
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [speedMultiplierRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ pointerEvents: "none" }}
    />
  );
}
