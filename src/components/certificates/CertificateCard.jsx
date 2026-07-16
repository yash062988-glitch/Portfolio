"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Award } from "lucide-react";

const IssuerLogo = ({ issuer }) => {
  const normalized = String(issuer).toLowerCase();
  if (normalized.includes("google")) {
    return (
      <svg className="w-5 h-5 text-[#E9B15D]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 5.92 1 12 5.92 1 12s4.92 11 11.24 11c6.6 0 11-4.65 11-11.2 0-.756-.08-1.333-.178-1.815H12.24z"/>
      </svg>
    );
  }
  if (normalized.includes("microsoft")) {
    return (
      <svg className="w-4.5 h-4.5 text-[#E9B15D]" viewBox="0 0 23 23" fill="currentColor">
        <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z"/>
      </svg>
    );
  }
  if (normalized.includes("hp")) {
    return (
      <span className="text-sm font-sans font-black text-[#E9B15D] tracking-tight leading-none">hp</span>
    );
  }
  if (normalized.includes("tata") || normalized.includes("tcs")) {
    return (
      <span className="text-[10px] font-mono font-bold text-[#E9B15D] tracking-tight leading-none">TATA</span>
    );
  }
  return <Award className="w-4 h-4 text-[#E9B15D]" />;
};

export default function CertificateCard({ certificate, onClick }) {
  const { title, issuer, issued, company } = certificate;

  return (
    <motion.button
      layoutId={`card-container-${certificate.uniqueId}`}
      onClick={onClick}
      style={{ originX: 0.5, originY: 0.5 }}
      whileHover={{
        y: -12,
        scale: 1.04,
        transition: { duration: 0.25, ease: "easeOut" }
      }}
      className="group relative w-full h-full p-6 sm:p-7 rounded-[30px] border border-[#E9B15D]/15 bg-[#121214]/75 backdrop-blur-[18px] text-left flex flex-col justify-between transition-all duration-300 hover:border-[#E9B15D]/45 hover:shadow-[0_20px_50px_rgba(233,177,93,0.12)] cursor-pointer outline-none overflow-hidden select-none"
    >
      {/* Background Sweeping Reflection */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out z-0 pointer-events-none" />

      {/* Background Radial Light Glow on Hover */}
      <div className="absolute top-[-50px] right-[-50px] w-36 h-36 rounded-full bg-[radial-gradient(circle,rgba(233,177,93,0.04)_0%,transparent_70%)] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

      {/* Orbit Rings Backdrop (Micro-Space Design Element) */}
      <div className="absolute bottom-[-10px] right-[-10px] w-24 h-24 border border-[#E9B15D]/[0.02] rounded-full flex items-center justify-center pointer-events-none z-0">
        <div className="w-16 h-16 border border-[#E9B15D]/[0.015] border-dashed rounded-full group-hover:rotate-[45deg] transition-transform duration-1000 ease-out" />
      </div>

      {/* Card Header */}
      <div className="relative z-10 w-full flex items-center justify-between gap-4 mb-4">
        {/* Issuer Logo Capsule */}
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E9B15D]/5 border border-[#E9B15D]/15 shadow-inner">
          <IssuerLogo issuer={issuer} />
        </div>
        {/* Verified Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 select-none">
          <ShieldCheck className="w-3 h-3 flex-shrink-0" />
          <span className="text-[8px] uppercase tracking-wider font-mono font-bold">Verified</span>
        </div>
      </div>

      {/* Card Body (Title) */}
      <div className="relative z-10 flex-grow flex items-center mb-6">
        <h4 className="text-[13px] sm:text-[14px] font-bold text-white leading-snug tracking-tight font-sans group-hover:text-[#E9B15D] transition-colors duration-300">
          {title}
        </h4>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 pt-3.5 border-t border-white/[0.03] flex items-center justify-between text-[9px] font-mono tracking-wide text-white/40">
        <span className="uppercase tracking-wider">Issued: {issued}</span>
        <span className="uppercase text-right truncate max-w-[130px] font-semibold text-white/50">{company}</span>
      </div>
    </motion.button>
  );
}
