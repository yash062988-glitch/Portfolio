"use client";

import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", hover = true, onClick, ...props }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? {
        y: -4,
        borderColor: "rgba(233, 177, 93, 0.4)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(233, 177, 93, 0.04)"
      } : undefined}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-[24px] border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-lg transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
