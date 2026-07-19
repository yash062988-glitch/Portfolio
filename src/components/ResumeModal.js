"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Download, Mail, ShieldCheck, Cpu, Code, Award, MapPin } from "lucide-react";
import { useAccentColors } from "@/hooks/useAccentColors";

export default function ResumeModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const iframeRef = useRef(null);
  const { primary, secondary } = useAccentColors();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: "THEME_SYNC", primary, secondary },
          "*"
        );
      } catch (e) {}
    }
  }, [primary, secondary, isOpen]);

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = "/Yash_Jain_Resume.pdf";
    link.setAttribute("download", "Yash_Jain_Resume.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContactClick = (e) => {
    e.stopPropagation();
    onClose();
    setTimeout(() => {
      const contactSec = document.getElementById("contact");
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = "#contact";
      }
    }, 100);
  };

  if (!mounted) return null;

  const modalOverlay = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer pointer-events-auto z-0"
          />

          {/* Centered Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative w-full max-w-4xl p-6 sm:p-8 rounded-[30px] border bg-[#121214] backdrop-blur-[24px] shadow-[0_30px_90px_rgba(0,0,0,0.9)] z-10 my-auto flex flex-col md:flex-row gap-8 justify-between select-none max-h-[92vh] overflow-y-auto"
            style={{
              borderColor: "rgba(var(--accent-glow-raw), 0.45)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm z-30 hover:text-primary"
              style={{
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-primary)";
                e.currentTarget.style.color = "var(--accent-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "white";
              }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Column: Real Resume Live Viewer with Laser Scanner */}
            <div className="w-full md:w-[48%] flex flex-col justify-center">
              <div 
                className="relative w-full aspect-[1/1.414] rounded-2xl bg-[#0d0908] overflow-hidden shadow-2xl" 
                style={{ border: "1px solid rgba(var(--accent-glow-raw), 0.35)" }}
              >
                {/* Real Resume HTML/PDF Live Rendering */}
                <iframe
                  ref={iframeRef}
                  src={`/Yash_Jain_Resume.html?primary=${encodeURIComponent(primary || '')}&secondary=${encodeURIComponent(secondary || '')}`}
                  onLoad={() => {
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                      try {
                        iframeRef.current.contentWindow.postMessage(
                          { type: "THEME_SYNC", primary, secondary },
                          "*"
                        );
                      } catch (e) {}
                    }
                  }}
                  className="w-full h-full border-none select-none rounded-2xl bg-[#0d0908] relative z-10"
                  title="Yash Jain Official Resume Document"
                />

                {/* Laser Scanner Bar animated across the preview card */}
                <div 
                  className="absolute left-0 right-0 h-[2px] shadow-[0_0_12px_rgba(var(--accent-glow-raw),0.8)] opacity-75 animate-scanner pointer-events-none z-20" 
                  style={{ backgroundColor: "var(--accent-primary)" }} 
                />

                {/* Dynamic Gold Emitting Emitter Glow */}
                <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(var(--accent-glow-raw),0.12)_0%,transparent_70%)] blur-xl pointer-events-none z-20" />
              </div>
            </div>

            {/* Right Column: Detailed Overview filling empty space + Action Controls */}
            <div className="w-full md:w-[52%] flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                {/* Tag & Verified Status */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-[0.18em] font-medium font-mono px-2.5 py-1 rounded leading-none" style={{ color: "var(--accent-primary)", backgroundColor: "rgba(var(--accent-glow-raw), 0.05)", border: "1px solid rgba(var(--accent-glow-raw), 0.2)" }}>
                    OFFICIAL CURRICULUM VITAE
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase tracking-[0.18em] font-mono font-medium">Verified Profile</span>
                  </div>
                </div>

                {/* Title & Headline */}
                <div>
                  <h3 className="text-2xl font-semibold font-space-grotesk text-white tracking-tight leading-snug">
                    Yash Jain
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-medium font-mono text-primary mt-1">
                    Full Stack Developer & AI Systems Engineer
                  </p>
                </div>

                {/* Rich Details Grid filling empty space */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 border-y border-white/10 text-xs">
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-mono uppercase tracking-wider font-medium">
                      <Code className="w-3 h-3" />
                      Tech Core
                    </div>
                    <span className="text-white/80 font-inter text-xs">React, Next.js, Python, Node.js</span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-mono uppercase tracking-wider font-medium">
                      <Cpu className="w-3 h-3" />
                      AI Expertise
                    </div>
                    <span className="text-white/80 font-inter text-xs">LLM APIs, Prompt Design & Agents</span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-mono uppercase tracking-wider font-medium">
                      <Award className="w-3 h-3" />
                      Certifications
                    </div>
                    <span className="text-white/80 font-inter text-xs">Google, Microsoft, HP & TCS</span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-mono uppercase tracking-wider font-medium">
                      <MapPin className="w-3 h-3" />
                      Location
                    </div>
                    <span className="text-white/80 font-inter text-xs">Delhi, India (UTC +5:30)</span>
                  </div>
                </div>

                {/* Summary Paragraph */}
                <p className="text-white/70 text-xs font-normal font-inter leading-relaxed">
                  View the live interactive resume on the left preview screen. You can inspect the document online, download a full PDF copy, or connect directly for projects.
                </p>
              </div>

              {/* Action Controls: View Resume, Download Resume, Contact Me */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* View Resume Button */}
                  <button
                    onClick={() => window.open("/Yash_Jain_Resume.html", "_blank")}
                    className="h-11 flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer text-xs font-semibold font-space-grotesk"
                  >
                    View Resume
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    className="h-11 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-[#FAF5EF] text-xs font-semibold font-space-grotesk text-[#120c08] transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: "var(--accent-primary)",
                      boxShadow: "0 4px 15px var(--accent-glow)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent-primary)";
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </button>
                </div>

                {/* Contact Button */}
                <button
                  onClick={handleContactClick}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 cursor-pointer text-xs font-semibold font-space-grotesk"
                >
                  <Mail className="w-4 h-4" />
                  Contact Me Directly
                </button>
              </div>
            </div>

            {/* Global scanner laser animation styles */}
            <style jsx global>{`
              @keyframes scanner {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
              .animate-scanner {
                animation: scanner 6s infinite linear;
              }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(modalOverlay, document.body) : null;
}
