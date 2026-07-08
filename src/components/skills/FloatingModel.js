"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FloatingModel({ parallaxY, parallaxX, translateZ = 0 }) {
  return (
    <motion.div
      className="relative flex items-center justify-center pointer-events-none"
      style={{
        y: parallaxY,
        x: parallaxX,
        transform: `translate3d(0, -95px, ${translateZ}px)`, // Repositioned down to align astronaut with orbits
        transformStyle: "preserve-3d",
      }}
    >
      {/* 1. Astronaut Centerpiece (Floating Layer) */}
      <motion.div
        animate={{
          y: [0, -9, 0], // Subtle 9px vertical movement range
          rotate: [-0.5, 0.5, -0.5],
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="relative z-20 flex items-center justify-center w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[440px]"
      >
        {/* Glow behind the astronaut */}
        <div className="absolute top-[40%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[120%] h-[120%] bg-radial-glow-astronaut opacity-50 blur-[50px] z-0 pointer-events-none" />

        <img
          src="/images/skills-model.png"
          alt="Skills Shrine Centerpiece"
          className="relative z-10 w-full h-auto object-contain drop-shadow-[0_0_30px_rgba(233,177,93,0.15)]"
          style={{
            transform: "translateZ(0)", // GPU acceleration trigger
          }}
        />
      </motion.div>

      {/* 2. Base Platform Model (Stationary Layer) */}
      <div
        className="absolute z-10 flex items-center justify-center w-full max-w-[400px] sm:max-w-[450px] md:max-w-[540px] lg:max-w-[620px]"
        style={{
          transform: "translate3d(0, 245px, -10px)", // Scaled up 25% and lowered by 25px to maintain visual gap
        }}
      >
        <img
          src="/images/base-for-model.png"
          alt="Base Platform Model"
          className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
          style={{
            transform: "translateZ(0)", // GPU acceleration trigger
          }}
        />
      </div>
    </motion.div>
  );
}
