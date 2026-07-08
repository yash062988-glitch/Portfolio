import React from "react";
import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
import Image from "next/image";

export default function ProjectDetailsPanel({ selectedProject, onClose }) {
  if (!selectedProject) return null;

  return (
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="relative w-full max-w-[950px] max-md:max-w-[95vw] bg-[#0c0806]/95 border border-white/10 rounded-[24px] overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button in top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors duration-300 z-20 cursor-pointer p-1.5 rounded-full bg-black/40 border border-white/10 hover:border-white/20"
          aria-label="Close details popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Large Preview Image */}
        <div className="w-full md:w-[45%] h-64 md:h-[450px] relative rounded-xl overflow-hidden border border-white/5 bg-black/40 shrink-0">
          <Image
            src={selectedProject.image}
            alt={selectedProject.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Right Side: Information Details */}
        <div className="w-full md:w-[55%] flex flex-col justify-between gap-5 overflow-y-auto pr-1">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-primary uppercase block">
                {selectedProject.category}
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-white uppercase tracking-tight mt-1 leading-tight">
                {selectedProject.title}
              </h3>
            </div>

            {/* Project descriptions (Full, Problem solved, features) */}
            <div className="flex flex-col gap-3 text-xs text-white/70 font-light leading-relaxed">
              <div>
                <h4 className="text-[9px] font-mono tracking-widest text-white/40 uppercase block mb-1">
                  Project Description
                </h4>
                <p>{selectedProject.desc || selectedProject.shortDesc}</p>
              </div>

              {selectedProject.problem && (
                <div>
                  <h4 className="text-[9px] font-mono tracking-widest text-white/40 uppercase block mb-1">
                    Problem Solved
                  </h4>
                  <p className="text-white/80">{selectedProject.problem}</p>
                </div>
              )}

              {selectedProject.solution && (
                <div>
                  <h4 className="text-[9px] font-mono tracking-widest text-white/40 uppercase block mb-1">
                    Features & Solution
                  </h4>
                  <p className="text-white/80">{selectedProject.solution}</p>
                </div>
              )}
            </div>

            {/* Technologies Used Section */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase block leading-none">
                Technologies Used
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.tech.map((t, idx) => (
                  <span
                    key={`${selectedProject.id}-${t}-${idx}`}
                    className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[9px] text-white/70 font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* GitHub & Live Demo Action buttons (Equal width) */}
          <div className="flex items-center gap-3 mt-2">
            <a
              href={selectedProject.github}
              target="_blank"
              rel="noreferrer"
              className="action-btn flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-primary hover:bg-primary/95 text-[10px] font-bold uppercase tracking-wider text-[#120c08] transition-all duration-300 w-1/2 text-center font-extrabold shadow-[0_0_15px_rgba(233,177,93,0.25)]"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href={selectedProject.demo}
              target="_blank"
              rel="noreferrer"
              className="action-btn flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white transition-all duration-300 w-1/2 text-center hover:bg-white/10"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Demo
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
