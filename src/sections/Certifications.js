"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ExternalLink, ShieldCheck, Calendar } from "lucide-react";
import { CERTIFICATIONS_DATA } from "@/constants/data";

export default function Certifications() {
  const [activeFilter, setActiveFilter] = useState("All");
  
  const providers = ["All", "Google Cloud", "Meta", "IBM"];

  const filteredCertifications = CERTIFICATIONS_DATA.filter((cert) => {
    return activeFilter === "All" || cert.provider.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <section id="certifications" className="relative w-full py-28 md:py-32 bg-transparent overflow-hidden">
      {/* Background ambient radial glow: Minimal gold glow */}
      <div className="absolute inset-0 bg-spotlight-certifications pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] rounded-full bg-[radial-gradient(circle,rgba(233,177,93,0.03)_0%,transparent_70%)] blur-[95px] pointer-events-none z-0" />

      {/* Noise layer */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        
        {/* Standardized Section Header */}
        <div className="flex flex-col gap-4 mb-16 max-w-2xl">
          <span className="text-xs font-bold tracking-[0.25em] text-primary uppercase">
            CERTIFICATIONS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Certifications
          </h2>
          <p className="text-white/72 text-base md:text-lg font-light leading-relaxed">
            Professional specializations and technical credentials issued by industry-leading organizations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 mb-12">
          {providers.map((provider) => (
            <button
              key={provider}
              onClick={() => setActiveFilter(provider)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                activeFilter === provider
                  ? "bg-primary text-[#120c08] shadow-[0_0_15px_rgba(233,177,93,0.25)]"
                  : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {provider}
            </button>
          ))}
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCertifications.map((cert) => (
              <motion.div
                layout
                key={cert.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-6 md:p-8 rounded-[24px] border border-white/10 bg-white/[0.02] backdrop-blur-md hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(233,177,93,0.06)] flex flex-col justify-between min-h-[260px] transition-all duration-500"
              >
                {/* Background glow spot on card hover */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full radial-sunset-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Card Top */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    {/* Stylized Logo Badge */}
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-base tracking-wider shadow-sm">
                      {cert.logoText}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider text-white/40">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
                      Verified
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-snug tracking-tight group-hover:text-primary transition-colors duration-300">
                    {cert.title}
                  </h3>
                  
                  <span className="text-white/60 text-xs md:text-sm block mb-4">
                    Issued by {cert.provider}
                  </span>
                </div>

                {/* Card Bottom */}
                <div className="pt-4 border-t border-white/5 flex flex-col gap-3 relative z-10">
                  <div className="flex items-center justify-between text-[11px] text-white/40 font-medium">
                    <span className="flex items-center gap-1.5 font-light">
                      <Calendar className="w-3.5 h-3.5" />
                      {cert.date}
                    </span>
                    <span className="font-mono">
                      ID: {cert.credentialId}
                    </span>
                  </div>

                  <button
                    onClick={() => window.open(cert.link, "_blank")}
                    className="w-full h-11 mt-2 flex items-center justify-center gap-1.5 rounded-full border border-white/10 hover:border-primary/45 bg-white/[0.03] text-xs font-bold text-white hover:text-primary hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    View Certificate
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCertifications.length === 0 && (
          <div className="w-full text-center py-16">
            <p className="text-white/40 text-lg">No certifications match the provider filter.</p>
          </div>
        )}

      </div>
    </section>
  );
}
