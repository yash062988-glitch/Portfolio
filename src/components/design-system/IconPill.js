"use client";

import { motion } from "framer-motion";

export default function IconPill({ children, icon, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -1.5, borderColor: "rgba(233, 177, 93, 0.45)", backgroundColor: "rgba(233, 177, 93, 0.04)" }}
      transition={{ duration: 0.3 }}
      className={`group flex items-center px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.02] text-xs font-semibold text-white/90 hover:text-white transition-all duration-300 cursor-default shadow-sm select-none ${className}`}
    >
      {icon ? (
        <span className="mr-2 flex items-center justify-center text-primary">{icon}</span>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 shadow-[0_0_8px_rgba(233,177,93,0.65)] group-hover:scale-110 transition-transform duration-300" />
      )}
      <span>{children}</span>
    </motion.div>
  );
}
