"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PlatformGlow({ parallaxY, parallaxX, translateZ = 0 }) {
  return (
    <motion.div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        y: parallaxY,
        x: parallaxX,
        z: translateZ,
        top: "70%", // Placed beneath the astronaut's feet on the platform
        left: "50%",
        translateX: "-50%",
        translateY: "-50%",
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      {/* 1. Static Photorealistic Ambient Occlusion Shadow */}
      <div
        className="absolute w-[80px] h-[25px] sm:w-[110px] sm:h-[35px] md:w-[140px] md:h-[45px] rounded-full blur-[5px] z-2"
        style={{
          background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.85) 0%, transparent 75%)",
          transform: "rotateX(75deg)",
          willChange: "transform",
        }}
      />

      {/* 2. Static Volumetric Glow Underneath Model (Anti-gravity effect) */}
      <div
        className="absolute w-[110px] h-[35px] sm:w-[150px] sm:h-[48px] md:w-[190px] md:h-[60px] rounded-full blur-[10px] z-1"
        style={{
          background: "radial-gradient(ellipse, rgba(233, 177, 93, 0.35) 0%, transparent 80%)",
          transform: "rotateX(75deg) translate3d(0, -12px, 0)", // Elevated slightly above the platform floor
          willChange: "transform",
        }}
      />

      {/* 3. Static Core Emissive Platform Glow */}
      <div
        className="absolute w-[150px] h-[48px] sm:w-[200px] sm:h-[65px] md:w-[260px] md:h-[80px] rounded-full blur-[16px] z-0"
        style={{
          background: "radial-gradient(ellipse, rgba(233, 177, 93, 0.25) 0%, transparent 75%)",
          transform: "rotateX(75deg)",
          willChange: "transform",
        }}
      />
    </motion.div>
  );
}
