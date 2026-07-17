"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CERTIFICATES_DATA } from "@/constants/certificates";
import CertificateCard from "./CertificateCard";
import ExpandedCertificate from "./ExpandedCertificate";

export default function InfiniteWorld({ speedMultiplierRef }) {
  const [selectedId, setSelectedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Viewport/Tab observers
  const [isInViewport, setIsInViewport] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);
  const containerRef = useRef(null);

  const providers = ["All", "Google", "Microsoft", "HP", "Tata"];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const filteredCertificates = useMemo(() => {
    return CERTIFICATES_DATA.filter((cert) => {
      return activeFilter === "All" || cert.issuer.toLowerCase() === activeFilter.toLowerCase();
    });
  }, [activeFilter]);

  // Reset activeIndex when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeFilter]);

  // Viewport Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Document Visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Synchronize background drift speed multiplier with container hover states
  useEffect(() => {
    if (!speedMultiplierRef) return;
    const targetMultiplier = (isHovered || selectedId !== null || !isTabActive || !isInViewport) ? 0 : 1;
    
    let animId;
    const updateSpeed = () => {
      speedMultiplierRef.current += (targetMultiplier - speedMultiplierRef.current) * 0.08;
      animId = requestAnimationFrame(updateSpeed);
    };
    animId = requestAnimationFrame(updateSpeed);
    return () => cancelAnimationFrame(animId);
  }, [isHovered, selectedId, isTabActive, isInViewport, speedMultiplierRef]);

  // Auto-play interval
  useEffect(() => {
    const N = filteredCertificates.length;
    if (N <= 1 || selectedId !== null || isHovered || !isTabActive || !isInViewport) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % N);
    }, 3000);

    return () => clearInterval(interval);
  }, [filteredCertificates, selectedId, isHovered, isTabActive, isInViewport]);

  // Escape key listener to close expanded cards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const N = filteredCertificates.length;

  // Staggered coordinate resolver (Framer Motion driven style targets)
  const getCardStyle = (idx) => {
    if (N === 0) return { x: 0, y: 0, scale: 0.5, opacity: 0, zIndex: 0, pointerEvents: "none" };

    let diff = idx - activeIndex;
    // Circular index wrap (infinite carousel loop logic)
    diff = ((diff + Math.floor(N / 2)) % N + N) % N - Math.floor(N / 2);

    // Hidden offscreen Left
    if (diff < -1) {
      return {
        x: "-180%",
        y: 0,
        scale: 0.6,
        opacity: 0,
        zIndex: 0,
        pointerEvents: "none"
      };
    }
    // Hidden offscreen Right
    if (diff > 1) {
      return {
        x: "180%",
        y: 0,
        scale: 0.6,
        opacity: 0,
        zIndex: 0,
        pointerEvents: "none"
      };
    }

    // Left card
    if (diff === -1) {
      const isEven = idx % 2 === 0;
      return {
        x: "-110%",
        y: isEven ? -45 : 45,
        scale: 0.75,
        opacity: 0.35,
        zIndex: 10,
        pointerEvents: "auto"
      };
    }

    // Right card
    if (diff === 1) {
      const isEven = idx % 2 === 0;
      return {
        x: "110%",
        y: isEven ? 45 : -45,
        scale: 0.75,
        opacity: 0.35,
        zIndex: 10,
        pointerEvents: "auto"
      };
    }

    // Center card (Spotlight Presentation State)
    return {
      x: "0%",
      y: 0,
      scale: 1.15,
      opacity: 1.0,
      zIndex: 30,
      pointerEvents: "auto"
    };
  };

  const handleCardClick = (idx, uniqueId) => {
    let diff = idx - activeIndex;
    diff = ((diff + Math.floor(N / 2)) % N + N) % N - Math.floor(N / 2);

    // Clicking left/right cards transitions them into center spotlight
    // Clicking the center spotlight card opens the details panel modal overlay
    if (diff === 0) {
      setSelectedId(uniqueId);
    } else {
      setActiveIndex(idx);
    }
  };

  const activeCert = CERTIFICATES_DATA.find((c) => c.id === selectedId?.split("__")[0]);

  const modalOverlay = (
    <AnimatePresence>
      {selectedId && activeCert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer pointer-events-auto"
          />
          {/* Detailed expanded card */}
          <ExpandedCertificate
            certificate={activeCert}
            layoutId={`card-container-${selectedId}`}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative w-full">
      {/* 1. Filter tabs menu */}
      <div className="flex flex-wrap items-center gap-2.5 mb-16 relative z-10 select-none max-w-7xl mx-auto px-6">
        {providers.map((provider) => (
          <button
            key={provider}
            onClick={() => setActiveFilter(provider)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
              activeFilter === provider
                ? "bg-[#E9B15D] text-[#120c08] shadow-[0_0_15px_rgba(233,177,93,0.25)]"
                : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {provider}
          </button>
        ))}
      </div>

      {/* 2. 3-Card Center-Focused Slider container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl mx-auto h-[380px] flex items-center justify-center overflow-visible select-none px-6"
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <div className="relative w-[320px] h-[220px]">
          {filteredCertificates.map((cert, idx) => {
            const style = getCardStyle(idx);
            const uniqueId = `${cert.id}__${idx}`;

            let diff = idx - activeIndex;
            diff = ((diff + Math.floor(N / 2)) % N + N) % N - Math.floor(N / 2);
            const isCentered = diff === 0;

            return (
              <motion.div
                key={uniqueId}
                initial={false}
                animate={{
                  x: style.x,
                  y: style.y,
                  scale: style.scale,
                  opacity: selectedId ? (selectedId === uniqueId ? 0 : 0.25) : style.opacity,
                  zIndex: style.zIndex
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 24,
                  mass: 0.8
                }}
                style={{
                  pointerEvents: selectedId ? "none" : style.pointerEvents,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  willChange: "transform, opacity"
                }}
              >
                <CertificateCard
                  certificate={{ ...cert, uniqueId }}
                  isCentered={isCentered}
                  onClick={() => handleCardClick(idx, uniqueId)}
                />
              </motion.div>
            );
          })}

          {N === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
              No certifications found matching this provider.
            </div>
          )}
        </div>
      </div>

      {/* 3. Render Modal Portal on document.body to bypass z-index clipping */}
      {mounted && typeof document !== "undefined" && createPortal(modalOverlay, document.body)}
    </div>
  );
}
