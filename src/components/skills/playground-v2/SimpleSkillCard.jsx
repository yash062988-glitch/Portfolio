"use client";

import React from "react";
import { SkillIcons } from "./icons";

export default function SimpleSkillCard({ skill, categoryLabel, cardRef }) {
  const IconComponent = SkillIcons[skill.name] || (() => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ));

  const BRAND_COLORS = {
    // Frontend
    "React": "#61dafb",
    "Next.js": "#ffffff",
    "JavaScript": "#f7df1e",
    "TypeScript": "#3178c6",
    "HTML5": "#e34f26",
    "CSS3": "#1572b6",
    "Tailwind CSS": "#06b6d4",
    "GSAP": "#88ce02",
    "Framer Motion": "#f028b9",
    
    // Backend
    "Node.js": "#339933",
    "Express": "#ffffff",
    "Python": "#3776ab",
    "FastAPI": "#059669",
    "MongoDB": "#47a248",
    "Firebase": "#ffca28",
    "REST API": "#005b96",
    "SQL": "#e38c00",
    "Git": "#f05032",

    // Tools
    "Cursor": "#38bdf8",
    "Antigravity": "#d8b15b",
    "ChatGPT": "#10a37f",
    "Figma": "#f24e1e",
    "Framer": "#0055ff",
    "Canva": "#00c4cc",
    "Blender": "#ea7600",
    "VS Code": "#007acc",
    "GitHub": "#ffffff",
    "Vercel": "#ffffff",
    "Postman": "#ff6c37",
    "npm": "#cb3837"
  };

  const brandColor = BRAND_COLORS[skill.name] || "#ffffff";

  return (
    <div
      ref={cardRef}
      style={{ "--brand-color": brandColor }}
      className="skill-card-physics relative select-none w-[160px] h-[64px] flex items-center gap-3 px-3 py-2 text-left bg-[#130f0d]/55 border border-white/5 rounded-xl backdrop-blur-md transition-colors duration-300 hover:bg-[#1c1613]/60 group"
    >
      {/* Outlined Icon Container */}
      <div className="skill-icon-container flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.02] border border-white/[0.03] text-zinc-400 transition-all duration-300 transform group-hover:scale-1.08 shrink-0">
        <IconComponent className="w-5 h-5 transition-transform duration-300" />
      </div>

      {/* Skill Labels */}
      <div className="flex flex-col min-w-0 pointer-events-none select-none">
        <span className="text-white font-sans font-bold text-xs tracking-wide truncate">
          {skill.name}
        </span>
        <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider mt-0.5">
          {categoryLabel}
        </span>
      </div>
    </div>
  );
}
