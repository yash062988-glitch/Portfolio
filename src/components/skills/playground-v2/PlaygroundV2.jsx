"use client";

import React from "react";
import { motion } from "framer-motion";
import SimpleSkillCard from "./SimpleSkillCard";

const GRID_SECTIONS = [
  {
    id: "frontend",
    title: "Frontend",
    skills: [
      { name: "React" },
      { name: "Next.js" },
      { name: "JavaScript" },
      { name: "TypeScript" },
      { name: "HTML5" },
      { name: "CSS3" },
      { name: "Tailwind CSS" },
      { name: "GSAP" },
      { name: "Framer Motion" }
    ]
  },
  {
    id: "backend",
    title: "Backend",
    skills: [
      { name: "Node.js" },
      { name: "Express" },
      { name: "Python" },
      { name: "FastAPI" },
      { name: "MongoDB" },
      { name: "Firebase" },
      { name: "REST API" },
      { name: "SQL" },
      { name: "Git" }
    ]
  },
  {
    id: "tools",
    title: "Tools",
    skills: [
      { name: "Cursor" },
      { name: "Antigravity" },
      { name: "ChatGPT" },
      { name: "Figma" },
      { name: "Framer" },
      { name: "Canva" },
      { name: "Blender" },
      { name: "VS Code" },
      { name: "GitHub" },
      { name: "Vercel" },
      { name: "Postman" },
      { name: "npm" }
    ]
  }
];

// Viewport entrance grid container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

export default function PlaygroundV2() {
  return (
    <div className="w-full bg-black flex flex-col relative z-10 py-6 select-none">
      {GRID_SECTIONS.map((sec) => (
        <div 
          key={sec.id} 
          id={sec.id}
          className="w-full flex flex-col items-center py-10 md:py-14 border-b border-white/[0.02] last:border-b-0"
        >
          {/* Elegant Centered Section Heading */}
          <div className="flex flex-col items-center mb-8 md:mb-10 pointer-events-none">
            <h3 className="text-lg md:text-xl font-bold text-white tracking-[0.25em] text-center uppercase font-sans">
              {sec.title}
            </h3>
            {/* Subtle Gold Stage Accent Line */}
            <div className="w-10 h-[2px] bg-gradient-to-r from-transparent via-[#e9b15d] to-transparent mt-2.5" />
          </div>

          {/* Cards Grid Grid Wrapper */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 justify-items-center max-w-6xl mx-auto w-full px-6"
          >
            {sec.skills.map((skill) => (
              <SimpleSkillCard
                key={skill.name}
                skill={skill}
                categoryLabel={sec.id === "tools" ? "Tool" : sec.title}
              />
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
