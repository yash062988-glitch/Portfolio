"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";
import { motion } from "framer-motion";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full relative bg-transparent border-t border-white/10 py-12 md:py-16 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none select-none"
        style={{
          opacity: 0.24, // 20-28% opacity
          filter: "none",
          backdropFilter: "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        <source src="/videos/real-footer-video.webm" type="video/webm" />
      </video>

      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none" 
        style={{ 
          background: "rgba(8, 8, 8, 0.55)",
          backdropFilter: "none",
          filter: "none"
        }}
      />

      {/* Top Fade */}
      <div 
        className="absolute inset-x-0 top-0 h-[80px] bg-gradient-to-b from-[#0b0705] to-transparent z-2 pointer-events-none"
        style={{
          backdropFilter: "none",
          filter: "none"
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
        
        {/* Left: Branding & Tech details */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-[#120c08] font-bold text-sm tracking-wider">
              YJ
            </span>
            <span className="font-semibold text-base text-white">
              Yash Jain
            </span>
          </div>
          
          <p className="text-white/40 text-xs max-w-xs font-light leading-relaxed">
            Built with Next.js, React, Tailwind CSS, and Framer Motion. Handcrafted with luxury cinematic vibes.
          </p>

          <span className="text-white/40 text-xs font-light pt-2 block md:hidden">
            © 2026 Yash Jain. All rights reserved.
          </span>
        </div>

        {/* Center: Social Links */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">
            Quick Links
          </span>
          <div className="flex items-center gap-6 text-sm text-white/70">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-300 flex items-center gap-1.5"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-300 flex items-center gap-1.5"
            >
              <LinkedinIcon className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href="mailto:contact@yashjain.com"
              className="hover:text-primary transition-colors duration-300 flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          </div>
        </div>

        {/* Right: Scroll to top & Copyright */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-6">
          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className={`p-3 rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:text-primary hover:border-primary/45 hover:bg-primary/5 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_15px_rgba(233,177,93,0.3)] cursor-pointer transform transition-all duration-300 ${
              showScrollTop ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-2 pointer-events-none"
            }`}
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          <span className="text-white/40 text-xs font-light hidden md:block">
            © 2026 Yash Jain. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
}
