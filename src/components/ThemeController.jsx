"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

export const THEME_PRESETS = [
  {
    name: "Solar Gold",
    primary: "#D8B15B",
    secondary: "#F0C979",
    glow: "rgba(216, 177, 91, 0.35)",
    rawRgb: "216, 177, 91",
    color: "#D8B15B"
  },
  {
    name: "Plasma Blue",
    primary: "#4DA6FF",
    secondary: "#8BD2FF",
    glow: "rgba(77, 166, 255, 0.35)",
    rawRgb: "77, 166, 255",
    color: "#4DA6FF"
  },
  {
    name: "Nebula Purple",
    primary: "#8B5CF6",
    secondary: "#C084FC",
    glow: "rgba(139, 92, 246, 0.35)",
    rawRgb: "139, 92, 246",
    color: "#8B5CF6"
  },
  {
    name: "Aurora Cyan",
    primary: "#38E8FF",
    secondary: "#9AF7FF",
    glow: "rgba(56, 232, 255, 0.35)",
    rawRgb: "56, 232, 255",
    color: "#38E8FF"
  },
  {
    name: "Emerald Core",
    primary: "#22C55E",
    secondary: "#6EE7A5",
    glow: "rgba(34, 197, 94, 0.35)",
    rawRgb: "34, 197, 94",
    color: "#22C55E"
  },
  {
    name: "Mars Copper",
    primary: "#C57B57",
    secondary: "#E4A67D",
    glow: "rgba(197, 123, 87, 0.35)",
    rawRgb: "197, 123, 87",
    color: "#C57B57"
  },
  {
    name: "Crimson Nova",
    primary: "#FF4D6D",
    secondary: "#FF8AA0",
    glow: "rgba(255, 77, 109, 0.35)",
    rawRgb: "255, 77, 109",
    color: "#FF4D6D"
  },
  {
    name: "Lunar White",
    primary: "#F4F4F4",
    secondary: "#FFFFFF",
    glow: "rgba(255, 255, 255, 0.35)",
    rawRgb: "255, 255, 255",
    color: "#F4F4F4"
  }
];

export default function ThemeController() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("Solar Gold");
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("accent-theme");
    if (saved) {
      const preset = THEME_PRESETS.find((p) => p.name === saved);
      if (preset) {
        setActiveTheme(preset.name);
        applyTheme(preset);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.style.setProperty("--accent-primary", theme.primary);
    root.style.setProperty("--accent-secondary", theme.secondary);
    root.style.setProperty("--accent-glow", theme.glow);
    root.style.setProperty("--accent-glow-raw", theme.rawRgb);
    localStorage.setItem("accent-theme", theme.name);
  };

  const handleSelect = (theme) => {
    setActiveTheme(theme.name);
    applyTheme(theme);
    // Auto minimize after click selection
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return (
    <div ref={containerRef} className="fixed bottom-32 left-6 z-[999] select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute bottom-14 left-0 p-4 rounded-[24px] border border-[#E9B15D]/15 bg-[#121214]/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(233,177,93,0.05)] w-56 flex flex-col gap-3.5"
            style={{
              borderColor: "var(--accent-glow)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 20px var(--accent-glow)"
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-white/50">Core Engine</span>
              <Sparkles className="w-3.5 h-3.5 text-primary" style={{ color: "var(--accent-primary)" }} />
            </div>

            {/* Grid of Preset Swatches */}
            <div className="grid grid-cols-4 gap-2">
              {THEME_PRESETS.map((theme) => {
                const isActive = activeTheme === theme.name;
                return (
                  <button
                    key={theme.name}
                    onClick={() => handleSelect(theme)}
                    title={theme.name}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative border cursor-pointer ${
                      isActive 
                        ? "scale-110 shadow-[0_0_15px_var(--accent-glow)]" 
                        : "hover:scale-105 border-transparent"
                    }`}
                    style={{
                      backgroundColor: theme.primary,
                      borderColor: isActive ? "white" : "transparent"
                    }}
                  >
                    {isActive && (
                      <Check className="w-4 h-4 text-black mix-blend-difference drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Status indicator */}
            <div className="text-[8px] font-mono tracking-widest text-white/40 text-center uppercase">
              ACTIVE PRES: {activeTheme}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full flex items-center justify-center border border-[#E9B15D]/25 bg-[#121214]/75 backdrop-blur-md cursor-pointer transition-all duration-300 shadow-lg text-lg select-none outline-none"
        style={{
          borderColor: "var(--accent-primary)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.4), 0 0 10px var(--accent-glow)"
        }}
      >
        <span className="animate-[spin_20s_linear_infinite] inline-block font-sans text-glow-accent">✦</span>
      </motion.button>

      <style jsx>{`
        .text-glow-accent {
          text-shadow: 0 0 8px var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
