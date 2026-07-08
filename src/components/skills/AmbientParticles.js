"use client";

import React, { useRef, useEffect } from "react";

export default function AmbientParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Handle resizing
    const resizeCanvas = () => {
      if (canvas.parentNode) {
        canvas.width = canvas.parentNode.clientWidth;
        canvas.height = canvas.parentNode.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Color definitions
    const colors = [
      "rgba(255, 255, 255, 0.4)", // White
      "rgba(168, 85, 247, 0.3)", // Purple
      "rgba(59, 130, 246, 0.3)",  // Blue
    ];

    // Create particles
    const particleCount = 35;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15, // Drifts slightly left/right
        vy: -(Math.random() * 0.2 + 0.1),  // Ascends slowly
        radius: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        depth: Math.random() * 0.8 + 0.2, // For speed scaling
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Update positions
        p.x += p.vx * p.depth;
        p.y += p.vy * p.depth;

        // Boundary wrapping
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) {
          p.x = canvas.width + 10;
        } else if (p.x > canvas.width + 10) {
          p.x = -10;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-15"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
