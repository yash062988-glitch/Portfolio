"use client";

import { motion } from "framer-motion";

export default function SecondaryButton({ children, className = "", onClick, type = "button", disabled = false, ...props }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -1.5 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`h-11 px-6 rounded-full border border-white/10 bg-white/[0.03] text-white/90 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold font-space-grotesk tracking-wide disabled:opacity-50 disabled:cursor-not-allowed select-none ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
