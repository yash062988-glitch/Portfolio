"use client";

import React from "react";
import { ShieldCheck, Cpu } from "lucide-react";

export default function CertificatePreview({ certificate }) {
  const { title, issued, credential, company } = certificate;

  return (
    <div className="relative w-full h-[220px] sm:h-[260px] rounded-2xl border border-[#E9B15D]/20 bg-black/45 overflow-hidden flex flex-col justify-between p-6 select-none font-mono">
      {/* Decorative Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(rgba(233,177,93,0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(233,177,93,0.15) 1px, transparent 1px)`,
          backgroundSize: "20px 20px"
        }}
      />
      
      {/* Dynamic Gold Light Circle */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(233,177,93,0.06)_0%,transparent_70%)] blur-xl pointer-events-none" />

      {/* Hologram Scanner Bar */}
      <div className="absolute left-0 right-0 h-[1.5px] bg-[#E9B15D]/20 shadow-[0_0_8px_rgba(233,177,93,0.4)] opacity-50 animate-scanner pointer-events-none" />

      {/* Header Telemetry */}
      <div className="flex items-center justify-between text-[8px] text-white/35 border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 font-bold tracking-[0.15em]">
          <Cpu className="w-2.5 h-2.5 text-[#E9B15D]/70 animate-pulse" />
          <span>RECORD RETRIEVAL: SECURED</span>
        </div>
        <span className="font-mono tracking-widest text-[#E9B15D]/60">{credential || "N/A"}</span>
      </div>

      {/* Center Details */}
      <div className="relative flex-grow flex flex-col justify-center py-4">
        {/* Faint Background Radar Ring */}
        <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 border border-[#E9B15D]/[0.03] rounded-full flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 border border-[#E9B15D]/[0.02] border-dashed rounded-full animate-[spin_40s_linear_infinite]" />
        </div>

        <div className="relative z-10">
          <span className="text-[8px] text-[#E9B15D]/60 font-bold uppercase tracking-[0.2em] block mb-1">
            STELLAR CREDENTIAL LOG
          </span>
          <h4 className="text-sm sm:text-base md:text-lg font-bold text-white leading-snug tracking-tight font-sans text-glow">
            {title}
          </h4>
        </div>
      </div>

      {/* Footer Telemetry */}
      <div className="border-t border-white/5 pt-3 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[7px] text-white/30 uppercase tracking-[0.1em]">Verified Issuer</span>
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide">
            {company}
          </span>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] text-white/30 uppercase tracking-[0.1em]">Issued Date</span>
            <span className="text-[9px] font-bold text-[#E9B15D] tracking-wider">{issued}</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#E9B15D]/10 border border-[#E9B15D]/20 flex items-center justify-center text-[#E9B15D] shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Global CSS for holographic scan animation */}
      <style jsx global>{`
        @keyframes scanner {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scanner {
          animation: scanner 6s infinite linear;
        }
        .text-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
