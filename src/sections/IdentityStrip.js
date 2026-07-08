"use client";

import { motion } from "framer-motion";

export default function IdentityStrip() {
  const items = [
    "FULL STACK DEVELOPER",
    "•",
    "AI ENTHUSIAST",
    "•",
    "GRAPHIC DESIGNER",
    "•",
    "OPEN TO OPPORTUNITIES"
  ];

  return (
    <section id="identity-strip" className="w-full relative z-10 py-6 bg-transparent overflow-hidden">
      {/* Texture noise */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="w-full py-4.5 rounded-[20px] border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 shadow-lg select-none text-center relative overflow-hidden">
          {/* Internal golden spotlight glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(233,177,93,0.025)_0%,transparent_70%)] pointer-events-none" />
          
          {items.map((item, idx) => {
            const isBullet = item === "•";
            return (
              <motion.span
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: isBullet ? 0.3 : 0.72 }}
                transition={{ 
                  delay: idx * 0.12,
                  duration: 1.0,
                  ease: "easeInOut"
                }}
                className={`text-[9px] md:text-[10px] tracking-[0.25em] font-bold ${
                  isBullet 
                    ? "text-[#E9B15D]" 
                    : item === "OPEN TO OPPORTUNITIES"
                      ? "text-primary font-extrabold"
                      : "text-white"
                }`}
              >
                {item}
              </motion.span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
