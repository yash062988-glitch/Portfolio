"use client";

import { motion } from "framer-motion";

export default function TechILove() {
  const techs = [
    {
      name: "React",
      tooltip: "Component-driven declarative frontend library",
      icon: (
        <svg className="w-4 h-4 text-[#61dafb] shrink-0" viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="2.05" fill="currentColor"/>
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      )
    },
    {
      name: "Next.js",
      tooltip: "Production-ready full-stack React framework",
      icon: (
        <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M145.474 145.474C137.954 153 128.877 158.749 118.847 162.348C108.817 165.946 98.1188 167.332 87.4329 166.417C76.747 165.502 66.3685 162.308 56.9744 157.042C47.5802 151.776 39.4312 144.576 33.0567 135.912C26.6823 127.247 22.2514 117.348 20.0577 106.857C17.864 96.3667 17.9622 85.5686 20.3458 75.1633C22.7295 64.7581 27.3389 55.0253 33.8703 46.59C40.4018 38.1548 48.6853 31.2407 58.1729 26.301C67.6606 21.3614 78.1065 18.528 88.8258 17.9814C99.5451 17.4348 110.264 19.1895 120.274 23.1294C130.285 27.0692 139.324 33.0906 146.804 40.7937C154.284 48.4967 160.012 57.6749 163.611 67.7288C167.21 77.7828 168.587 88.4526 167.653 99.0345C166.72 109.616 163.501 119.832 158.204 129.018C152.907 138.204 145.671 146.126 137.054 152.261L86.8795 87.9472V66.2758H106.879V54.2758H74.8795V125.726H86.8795L145.474 145.474Z" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      name: "Tailwind CSS",
      tooltip: "Utility-first design framework for absolute layout styling control",
      icon: (
        <svg className="w-4 h-4 text-[#38bdf8] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6.00012C8 6.00012 5.5 8.00012 4.5 12.0001C6 10.5001 7.5 10.0001 9 10.5001C9.856 10.7851 10.472 11.4081 11.151 12.0941C12.257 13.2091 13.582 14.5451 18 14.5451C22 14.5451 24.5 12.5451 25.5 8.54512C24 10.0451 22.5 10.5451 21 10.0451C20.144 9.76012 19.528 9.13712 18.849 8.45112C17.743 7.33612 16.418 6.00012 12 6.00012ZM6 12.0001C2 12.0001 -0.5 14.0001 -1.5 18.0001C0 16.5001 1.5 16.0001 3 16.5001C3.856 16.7851 4.472 17.4081 5.151 18.0941C6.257 19.2091 7.582 20.5451 12 20.5451C16 20.5451 18.5 18.5451 19.5 14.5451C18 16.0451 16.5 16.5451 15 16.0451C14.144 15.7601 13.528 15.1371 12.849 14.4511C11.743 13.3361 10.418 12.0001 6 12.0001Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "Python",
      tooltip: "Programming language for AI, data scripts, and ML modeling",
      icon: (
        <svg className="w-4 h-4 text-[#ffde57] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.3 5.3C11.3 4.86 11.66 4.5 12.1 4.5C12.54 4.5 12.9 4.86 12.9 5.3C12.9 5.74 12.54 6.1 12.1 6.1C11.66 6.1 11.3 5.74 11.3 5.3ZM12.1 17.9C11.66 17.9 11.3 17.54 11.3 17.1C11.3 16.66 11.66 16.3 12.1 16.3C12.54 16.3 12.9 16.66 12.9 17.1C12.9 17.54 12.54 17.9 12.1 17.9ZM16.4 12.7H7.7C7.2 12.7 6.8 12.3 6.8 11.8C6.8 11.3 7.2 10.9 7.7 10.9H16.4C16.9 10.9 17.3 11.3 17.3 11.8C17.3 12.3 16.9 12.7 16.4 12.7Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "TensorFlow",
      tooltip: "Open-source machine learning framework",
      icon: (
        <svg className="w-4 h-4 text-[#ff6f00] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.5L18.5 7.75V11L12 7.75V4.5ZM5.5 9.25L12 12.5V20L5.5 16.75V9.25Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "SQL",
      tooltip: "Relational database querying & data optimization",
      icon: (
        <svg className="w-4 h-4 text-secondary shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.5 2 2 4.5 2 7.5V16.5C2 19.5 6.5 22 12 22C17.5 22 22 19.5 22 16.5V7.5C22 4.5 17.5 2 12 2ZM12 4C17 4 20 5.7 20 6.5C20 7.3 17 9 12 9C7 9 4 7.3 4 6.5C4 5.7 7 4 12 4ZM4 9.8C5.8 10.6 8.7 11 12 11C15.3 11 18.2 10.6 20 9.8V11.5C20 12.3 17 14 12 14C7 14 4 12.3 4 11.5V9.8ZM4 14.8C5.8 15.6 8.7 16 12 16C15.3 16 18.2 15.6 20 14.8V16.5C20 17.3 17 19 12 19C7 19 4 17.3 4 16.5V14.8Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "Node.js",
      tooltip: "Asynchronous backend JavaScript runtime",
      icon: (
        <svg className="w-4 h-4 text-[#68a063] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 6.5V15.5L12 20L20 15.5V6.5L12 2ZM12 4.5L18 8V14L12 17.5L6 14V8L12 4.5Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "Git",
      tooltip: "Distributed version control system",
      icon: (
        <svg className="w-4 h-4 text-[#f05032] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.3 12.3L11.7 2.9C12.1 2.5 12.7 2.5 13.1 2.9L22.5 12.3C22.9 12.7 22.9 13.3 22.5 13.7L13.1 23.1C12.7 23.5 12.1 23.5 11.7 23.1L2.3 13.7C1.9 13.3 1.9 12.7 2.3 12.3ZM12.4 7.6V12.2C11.9 11.9 11.4 11.8 10.9 11.9C9.9 12.1 9.2 13 9.4 14C9.6 15 10.5 15.7 11.5 15.5C12.3 15.3 12.9 14.6 12.9 13.8V9.7C13.9 10.1 14.7 10.9 15 11.9L16.4 11.4C15.9 9.8 14.7 8.5 12.4 7.6Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: "Figma",
      tooltip: "Collaborative design prototyping application",
      icon: (
        <svg className="w-4 h-4 text-[#f24e1e] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2C9.66 2 11 3.34 11 5V8H8C6.34 8 5 6.66 5 5C5 3.34 6.34 2 8 2ZM8 8H11V14H8C6.34 14 5 12.66 5 11C5 9.34 6.34 8 8 8ZM8 14C8 15.66 9.34 17 11 17V20C9.66 20 8 18.66 8 17C8 15.34 8 14 8 14ZM11 8H14V11H11V8ZM14 2C15.66 2 17 3.34 17 5C17 6.66 15.66 8 14 8H11V2H14ZM14 11C15.66 11 17 12.34 17 14C17 15.66 15.66 17 14 17H11V11H14Z" fill="currentColor"/>
        </svg>
      )
    }
  ];

  return (
    <section id="tech-i-love" className="relative w-full py-12 bg-[#0b0705]/80 overflow-hidden border-y border-white/5">
      {/* Light grid overlay for technical texture */}
      <div className="absolute inset-0 bg-grid opacity-[0.015] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Strip label */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase">
            TECH I LOVE
          </span>
        </div>

        {/* Horizontal flex strip of pills */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5">
          {techs.map((tech, idx) => (
            <div
              key={idx}
              className="group relative"
            >
              {/* Technology premium pill */}
              <motion.div
                whileHover={{ y: -2, scale: 1.03 }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/10 bg-white/[0.02] text-xs font-semibold text-white/80 hover:text-white hover:border-primary/45 hover:bg-primary/5 transition-all duration-300 cursor-default shadow-sm select-none"
              >
                {tech.icon}
                <span>{tech.name}</span>
              </motion.div>

              {/* Pure CSS Tooltip (Lag-free, no JS weight) */}
              <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30 flex flex-col items-center">
                <div className="bg-[#120c08] border border-white/10 text-white/90 text-[10px] font-light leading-relaxed px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap max-w-xs">
                  {tech.tooltip}
                </div>
                {/* Tooltip triangle */}
                <div className="w-1.5 h-1.5 bg-[#120c08] border-r border-b border-white/10 rotate-45 -mt-1" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
