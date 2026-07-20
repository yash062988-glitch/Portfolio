"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import FloatingModel from "./FloatingModel";
import OrbitSystem from "./OrbitSystem";
import AuraRings from "./AuraRings";
import PlatformGlow from "./PlatformGlow";
import SkillCard from "./SkillCard";
import dynamic from "next/dynamic";
import MeshText from "@/components/design-system/MeshText";

export default function SkillsScene() {
  const containerRef = useRef(null);

  // Raw mouse coordinates in the normalized range of -1 to 1
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to interpolate coordinate changes
  const springConfig = { stiffness: 95, damping: 26, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Room Tilt rotation transforms for the foreground centerpiece
  const rotateX = useTransform(smoothY, [-1, 1], [4, -4]); // Pitch
  const rotateY = useTransform(smoothX, [-1, 1], [-4, 4]); // Yaw

  // Subtle X/Y translation offsets for foreground element parallax
  const glowX = useTransform(smoothX, [-1, 1], [-6, 6]);
  const glowY = useTransform(smoothY, [-1, 1], [-6, 6]);

  const ringsX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const ringsY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const modelX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const modelY = useTransform(smoothY, [-1, 1], [-8, 8]);

  const orbitsX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const orbitsY = useTransform(smoothY, [-1, 1], [-12, 12]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => console.log("SKILLS SCENE CLICKED")}
      className="relative w-full py-28 md:py-32 overflow-hidden flex flex-col items-center justify-center cursor-default select-none bg-black"
      style={{
        perspective: 1500, // Essential for 3D room tilt transforms
      }}
    >
      {/* 1. Full-width Environment Background Image & Soft Blending Layers (100% Static) */}
      <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none overflow-hidden bg-layer-artwork-behind">
        {/* Static Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/background image 2.png"
            alt="Skills Environment Background"
            className="w-full h-full object-cover object-center"
            style={{
              willChange: "transform",
            }}
          />
        </div>

        {/* Seamless Edge Blending Overlays (fades image top, bottom, and sides into page bg) */}
        <div className="absolute top-0 left-0 right-0 h-[220px] bg-gradient-to-b from-black to-transparent z-2 pointer-events-none bg-layer-overlay" />
        <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-gradient-to-t from-black to-transparent z-2 pointer-events-none bg-layer-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_95%)] z-2 pointer-events-none bg-layer-overlay" />
        <div className="absolute inset-0 bg-black/50 z-1 pointer-events-none bg-layer-overlay" />
      </div>

      {/* Grid line overlay to match portfolio vibe */}
      <div className="absolute inset-0 bg-grid opacity-[0.025] pointer-events-none z-1 bg-layer-overlay" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-1 bg-layer-overlay" />

      {/* 2. Content Container (Centered relative wrapper matching portfolio margins) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center bg-layer-content">

        {/* Section Heading standardizer */}
        <div className="flex flex-col gap-3 mb-12 md:mb-16 max-w-2xl w-full self-start">
          <span className="text-[12px] font-bold tracking-[0.25em] text-primary uppercase select-none">
            SKILLS
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-[0.05em] leading-none flex flex-wrap gap-x-4">
                     <MeshText text="Skilbfnksfknkjnkls" className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-white tracking-[0.05em] leading-none font-sans" as="span" />
                     <MeshText text="&" className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-primary tracking-[0.05em] leading-none font-sans" color="var(--accent-primary)" as="span" />
                     <MeshText text="Stack" className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-white tracking-[0.05em] leading-none font-sans" as="span" />
                   </h2>
          <p className="text-white/60 text-xs md:text-sm lg:text-base font-light leading-relaxed mt-2">
            Technologies I use to build modern digital experiences.
          </p>
        </div>

        {/* Centered layout for Astronaut Composition Centerpiece */}
        <div className="w-full flex items-center justify-center relative">
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative w-full h-[500px] sm:h-[600px] md:h-[680px] lg:h-[730px] flex items-center justify-center"
          >
            {/* Volumetric Spotlights & Radial Lighting */}
            <div
              className="absolute top-[35%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[95%] h-[95%] bg-[radial-gradient(circle,rgba(233,177,93,0.06)_0%,transparent_65%)] pointer-events-none z-5"
              style={{ transform: "translateZ(-80px)" }}
            />
            <div
              className="absolute top-[30%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[65%] h-[65%] bg-[radial-gradient(circle,rgba(255,221,168,0.03)_0%,transparent_70%)] blur-[90px] pointer-events-none z-5"
              style={{ transform: "translateZ(-60px)" }}
            />

            {/* Holographic Aura Rings */}
            <AuraRings parallaxX={ringsX} parallaxY={ringsY} translateZ={-30} />

            {/* Platform Emissive Glow & Occlusion Shadow */}
            <PlatformGlow parallaxX={glowX} parallaxY={glowY} translateZ={-15} />

            {/* Floating Astronaut Model (Levitating above platform shadow) */}
            <FloatingModel parallaxX={modelX} parallaxY={modelY} translateZ={20} />

            {/* 3D Technology Orbit System with guide lines */}
            <OrbitSystem parallaxX={orbitsX} parallaxY={orbitsY} translateZ={55} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
