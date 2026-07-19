"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, ShieldCheck } from "lucide-react";
import CertificatePreview from "./CertificatePreview";

export default function ExpandedCertificate({ certificate, layoutId, onClose }) {
  const { title, issuer, issued, pdfUrl, company, skills, description, credential } = certificate;

  return (
    <motion.div
      layoutId={layoutId}
      className="fixed inset-x-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 max-w-4xl w-[calc(100%-48px)] p-6 sm:p-8 rounded-[30px] border bg-[#121214]/95 backdrop-blur-[24px] shadow-[0_30px_80px_rgba(0,0,0,0.85)] z-[95] overflow-y-auto flex flex-col md:flex-row gap-8 justify-between select-none"
      style={{
        top: "50%",
        y: "-50%",
        maxHeight: "90vh",
        borderColor: "rgba(var(--accent-glow-raw), 0.45)"
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm z-[95] hover:text-primary"
        style={{
          borderColor: "rgba(255, 255, 255, 0.1)"
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

      {/* Left Column: Holographic preview */}
      <div className="w-full md:w-[45%] flex flex-col gap-4 justify-center">
        <CertificatePreview certificate={certificate} />
      </div>

      {/* Right Column: Content Details */}
      <div className="w-full md:w-[55%] flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-4">
          {/* Tag and Verified label */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded leading-none" style={{ color: "var(--accent-primary)", backgroundColor: "rgba(var(--accent-glow-raw), 0.05)", border: "1px solid rgba(var(--accent-glow-raw), 0.2)" }}>
              {issuer} Mapped
            </span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[9px] uppercase tracking-wider font-mono font-bold">Authenticated</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug font-sans">
            {title}
          </h3>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-white/5 text-[11px] font-mono tracking-wide text-white/50">
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-[0.1em] block mb-0.5">Partner Institution</span>
              <span className="text-white/80 font-sans font-medium">{company}</span>
            </div>
            <div>
              <span className="text-[8px] text-white/30 uppercase tracking-[0.1em] block mb-0.5">Verification Date</span>
              <span className="text-white/80 font-sans font-medium">{issued}</span>
            </div>
            {credential && (
              <div className="col-span-2">
                <span className="text-[8px] text-white/30 uppercase tracking-[0.1em] block mb-0.5">Credential Log ID</span>
                <span className="font-mono font-semibold" style={{ color: "var(--accent-primary)" }}>{credential}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-white/70 text-xs md:text-sm font-light leading-relaxed font-sans">
            {description}
          </p>

          {/* Skills Learned */}
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.1em] block">
              Core Skills Acquired
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[9px] font-bold uppercase tracking-wider bg-white/[0.02] border border-white/10 px-2.5 py-1 rounded-md text-white/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <button
            onClick={() => window.open(pdfUrl, "_blank")}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-[#FAF5EF] text-xs font-semibold font-space-grotesk text-[#120c08] transition-all duration-300 cursor-pointer"
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
            View Certificate
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
