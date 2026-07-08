"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SKILLS_DATA } from "@/constants/data";

export default function SkillCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoverEnabled, setHoverEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  // Mouse coordinate motion values relative to the card dimensions
  const rotateX = useMotionValue(0);
  const hoverRotateY = useMotionValue(0);
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  // Smooth springs to interpolate 3D tilt coordinates
  const springConfig = { stiffness: 150, damping: 22 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothHoverRotateY = useSpring(hoverRotateY, springConfig);

  // Dynamic light source gradient string calculated from relative mouse coordinates
  const reflectionBg = useTransform(
    [shineX, shineY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.12) 0%, transparent 55%)`
  );

  // Re-enable hover tilt after flip animation completes
  useEffect(() => {
    if (isFlipped) {
      setHoverEnabled(false);
    } else {
      const timer = setTimeout(() => {
        setHoverEnabled(true);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !hoverEnabled || isFlipped) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center, normalized to [-0.5, 0.5]
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    // Limit tilt yaw and pitch to maximum 4 degrees
    rotateX.set(relativeY * -4);
    hoverRotateY.set(relativeX * 4);

    // Dynamic light shine coordinates (in percentages)
    shineX.set(((e.clientX - rect.left) / width) * 100);
    shineY.set(((e.clientY - rect.top) / height) * 100);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!hoverEnabled || isFlipped) return;
    rotateX.set(0);
    hoverRotateY.set(0);
    shineX.set(50);
    shineY.set(50);
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    console.log("Skill Card Clicked");

    // Reset tilt and reflection coordinates instantly
    rotateX.set(0);
    hoverRotateY.set(0);
    shineX.set(50);
    shineY.set(50);

    // Disable hover immediately for the transition duration
    setHoverEnabled(false);

    // Toggle flip state
    setIsFlipped((prev) => !prev);
  };

  // Categorize tech stack dynamically from SKILLS_DATA
  const getCategorizedSkills = () => {
    const frontend = SKILLS_DATA.filter((s) =>
      ["React", "Next.js", "Tailwind CSS", "HTML & CSS", "JavaScript", "TypeScript"].includes(s.name)
    );
    const backend = SKILLS_DATA.filter((s) =>
      ["Node.js", "MongoDB", "SQL", "Express", "FastAPI"].includes(s.name)
    );
    const ai = SKILLS_DATA.filter((s) =>
      ["Python", "Java", "Artificial Intelligence", "Machine Learning", "Data Analysis", "Statistics", "C++"].includes(s.name)
    );
    const tools = SKILLS_DATA.filter((s) =>
      ["Figma", "Canva", "Git & GitHub", "VS Code", "Git", "Blender", "Three.js"].includes(s.name)
    );

    return {
      Frontend: frontend,
      Backend: backend,
      AI: ai,
      Tools: tools,
    };
  };

  const categorized = getCategorizedSkills();

  return (
    /* 1. Perspective Container */
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={handleCardClick}
      className="relative select-none z-[50] pointer-events-auto cursor-pointer"
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Click Me Hint Badge */}
      <AnimatePresence>
        {!isFlipped && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: [1, 1.05, 1],
              y: [0, -3, 0],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              animate: {
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              },
            }}
            onClick={handleCardClick}
            className="absolute -top-3 -right-3 z-30 px-3 py-1 rounded-full bg-primary text-[#120c08] text-[10px] font-extrabold tracking-wider uppercase shadow-[0_0_15px_rgba(233,177,93,0.4)] flex items-center gap-1 cursor-pointer pointer-events-auto"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#120c08] animate-ping" />
            Click Me
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Wrapper (idle levitation only) */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="relative"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Soft breathing glow halo behind the card */}
        <motion.div
          className="absolute -inset-4 bg-primary/8 rounded-3xl blur-2xl z-[-1]"
          animate={{
            opacity: [0.12, 0.22, 0.12],
            scale: [0.96, 1.04, 0.96],
          }}
          transition={{
            duration: 4.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* 3. Flip Wrapper (controls rotateY 0° ↔ 180° ONLY) */}
        <motion.div
          className="relative w-[310px] h-[460px] sm:w-[330px] sm:h-[480px]"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
        >
          {/* ========================================================= */}
          {/* FRONT FACE                                               */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] select-none pointer-events-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Inner Hover Tilt Wrapper (Handles mouse-tilt only) */}
            <motion.div
              className="w-full h-full flex flex-col justify-between p-7"
              style={{
                rotateX: hoverEnabled ? smoothRotateX : 0,
                rotateY: hoverEnabled ? smoothHoverRotateY : 0,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Dynamic Glass Reflection overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-2xl z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{ background: reflectionBg }}
              />

              {/* Glowing top-right sparkles */}
              <div className="flex justify-between items-center z-10">
                <span className="text-[10px] font-bold tracking-[0.25em] text-primary/80 uppercase">
                  Yash Jain
                </span>
                <Sparkles className="w-4 h-4 text-primary/60 animate-pulse" />
              </div>

              {/* Core Center Artwork */}
              <div className="flex flex-col items-center justify-center relative flex-grow py-8 z-10">
                {/* Central glowing particle rings */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.65, 0.35] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(233,177,93,0.12)_0%,transparent_70%)] absolute z-0 blur-md"
                />
                <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(233,177,93,0.08)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary relative shadow-[0_0_8px_#E9B15D]" />
                </div>

                {/* Floating gold dots to simulate stardust */}
                <span className="absolute w-1 h-1 rounded-full bg-secondary/40 top-[20%] left-[25%] animate-pulse" />
                <span className="absolute w-1.5 h-1.5 rounded-full bg-primary/30 bottom-[25%] right-[20%] animate-ping" />
                <span className="absolute w-1 h-1 rounded-full bg-white/30 top-[35%] right-[30%] animate-pulse" />
              </div>

              {/* Hover Floating Button */}
              <AnimatePresence>
                {isHovered && !isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                    animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 z-20 px-5 py-2.5 rounded-full bg-primary text-[#120c08] text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(233,177,93,0.5)] flex items-center gap-1.5 border border-primary/40"
                  >
                    ACCESS SKILLS
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Call to Actions */}
              <div className="flex flex-col items-center gap-1.5 text-center z-10">
                <h3 className="text-xl font-bold tracking-[0.12em] text-white font-sans uppercase">
                  SKILLS
                </h3>
                <div className="flex items-center text-[10px] font-bold text-primary/85 tracking-widest uppercase mt-1">
                  Click To Reveal
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-3 h-3 ml-1.5 text-primary" />
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* BACK SIDE                                                */}
          {/* ========================================================= */}
          <motion.div
            className="absolute inset-0 w-full h-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] p-6 select-none flex flex-col justify-between pointer-events-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              position: "absolute",
              inset: 0,
              rotateY: 180,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Dynamic Glass Reflection overlay for back side */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{ background: reflectionBg }}
            />

            {/* Back Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5 z-10">
              <span className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase">
                Tech Stack
              </span>
              <span className="text-[9px] font-medium text-white/40 tracking-wider">
                YJ • Portfolio
              </span>
            </div>

            {/* Category stack with chips */}
            <div className="flex flex-col gap-4.5 my-auto overflow-y-auto py-2 pr-0.5 z-10">
              {Object.keys(categorized).map((categoryName) => (
                <div key={categoryName} className="flex flex-col">
                  <span className="text-[9px] font-extrabold tracking-widest text-primary/75 uppercase mb-1.5">
                    {categoryName}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {categorized[categoryName].map((skill, index) => (
                      <span
                        key={`${categoryName}-${skill.name}-${index}`}
                        className="px-2.5 py-1 text-[9px] font-semibold text-white/80 bg-white/[0.03] border border-white/8 rounded-full hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 select-none cursor-default"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Hint */}
            <div className="text-center pt-2 border-t border-white/5 z-10">
              <span className="text-[8px] tracking-[0.2em] font-medium text-white/30 uppercase">
                Click Card to flip back
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
