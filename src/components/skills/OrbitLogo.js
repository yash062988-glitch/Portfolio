"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// SVG Logos for Orbiting System
const logoPaths = {
  React: (props) => (
    <svg viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="currentColor" strokeWidth="1" {...props}>
      <circle cx="0" cy="0" r="2.05" fill="currentColor" />
      <g stroke="currentColor">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  "Next.js": (props) => (
    <svg viewBox="0 0 180 180" fill="none" {...props}>
      <mask id="next-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
        <circle cx="90" cy="90" r="90" fill="black" />
      </mask>
      <g mask="url(#next-mask)">
        <circle cx="90" cy="90" r="90" fill="currentColor" className="text-white" />
        <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V75.3347L139.117 170.187C142.846 166.393 146.326 162.148 149.508 157.52Z" fill="black" />
        <path d="M115 54H127V126H115V54Z" fill="black" />
      </g>
    </svg>
  ),
  TypeScript: (props) => (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <rect width="100" height="100" rx="12" fill="#3178C6" />
      <path d="M68.5 75.3c0-3.3 1.2-5.7 3.6-7.2s5.8-2.2 10.3-2.2c1.7 0 3.3.1 4.7.4v7.7c-1.3-.3-2.6-.4-4-.4-3.1 0-4.6.9-4.6 2.8 0 1.9 1.9 3 5.7 3.3l5.5.5c4.7.4 7.9 1.6 9.7 3.6s2.7 4.9 2.7 8.8c0 3.8-1.4 6.7-4.1 8.8s-6.7 3.1-11.9 3.1c-2.4 0-4.9-.3-7.5-.9v-8.2c1.9.6 4.1 1 6.5 1 3.5 0 5.2-1 5.2-2.9s-1.8-2.9-5.4-3.2l-5.6-.5c-4.4-.4-7.5-1.6-9.3-3.6s-2.8-4.8-2.8-8.8zm-41-4.8h38.2V78H53.5v32.5h-11.8V78H27.5v-7.5z" fill="white" transform="scale(0.7) translate(20, 20)" />
    </svg>
  ),
  JavaScript: (props) => (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <rect width="100" height="100" rx="12" fill="#F7DF1E" />
      <path d="M68.5 75.3c0-3.3 1.2-5.7 3.6-7.2s5.8-2.2 10.3-2.2c1.7 0 3.3.1 4.7.4v7.7c-1.3-.3-2.6-.4-4-.4-3.1 0-4.6.9-4.6 2.8 0 1.9 1.9 3 5.7 3.3l5.5.5c4.7.4 7.9 1.6 9.7 3.6s2.7 4.9 2.7 8.8c0 3.8-1.4 6.7-4.1 8.8s-6.7 3.1-11.9 3.1c-2.4 0-4.9-.3-7.5-.9v-8.2c1.9.6 4.1 1 6.5 1 3.5 0 5.2-1 5.2-2.9s-1.8-2.9-5.4-3.2l-5.6-.5c-4.4-.4-7.5-1.6-9.3-3.6s-2.8-4.8-2.8-8.8z" fill="black" transform="scale(0.7) translate(30, 20)" />
    </svg>
  ),
  "Node.js": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  Express: (props) => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <text x="50%" y="60%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[32px] font-sans">ex</text>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  ),
  MongoDB: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2c0 0-4 4.5-4 9.5C8 16.5 12 22 12 22s4-5.5 4-10.5C16 6.5 12 2 12 2z" />
      <path d="M12 2v20" />
      <path d="M9 11h6" />
    </svg>
  ),
  PostgreSQL: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 3a9 9 0 0 0-9 9c0 3.5 2 6 5.5 7.5l.5-1.5c-3-1.2-4.5-3.5-4.5-6A7.5 7.5 0 1 1 12 19.5c-.7 0-1.3-.1-2-.2l.2 1.5c.6.1 1.2.2 1.8.2a9 9 0 0 0 0-18z" />
      <path d="M12 7.5a4.5 4.5 0 0 0-4.5 4.5" />
    </svg>
  ),
  TailwindCSS: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 6.5c-2.4 0-4 1.2-4.8 3.6 1.2-1.6 2.8-2 4.8-1.2 1.1.4 2 1.4 2.9 2.4C16.4 12.9 18 14.5 20.8 14.5c2.4 0 4-1.2 4.8-3.6-1.2 1.6-2.8 2-4.8 1.2-1.1-.4-2-1.4-2.9-2.4C16.4 8.1 14.8 6.5 12 6.5z" />
      <path d="M4 14.5C1.6 14.5 0 15.7-.8 18.1c1.2-1.6 2.8-2 4.8-1.2 1.1.4 2 1.4 2.9 2.4.9.9 2.5 2.5 5.3 2.5 2.4 0 4-1.2 4.8-3.6-1.2 1.6-2.8 2-4.8 1.2-1.1-.4-2-1.4-2.9-2.4-.9-.9-2.5-2.5-5.3-2.5z" transform="translate(2, -2)" />
    </svg>
  ),
  "Three.js": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="12" y1="12" x2="22" y2="8.5" />
      <line x1="12" y1="12" x2="2" y2="8.5" />
    </svg>
  ),
  GSAP: (props) => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" />
      <text x="50%" y="60%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[24px] font-sans">G</text>
    </svg>
  ),
  "Framer Motion": (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M0 0h12v6H0zm12 6h12v6H12zm-12 6h12v6H0zm12 6h12v6H12z" />
    </svg>
  ),
  Git: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 15V9a4 4 0 0 0-4-4H9" />
      <path d="M9 15v-6" />
    </svg>
  ),
  GitHub: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  "VS Code": (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M2 8l10-6 10 6v8l-10 6-10-6V8z" />
      <path d="M2 8l10 3 10-3" />
      <path d="M12 2v20" />
    </svg>
  ),
  Figma: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h3v5h-3A2.5 2.5 0 0 1 5 5.5z" />
      <path d="M5 12.5A2.5 2.5 0 0 1 7.5 10h3v5h-3A2.5 2.5 0 0 1 5 12.5z" />
      <path d="M11.5 3h3a2.5 2.5 0 0 1 2.5 2.5A2.5 2.5 0 0 1 14.5 8h-3V3z" />
      <path d="M11.5 10h3a2.5 2.5 0 0 1 2.5 2.5A2.5 2.5 0 0 1 14.5 15h-3v-5z" />
      <path d="M5 18.5A2.5 2.5 0 0 1 7.5 16h3v3a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 5 18.5z" />
    </svg>
  ),
  Canva: (props) => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" />
      <text x="50%" y="60%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[20px] font-sans">C</text>
    </svg>
  ),
  Photoshop: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
      <text x="50%" y="68%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[12px] font-sans">Ps</text>
    </svg>
  ),
  Illustrator: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
      <text x="50%" y="68%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[12px] font-sans">Ai</text>
    </svg>
  ),
  Blender: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 6 15" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Firebase: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2l8.5 4.5-8.5 15.5L3.5 6.5 12 2z" />
      <path d="M12 2l4.5 12" />
      <path d="M12 2v20" />
    </svg>
  ),
  Supabase: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.36 11.23l-8.62 10.12a.6.6 0 0 1-1.01-.47v-8.25H4.28a.6.6 0 0 1-.46-1l8.62-10.12a.6.6 0 0 1 1.01.47v8.25h7.45a.6.6 0 0 1 .46 1z" />
    </svg>
  ),
  OpenAI: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2c.5 3 2.5 5 5.5 5.5-3 .5-5 2.5-5.5 5.5-.5-3-2.5-5-5.5-5.5 3-.5 5-2.5 5.5-5.5z" />
    </svg>
  ),
  ChatGPT: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4.5 16.5c-1.5-2.5-1.5-5.5 0-8s4.5-4 7.5-4 6 1.5 7.5 4 1.5 5.5 0 8-4.5 4-7.5 4-6-1.5-7.5-4z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Claude: (props) => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" />
      <text x="50%" y="60%" textAnchor="middle" fill="currentColor" className="font-extrabold text-[20px] font-sans">Cl</text>
    </svg>
  ),
  Gemini: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 2c0 5.5 4.5 10 10 10-5.5 0-10 4.5-10 10 0-5.5-4.5-10-10-10 5.5 0 10-4.5 10-10z" fill="currentColor" />
    </svg>
  ),
  Docker: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M2 12h20" />
      <rect x="4" y="6" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="8" y="6" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="12" y="6" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="6" y="9" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="10" y="9" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="14" y="9" width="3" height="3" rx="0.5" stroke="currentColor" />
      <path d="M2 12a10 10 0 0 0 18 0" />
    </svg>
  ),
  Cloudflare: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M5 12h14M3 9h18M7 15h10M9 18h6" />
      <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z" />
    </svg>
  ),
  Vercel: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2L24 22H0L12 2Z" />
    </svg>
  ),
  Netlify: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
};

