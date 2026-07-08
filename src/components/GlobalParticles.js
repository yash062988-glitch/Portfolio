"use client";

import React, { useEffect, useRef } from "react";

export default function GlobalParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let isTabActive = true;

    // Responsive Canvas Resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track Mouse State
    const mouse = { x: -1000, y: -1000, active: false, radius: 180 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Track Scroll Position for Parallax
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Determine particle count based on screen width
    const getParticleCount = () => {
      const width = window.innerWidth;
      if (width < 640) return 120; // Mobile: significantly reduced
      if (width < 1024) return 240; // Tablet
      return 380; // Desktop
    };

    const particleCount = getParticleCount();
    const particles = [];

    // Particle Color Palette (White, Purple, Blue, Gold theme accent, Soft Amber theme accent)
    const colors = [
      "rgba(255, 255, 255, ",   // White
      "rgba(168, 85, 247, ",   // Purple
      "rgba(59, 130, 246, ",    // Blue
      "rgba(233, 177, 93, ",    // Gold Theme Accent
      "rgba(255, 221, 168, ",   // Soft Amber Theme Accent
    ];

    // Initialize Particles
    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random() * 0.8 + 0.2; // 0.2 (back) to 1.0 (front)
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: (Math.random() * 1.8 + 0.6) * depth, // 1px to 2.4px based on depth
        baseColor: colors[Math.floor(Math.random() * colors.length)],
        depth: depth,
        brightness: Math.random() * 0.4 + 0.2, // Base opacity factor
        angle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() * 0.005 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      });
    }

    // Dynamic Gravitational Centers (3 centers drifting slowly over time)
    const gravityCenters = [
      { x: 0, y: 0, rx: 200, ry: 150, angle: 0, speed: 0.0005 },
      { x: 0, y: 0, rx: 350, ry: 250, angle: Math.PI / 2, speed: 0.0003 },
      { x: 0, y: 0, rx: 400, ry: 300, angle: Math.PI, speed: 0.0002 },
    ];

    // Connection configuration
    const maxConnectDist = 95;
    const maxConnectDistSq = maxConnectDist * maxConnectDist;

    // Render & Simulation Loop
    const tick = (timestamp) => {
      if (!isTabActive) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Update positions of invisible force points (gravity centers)
      gravityCenters.forEach((center) => {
        center.angle += center.speed;
        center.x = w / 2 + Math.cos(center.angle) * center.rx;
        center.y = h / 2 + Math.sin(center.angle) * center.ry;
      });

      // 1. Update Physics and Draw Particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Gravitational force calculations
        let fx = 0;
        let fy = 0;

        // Pull towards invisible gravity centers (O(N) calculation)
        gravityCenters.forEach((center) => {
          const dx = center.x - p.x;
          const dy = center.y - p.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist > 1) {
            // Soft attraction force
            const force = (0.015 * p.depth) / (dist + 50);
            fx += dx * force;
            fy += dy * force;

            // Subtle tangential orbital velocity mapping
            const tx = -dy;
            const ty = dx;
            const orbitForce = (0.003 * p.depth) / (dist + 30);
            fx += tx * orbitForce * (p.orbitSpeed > 0 ? 1 : -1);
            fy += ty * orbitForce * (p.orbitSpeed > 0 ? 1 : -1);
          }
        });

        // Mouse Gravitational Pull (temporary cursor gravity source)
        if (mouse.active) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mDistSq = mdx * mdx + mdy * mdy;

          if (mDistSq < mouse.radius * mouse.radius) {
            const mDist = Math.sqrt(mDistSq);
            if (mDist > 1) {
              // Gentle smooth pull towards mouse cursor
              const pullStrength = (1 - mDist / mouse.radius) * 0.12 * p.depth;
              fx += (mdx / mDist) * pullStrength;
              fy += (mdy / mDist) * pullStrength;
            }
          }
        }

        // Apply forces to velocity with damping
        p.vx = (p.vx + fx) * 0.985;
        p.vy = (p.vy + fy) * 0.985;

        // Update raw coordinates
        p.x += p.vx;
        p.y += p.vy;

        // Screen boundary padding wrap
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;

        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        // Compute Y coordinate with scroll parallax factor (slower in the back)
        // Wraps coordinates to keep canvas populated during long scroll sections
        const yParallax = p.y - scrollY * p.depth * 0.08;
        p.yRendered = ((yParallax % h) + h) % h;

        // Draw particle node
        const opacity = p.brightness * (0.3 + (p.yRendered / h) * 0.5); // Fades slightly near top
        ctx.fillStyle = `${p.baseColor}${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.yRendered, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Soft glow for front-depth particles
        if (p.depth > 0.7) {
          ctx.shadowColor = "rgba(233, 177, 93, 0.1)";
          ctx.shadowBlur = 4;
        } else {
          ctx.shadowBlur = 0;
        }
      }

      // 2. Draw Distance-Based Connecting Lines (O(N) optimized connection mesh)
      ctx.shadowBlur = 0; // Turn off shadows for line rendering to keep draw cycle light
      for (let i = 0; i < particleCount; i += 2) { // Step by 2 to halve computation, maintaining connection mesh look
        const p1 = particles[i];
        for (let j = i + 1; j < particleCount; j += 4) { // Step by 4 to optimize loops
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.yRendered - p2.yRendered;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectDistSq) {
            const dist = Math.sqrt(distSq);
            // Alpha scales down as distance increases and is dimmer for deeper (slower) particles
            const lineAlpha = (1 - dist / maxConnectDist) * 0.07 * p1.depth;
            ctx.strokeStyle = `rgba(233, 177, 93, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.yRendered);
            ctx.lineTo(p2.x, p2.yRendered);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    // Tab visibility activity management (pauses when inactive to conserve CPU)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabActive = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isTabActive = true;
        // Resume simulation loop smoothly
        animationFrameId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start simulation loop
    animationFrameId = requestAnimationFrame(tick);

    // Cleanup Events & Animation loops
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0, // Layered behind the entire website
        background: "transparent",
      }}
    />
  );
}
