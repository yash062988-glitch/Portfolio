"use client";

import React from "react";

export default function ContactFooterWrapper({ children }) {
  return (
    <div className="relative w-full overflow-hidden bg-[#0b0705] bg-root-container">
      {/* Background Video and Cinematic Layering */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-layer-artwork-behind">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.22] brightness-[0.75] contrast-[0.90] pointer-events-none select-none"
        >
          <source src="/images/footer-video.webm" type="video/webm" />
        </video>

        {/* Top Fade: Seamless blend from preceding sections */}
        <div className="absolute inset-x-0 top-0 h-[250px] bg-gradient-to-b from-[#0b0705] to-transparent pointer-events-none bg-layer-overlay" />

        {/* Bottom Fade: Seamless blend at the page end */}
        <div className="absolute inset-x-0 bottom-0 h-[150px] bg-gradient-to-t from-[#0b0705] to-transparent pointer-events-none bg-layer-overlay" />

        {/* Dark Overlay for content readability */}
        <div className="absolute inset-0 bg-[#0b0705]/40 pointer-events-none bg-layer-overlay" />

        {/* Vignette: Atmospheric radial shadow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0b0705_95%)] opacity-85 pointer-events-none bg-layer-overlay" />
      </div>

      {/* Children content (Contact and Footer) */}
      <div className="relative z-10 w-full bg-layer-content">
        {children}
      </div>
    </div>
  );
}
