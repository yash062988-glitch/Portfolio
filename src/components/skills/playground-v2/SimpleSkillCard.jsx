"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
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

const SPACE_EMOJIS = ["🚀", "🛸", "⭐", "✨", "🪐", "☄️", "🌌", "👨‍🚀", "👾", "🛰️"];
const burstCount = 8;
const power = 10;
const spread = 65; // degrees of spread
const gravityVal = 3.5 * 0.15; // gravity * 0.15
const emojiSize = 16;

export default function SimpleSkillCard({ skill, categoryLabel }) {
  const shouldReduceMotion = useReducedMotion();
  const [isPopping, setIsPopping] = useState(false);
  const [ripples, setRipples] = useState([]);
  
  const containerRef = useRef(null);
  const layerRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  
  // Randomize float duration and click rotation direction to create natural grid movement
  const floatDuration = useMemo(() => 3.2 + Math.random() * 1.8, []);
  const clickRotate = useMemo(() => (Math.random() > 0.5 ? 2.5 : -2.5), []);

  const IconComponent = SkillIcons[skill.name] || (() => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ));

  const step = useCallback((ts) => {
    const cont = containerRef.current;
    const arr = particlesRef.current;
    if (!cont) {
      rafRef.current = 0;
      return;
    }
    let dt = lastTsRef.current ? (ts - lastTsRef.current) / 16.6667 : 1;
    lastTsRef.current = ts;
    if (dt > 3) dt = 3;
    
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.vy += gravityVal * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      p.life -= dt;
      
      if (p.life <= 0) {
        p.el.remove();
        arr.splice(i, 1);
        continue;
      }
      
      const fade = p.life < 22 ? Math.max(0, p.life / 22) : 1;
      p.el.style.opacity = String(fade);
      p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
    }
    
    if (arr.length > 0) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      rafRef.current = 0;
      lastTsRef.current = 0;
    }
  }, []);

  const burst = useCallback(() => {
    if (typeof window === "undefined") return;
    const cont = containerRef.current;
    const layer = layerRef.current;
    if (!cont || !layer) return;

    const ox = cont.clientWidth / 2;
    const oy = cont.clientHeight / 2;
    
    const arr = particlesRef.current;
    const MAX = 40; // Maintain solid performance by capping particles per card
    
    for (let k = 0; k < burstCount; k++) {
      if (arr.length >= MAX) break;
      const el = document.createElement("span");
      el.textContent = SPACE_EMOJIS[Math.floor(Math.random() * SPACE_EMOJIS.length)];
      el.style.position = "absolute";
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.fontSize = `${emojiSize}px`;
      el.style.lineHeight = "1";
      el.style.willChange = "transform, opacity";
      el.style.pointerEvents = "none";
      el.style.userSelect = "none";
      el.style.display = "inline-block";
      el.setAttribute("aria-hidden", "true");
      layer.appendChild(el);
      
      const ang = ((-90 + (Math.random() * 2 - 1) * spread) * Math.PI) / 180;
      const speed = power * (0.65 + Math.random() * 0.7);
      
      arr.push({
        el,
        x: ox - emojiSize / 2,
        y: oy - emojiSize / 2,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        rot: Math.random() * 360,
        vrot: (Math.random() * 2 - 1) * 12,
        life: 180 + Math.random() * 60,
      });
    }
    
    if (!rafRef.current) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(step);
    }
  }, [step]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      for (const p of particlesRef.current) {
        if (p.el) p.el.remove();
      }
      particlesRef.current = [];
    };
  }, []);

  const triggerPop = (e) => {
    if (isPopping) return;
    setIsPopping(true);

    // Spawn a golden click ripple
    const id = Date.now();
    setRipples((prev) => [...prev, { id }]);
    
    // Trigger space emoji explosion burst!
    burst();

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
      ref={containerRef}
      variants={cardVariants}
      whileHover={shouldReduceMotion ? {} : { 
        y: -6, 
        scale: 1.03,
        transition: { type: "spring", stiffness: 350, damping: 15 }
      }}
      className="relative select-none group w-[160px] h-[64px]"
    >
      {/* Particle Overlay Layer */}
      <div
        ref={layerRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          pointerEvents: "none",
        }}
      />
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
          transition={
            isPopping
              ? {
                  type: "tween",
                  duration: 0.6,
                  ease: "easeOut"
                }
              : {
                  type: "spring",
                  stiffness: 450,
                  damping: 18,
                  mass: 0.6
                }
          }
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
