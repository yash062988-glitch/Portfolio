"use client";

import React, { useRef } from "react";
import { useInView } from "framer-motion";
import PhysicsSandbox from "./PhysicsSandbox";

export default function PlaygroundSection({ sectionId, title, skills }) {
  const containerRef = useRef(null);
  // Monitor when section is near the screen viewport to activate physics (stops computations when offscreen)
  const isInView = useInView(containerRef, { margin: "200px 0px 200px 0px" });

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] md:h-[600px] relative flex items-center justify-center overflow-hidden border-b border-white/[0.02] last:border-b-0"
    >
      {/* Background Title (scrolls naturally inside section container, never overlaps other titles) */}
      <div
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          opacity: 0.04
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14vw] sm:text-[12vw] md:text-[10vw] font-black tracking-tighter text-white uppercase text-center w-full leading-none pointer-events-none select-none z-0"
      >
        {title}
      </div>

      {/* Floating Side Indicators */}
      <div className="absolute top-1/2 left-6 md:left-12 -translate-y-1/2 flex flex-col gap-2 pointer-events-none z-20 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e9b15d]" />
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-[#e9b15d] uppercase leading-none">
            interactive playground
          </span>
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight uppercase leading-none">
          {title} pile
        </h3>
        <p className="text-white/40 text-[10px] md:text-xs font-light max-w-[200px] leading-relaxed">
          Grab, toss, and stack these premium technology blocks.
        </p>
      </div>

      {/* Isolated Interactive WebGL Physics Sandbox */}
      <div className="absolute inset-0 w-full h-full z-10 bg-transparent">
        <PhysicsSandbox
          sectionId={sectionId}
          skills={skills}
          paused={!isInView}
        />
      </div>
    </div>
  );
}
