"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Mail, FileText } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";

export default function Footer({ onOpenResume }) {
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

  const handleResumeClick = (e) => {
    if (onOpenResume) {
      e.preventDefault();
      onOpenResume();
    }
  };

  return (
    <footer className="w-full relative bg-transparent border-t border-white/10 py-3 md:py-4 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none select-none"
        style={{
          opacity: 0.24,
          filter: "contrast(1.25) brightness(1.2) saturate(1.4)",
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

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-6">
        
        {/* Left: Mission Control Branding & Description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1 max-w-md">
          <div className="flex items-center gap-2">
            <span className="text-primary text-[9px] uppercase font-medium font-mono tracking-[0.25em]">
              MISSION CONTROL
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold font-space-grotesk">
              🚀 Ready for Launch
            </span>
          </div>

          <h3 className="font-semibold text-base md:text-lg text-white font-space-grotesk tracking-tight leading-snug">
            Thanks for visiting my universe.
          </h3>

          <p className="text-white/50 text-[11px] font-normal font-inter leading-snug">
            Every great mission starts with a conversation. Whether you're looking for a developer, a collaborator, or simply want to discuss an idea, I'm always excited to build something extraordinary together.
          </p>
        </div>

        {/* Center: Mission Links */}
        <div className="flex flex-col items-center md:items-start gap-1.5">
          <span className="text-white/40 text-[9px] uppercase font-medium font-mono tracking-[0.18em]">
            MISSION LINKS
          </span>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 md:gap-4 text-xs text-white/70 font-space-grotesk font-semibold">
            <a
              href="https://github.com/yash062988-glitch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-300 flex items-center gap-1.5"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/yash-jain-40581736a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-300 flex items-center gap-1.5"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
              LinkedIn
            </a>
            <a
              href="mailto:yash062988@gmail.com"
              className="hover:text-primary transition-colors duration-300 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </a>
            <a
              href="/Yash_Jain_Resume.html"
              target="_blank"
              onClick={handleResumeClick}
              className="hover:text-primary transition-colors duration-300 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Resume
            </a>
          </div>
        </div>

        {/* Right: Scroll to top & Copyright */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1.5">
          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className={`p-2 rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:text-primary hover:border-primary/45 hover:bg-primary/5 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_15px_rgba(233,177,93,0.3)] cursor-pointer transform transition-all duration-300 font-space-grotesk font-semibold ${
              showScrollTop ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-2 pointer-events-none"
            }`}
            aria-label="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          {/* Bottom Copyright */}
          <div className="flex flex-col items-center md:items-end text-white/40 text-[10px] font-normal font-inter leading-tight">
            <span>© 2026 Yash Jain • Designed with Curiosity</span>
            <span className="text-primary/70 font-mono text-[9.5px]">🚀 Exploring Ideas Beyond Earth</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
