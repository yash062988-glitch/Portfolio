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

  return (
    <div
      ref={cardRef}
      className="skill-card-physics relative select-none w-[160px] h-[64px] flex items-center gap-3 px-3 py-2 text-left bg-[#130f0d]/55 border border-white/5 rounded-xl backdrop-blur-md transition-colors duration-300 hover:bg-[#1c1613]/60 group"
    >
      {/* Outlined Icon Container */}
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.02] border border-white/[0.03] text-zinc-400 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 transform group-hover:scale-1.08 shrink-0">
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
