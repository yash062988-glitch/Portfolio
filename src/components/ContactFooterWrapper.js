"use client";

import React, { useState, useEffect, useRef } from "react";
import BlackHole from "./blackhole";

export default function ContactFooterWrapper({ children }) {
  const [particleCount, setParticleCount] = useState(1200);
  const particleWrapperRef = useRef(null);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const animFrameId = useRef(null);

  // Breakpoint-based resize handler for responsive particle counts
  useEffect(() => {
    const getCount = () => {
      if (typeof window === "undefined") return 1200;
      const w = window.innerWidth;
      if (w < 768) return 550;
      if (w < 1024) return 850;
      return 1200;
    };
    setParticleCount(getCount());

    const handleResize = () => {
      const count = getCount();
      setParticleCount((prev) => (prev !== count ? count : prev));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // requestAnimationFrame-based smooth cursor parallax (max 10px translate)
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      targetX.current = x;
      targetY.current = y;
    };

    const updateParallax = () => {
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      if (particleWrapperRef.current) {
        // scale(1.12) to prevent edge exposure on large screens
        particleWrapperRef.current.style.transform = `translate3d(${currentX.current}px, ${currentY.current}px, 0) scale(1.12)`;
      }
      animFrameId.current = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animFrameId.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[#0b0705] bg-root-container">
      {/* Background Video and Cinematic Layering */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-layer-artwork-behind">
        {/* Layer 1.5: Large soft golden glow aligned with the black hole center */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle at 70% 50%, rgba(245,201,122,0.08), transparent 85%)"
          }}
        />

        {/* Layer 2: BlackHole Wrapper with direct transforms to prevent React re-renders */}
        <div
          ref={particleWrapperRef}
          className="absolute pointer-events-none"
          style={{
            inset: "-200px",
            transform: "translate3d(0px, 0px, 0px) scale(1.12)",
            willChange: "transform",
            zIndex: 0
          }}
        >
          <BlackHole
            centre={{ voidRadius: 76, voidX: 70, voidY: 50 }} // positioned behind right side of contact form
            particleCount={particleCount}
            particleSize={4}
            colors={["#FAF5EF", "#FAF5EF", "#FAF5EF", "#F3E5D8", "#F3E5D8", "#EADBC8", "#EADBC8", "#FFE4B5", "#F5C97A", "#FFD27A"]} // Champagne/Ivory palette
            outerRadius={140}
            orbitSpeed={1.8} // slow, smooth, elegant motion
            pullSpeed={0}
            trail={48}
            tilt={18}
            tiltSideway={145}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              opacity: 0.75 // 75% opacity as requested
            }}
          />
        </div>

        {/* Layer 3/4: Background stars & encrypted text (softened to 8% opacity) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08] brightness-[0.75] contrast-[0.90] pointer-events-none select-none"
          style={{ zIndex: 1 }}
        >
          <source src="/images/footer-video.webm" type="video/webm" />
        </video>

        {/* Top Fade: Seamless blend from preceding sections */}
        <div className="absolute inset-x-0 top-0 h-[250px] bg-gradient-to-b from-[#0b0705] to-transparent pointer-events-none bg-layer-overlay" />

        {/* Bottom Fade: Seamless blend at the page end */}
        <div className="absolute inset-x-0 bottom-0 h-[150px] bg-gradient-to-t from-[#0b0705] to-transparent pointer-events-none bg-layer-overlay" />

        {/* Dark Overlay for content readability */}
        <div className="absolute inset-0 bg-[#0b0705]/40 pointer-events-none bg-layer-overlay" />

        {/* Vignette: Atmospheric radial shadow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0b0705_95%)] opacity-85 pointer-events-none bg-layer-overlay" />
      </div>

      {/* Children content (Contact and Footer) */}
      <div className="relative z-10 w-full bg-layer-content">
        {children}
      </div>
    </div>
  );
}
