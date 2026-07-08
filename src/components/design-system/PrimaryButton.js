"use client";

import { motion } from "framer-motion";

export default function PrimaryButton({ children, className = "", onClick, type = "button", disabled = false, ...props }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -1.5 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`h-11 px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-[#120c08] text-xs font-bold tracking-wide hover:shadow-[0_0_20px_rgba(233,177,93,0.35)] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