export default function OrbitLogo({ name, isHighlighted, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const LogoIcon = logoPaths[name] || ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="10">?</text>
    </svg>
  ));

  const isGlowing = isHovered || isHighlighted;

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Premium Circular Glass Button (w-20 h-20, up ~43%) */}
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-md relative ${
          isGlowing
            ? "border-primary/60 bg-[#e9b15d]/18 shadow-[0_0_25px_rgba(233,177,93,0.45)] scale-120 -translate-y-1"
            : "border-white/10 bg-white/[0.03] hover:border-primary/30"
        }`}
      >
        {/* Soft Inner Glow Outline */}
        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

        {/* Glow behind icon */}
        <div
          className={`absolute inset-1 rounded-full blur-[10px] opacity-0 transition-opacity duration-300 pointer-events-none ${
            isGlowing ? "opacity-40" : ""
          }`}
          style={{
            background: "radial-gradient(circle, rgba(233, 177, 93, 0.4) 0%, transparent 70%)",
          }}
        />

        {/* Logo SVG scaled proportionally (w-10 h-10, up ~43%) */}
        <div className={`w-10 h-10 transition-colors duration-300 ${
          isGlowing ? "text-primary brightness-110" : "text-white/70"
        }`}>
          <LogoIcon className="w-full h-full" />
        </div>
      </div>

      {/* Premium Tooltip shifted slightly higher */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute -top-12 whitespace-nowrap bg-black/90 backdrop-blur-md border border-primary/30 text-[10px] text-primary font-bold px-2.5 py-1 rounded-md shadow-[0_5px_15px_rgba(0,0,0,0.6)] z-[10000]"
          >
            {name}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
