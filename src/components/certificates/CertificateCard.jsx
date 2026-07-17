"use client";

import React from "react";
import { ShieldCheck, Award } from "lucide-react";

const IssuerLogo = () => {
  return <Award className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />;
};

export default function CertificateCard({ certificate, isCentered, onClick }) {
  const { title, issuer, issued, company, pdfUrl } = certificate;

  return (
    <button
      onClick={onClick}
      className={`group relative w-full h-full p-5 rounded-[30px] border bg-[#121214]/75 backdrop-blur-[18px] text-left flex flex-col justify-between transition-all duration-500 cursor-pointer outline-none overflow-hidden select-none`}
      style={{
        borderColor: isCentered ? "rgba(var(--accent-glow-raw), 0.4)" : "rgba(var(--accent-glow-raw), 0.15)",
        boxShadow: isCentered 
          ? "0 20px 50px var(--accent-glow)" 
          : "0 20px 50px rgba(0,0,0,0.12)"
      }}
      onMouseEnter={(e) => {
        if (!isCentered) {
          e.currentTarget.style.borderColor = "rgba(var(--accent-glow-raw), 0.4)";
          e.currentTarget.style.boxShadow = "0 20px 50px var(--accent-glow)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isCentered) {
          e.currentTarget.style.borderColor = "rgba(var(--accent-glow-raw), 0.15)";
          e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.12)";
        }
      }}
    >
      {/* 1. COMPACT PREVIEW LAYER (Active when NOT centered) */}
      <div 
        className={`absolute inset-0 p-5 flex flex-col justify-between z-10 transition-all duration-300 ${
          isCentered ? "opacity-0 pointer-events-none scale-95 blur-sm" : "opacity-100 scale-100 blur-0"
        }`}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 shadow-inner">
            <IssuerLogo />
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-3 h-3 flex-shrink-0" />
            <span className="text-[8px] uppercase tracking-wider font-mono font-bold">Verified</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex-grow flex items-center py-2">
          <h4 className="text-[13px] font-bold text-white leading-snug tracking-tight font-sans group-hover:text-primary transition-colors duration-300">
            {title}
          </h4>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/[0.03] flex items-center justify-between text-[9px] font-mono tracking-wide text-white/40">
          <span>Issued: {issued}</span>
          <span className="font-semibold text-white/50 truncate max-w-[120px]">{company}</span>
        </div>
      </div>

      {/* 2. PRESENTATION STATE LAYER (Active in Center Spotlight only, with transition delay) */}
      <div 
        className={`absolute inset-0 w-full h-full z-20 transition-all duration-500 rounded-[30px] overflow-hidden ${
          isCentered 
            ? "opacity-100 scale-100 blur-0 translate-y-0 delay-300" 
            : "opacity-0 scale-95 blur-sm translate-y-4 pointer-events-none"
        }`}
      >
        {/* Full-Card Native PDF IFrame viewer rendering the user's actual certificate file */}
        <iframe 
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-none pointer-events-none select-none rounded-[30px]"
          scrolling="no"
          title={title}
        />

        {/* Top-Right Overlay Verified Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
          <ShieldCheck className="w-3 h-3 flex-shrink-0" />
          <span className="text-[8px] uppercase tracking-wider font-mono font-bold">Verified</span>
        </div>

        {/* Bottom Details Overlay Panel Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/85 to-black/25 backdrop-blur-[2px] border-t border-white/5 flex flex-col gap-0.5 select-none">
          <h4 className="text-[11px] font-extrabold text-white leading-tight font-sans truncate text-glow-gold">
            {title}
          </h4>
          <div className="flex items-center justify-between text-[8px] font-mono tracking-wide text-white/40 mt-1">
            <span>ISSUED: {issued}</span>
            <span className="tracking-widest" style={{ color: "var(--accent-primary)" }}>{issuer.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Decorative reflection elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out z-0 pointer-events-none" />
      <div className="absolute top-[-50px] right-[-50px] w-36 h-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.01)_0%,transparent_70%)] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      
      {/* Orbit Rings Backdrop (Micro-Space Design Element) */}
      <div className="absolute bottom-[-10px] right-[-10px] w-24 h-24 rounded-full flex items-center justify-center pointer-events-none z-0" style={{ border: "1px solid rgba(var(--accent-glow-raw), 0.05)" }}>
        <div className="w-16 h-16 border border-dashed rounded-full group-hover:rotate-[45deg] transition-transform duration-1000 ease-out" style={{ borderColor: "rgba(var(--accent-glow-raw), 0.03)" }} />
      </div>

      <style jsx global>{`
        .text-glow-gold {
          text-shadow: 0 0 8px rgba(var(--accent-glow-raw), 0.15);
        }
      `}</style>
    </button>
  );
}
