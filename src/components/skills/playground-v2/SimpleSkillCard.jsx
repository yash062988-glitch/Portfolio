"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SkillIcons } from "./icons";

// Staggered entrance variants for cards
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 16
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function SimpleSkillCard({ skill, categoryLabel }) {
  const shouldReduceMotion = useReducedMotion();
  const [isPopping, setIsPopping] = useState(false);
  const [ripples, setRipples] = useState([]);
  
  // Randomize float duration and click rotation direction to create natural grid movement
  const floatDuration = useMemo(() => 3.2 + Math.random() * 1.8, []);
  const clickRotate = useMemo(() => (Math.random() > 0.5 ? 2.5 : -2.5), []);

  const IconComponent = SkillIcons[skill.name] || (() => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ));

  const triggerPop = (e) => {
    if (isPopping) return;
    setIsPopping(true);

    // Spawn a golden click ripple
    const id = Date.now();
    setRipples((prev) => [...prev, { id }]);

    // Trigger hover cursor style updates
    document.body.style.cursor = "grabbing";
    
    // Spring back after animation duration
    setTimeout(() => {
      setIsPopping(false);
      document.body.style.cursor = "grab";
    }, 450);
  };

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      triggerPop();
    }
  };

  // Golden click ripple cleanup on animation complete
  const handleRippleComplete = (rippleId) => {
    setRipples((prev) => prev.filter((r) => r.id !== rippleId));
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={shouldReduceMotion ? {} : { 
        y: -6, 
        scale: 1.03,
        transition: { type: "spring", stiffness: 350, damping: 15 }
      }}
      className="relative select-none group w-[160px] h-[64px]"
    >
      {/* Middle Div: Controls subtle float wave */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -3.5, 0] }}
        transition={{
          repeat: Infinity,
          duration: floatDuration,
          ease: "easeInOut"
        }}
        className="w-full h-full"
      >
        {/* Golden Ripple Layer Behind Card */}
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ scale: 0.7, opacity: 0.8 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onAnimationComplete={() => handleRippleComplete(r.id)}
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#e9b15d]/30 to-[#f0c47d]/10 blur-md z-0 pointer-events-none"
          />
        ))}

        {/* Inner Div: Click pop spring block button (handles outline borders, blur, and focus) */}
        <motion.button
          onClick={triggerPop}
          onKeyDown={handleKeyDown}
          onPointerDown={() => {
            if (!isPopping) document.body.style.cursor = "grabbing";
          }}
          onPointerUp={() => {
            if (!isPopping) document.body.style.cursor = "grab";
          }}
          onPointerOver={() => {
            if (!isPopping) document.body.style.cursor = "grab";
          }}
          onPointerOut={() => {
            if (!isPopping) document.body.style.cursor = "auto";
          }}
          aria-label={`${skill.name} skill card. Category: ${categoryLabel}. Click for interaction.`}
          animate={
            isPopping && !shouldReduceMotion
              ? {
                  scale: [0.96, 1.06, 1],
                  y: [0, -20, 0],
                  rotate: [0, clickRotate, 0],
                  boxShadow: [
                    "0 4px 30px rgba(0,0,0,0.5)",
                    "0 15px 35px -5px rgba(233,177,93,0.35)",
                    "0 4px 30px rgba(0,0,0,0.5)"
                  ],
                  borderColor: ["rgba(255,255,255,0.05)", "rgba(233,177,93,0.7)", "rgba(255,255,255,0.05)"]
                }
              : {
                  scale: 1,
                  y: 0,
                  rotate: 0,
                  boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
                  borderColor: "rgba(255,255,255,0.05)"
                }
          }
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 18,
            mass: 0.6
          }}
          className="relative z-10 w-full h-full flex items-center gap-3 px-3 py-2 text-left bg-[#130f0d]/55 border rounded-xl backdrop-blur-md outline-none transition-colors duration-300 hover:border-[#e9b15d]/40 group-hover:bg-[#1c1613]/60 focus:border-[#e9b15d]/60 cursor-pointer"
        >
          {/* Outlined Icon Container */}
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.02] border border-white/[0.03] text-zinc-400 group-hover:text-[#e9b15d] group-hover:border-[#e9b15d]/20 transition-all duration-300 transform group-hover:scale-1.08">
            <IconComponent className="w-5 h-5 transition-transform duration-300" />
          </div>

          {/* Skill Labels */}
          <div className="flex flex-col min-w-0 pointer-events-none">
            <span className="text-white font-sans font-bold text-xs tracking-wide truncate">
              {skill.name}
            </span>
            <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider mt-0.5">
              {categoryLabel}
            </span>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
