"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AuraRings({ parallaxY, parallaxX, translateZ = 0 }) {
  const ringConfigs = [
    // { size: width & height, duration: rotation duration, clockwise: bool, borderStyle: string, opacity: float }
    { size: 280, duration: 45, clockwise: true, borderStyle: "border-solid", opacity: 0.25 },
    { size: 360, duration: 35, clockwise: false, borderStyle: "border-dashed border-t-2 border-b-2", opacity: 0.18 },
    { size: 440, duration: 55, clockwise: true, borderStyle: "border-dotted", opacity: 0.22 },
    { size: 520, duration: 40, clockwise: false, borderStyle: "border-solid", opacity: 0.15 },
    { size: 600, duration: 65, clockwise: true, borderStyle: "border-dashed border-l border-r", opacity: 0.12 },
  ];

  return (
    <motion.div
      className="absolute flex items-center justify-center pointer-events-none scale-50 sm:scale-75 md:scale-90 lg:scale-100"
      style={{
        y: parallaxY,
        x: parallaxX,
        z: translateZ,
        top: "50%",
        left: "50%",
        translateX: "-50%",
        translateY: "-50%",
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {ringConfigs.map((ring, index) => {
        const directionMultiplier = ring.clockwise ? 1 : -1;
        return (
          <motion.div
            key={index}
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: ring.size,
              height: ring.size,
              transformStyle: "preserve-3d",
              transform: `rotateX(72deg) rotateY(8deg) rotateZ(0deg)`,
            }}
          >
            {/* Rotating inner ring */}
            <motion.div
              animate={{ rotate: 360 * directionMultiplier }}
              transition={{
                duration: ring.duration,
                ease: "linear",
                repeat: Infinity,
              }}
              className={`w-full h-full rounded-full border border-primary/25 backdrop-blur-[1px] shadow-[0_0_12px_rgba(233,177,93,0.06)] ${ring.borderStyle}`}
              style={{
                opacity: ring.opacity,
              }}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
