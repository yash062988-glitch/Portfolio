"use client";

import React from "react";
import SmokyMeshText from "@/components/design-system/SmokyMeshText";
import CertificateWorld from "@/components/certificates/CertificateWorld";

export default function Certifications() {
  return (
    <section id="certifications" className="relative w-full py-28 md:py-32 bg-transparent overflow-hidden">
      {/* Container for Header only, keeping it aligned with page grids */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mb-2">
        
        {/* Section Header */}
        <div className="flex flex-col gap-4 max-w-2xl select-none">
          <span className="text-xs font-bold tracking-[0.25em] text-primary uppercase">
            Mission Log
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-none flex flex-wrap gap-x-4">
            <SmokyMeshText text="Professional" className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none font-sans" as="span" />
            <SmokyMeshText text="Certifications" className="text-4xl md:text-5xl font-bold text-primary tracking-tight leading-none font-sans" color="var(--accent-primary)" as="span" />
          </h2>
          <p className="text-white/70 text-sm md:text-base font-light leading-relaxed">
            Verified milestones across AI, web development, cloud technologies, and software engineering.
          </p>
        </div>
      </div>

      {/* Edge-to-Edge Infinite Floating Coordinate Space */}
      <div className="relative z-10 w-full">
        <CertificateWorld />
      </div>
    </section>
  );
}
