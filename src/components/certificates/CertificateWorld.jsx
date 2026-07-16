"use client";

import React, { useRef } from "react";
import CertificatesThreeBg from "./CertificatesThreeBg";
import InfiniteWorld from "./InfiniteWorld";

export default function CertificateWorld() {
  const speedMultiplierRef = useRef(1.0);

  return (
    <div className="relative w-full overflow-hidden min-h-[460px]">
      {/* Background space canvas (stars & orbits synchronized with card speed multiplier) */}
      <CertificatesThreeBg speedMultiplierRef={speedMultiplierRef} />

      {/* Interactive cards floating coordinate space */}
      <div className="relative z-10 w-full">
        <InfiniteWorld speedMultiplierRef={speedMultiplierRef} />
      </div>
    </div>
  );
}
