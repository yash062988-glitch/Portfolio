"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Compass, Cpu, Server, Laptop, Globe } from "lucide-react";

export default function GalacticArchive({ setIsPortalActive }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const hoverTimeoutRef = useRef(null);
  const navbarEnterTimeoutRef = useRef(null);
  const navbarExitTimeoutRef = useRef(null);

  // Trigger when a portal is hovered (fade out navbar after 200ms)
  const triggerNavbarFadeOut = () => {
    if (navbarExitTimeoutRef.current) clearTimeout(navbarExitTimeoutRef.current);
    navbarEnterTimeoutRef.current = setTimeout(() => {
      if (setIsPortalActive) setIsPortalActive(true);
    }, 200);
  };

  // Trigger when cursor leaves portals (fade in navbar after 150ms)
  const triggerNavbarFadeIn = () => {
    if (navbarEnterTimeoutRef.current) clearTimeout(navbarEnterTimeoutRef.current);
    navbarExitTimeoutRef.current = setTimeout(() => {
      if (setIsPortalActive) setIsPortalActive(false);
    }, 150);
  };

  const handleMouseEnter = (id) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPlanet(id);
      triggerNavbarFadeOut();
    }, 100); // 100ms hover intent delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPlanet(null);
      triggerNavbarFadeIn();
    }, 80); // Anti-flicker delay
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (navbarEnterTimeoutRef.current) clearTimeout(navbarEnterTimeoutRef.current);
      if (navbarExitTimeoutRef.current) clearTimeout(navbarExitTimeoutRef.current);
    };
  }, []);

  // 1. Scroll-based camera drift (Parallax)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Micro camera transitions (X: 0 -> 18px, Y: 0 -> -12px)
  const cameraX = useTransform(scrollYProgress, [0, 1], [-9, 9]);
  const cameraY = useTransform(scrollYProgress, [0, 1], [6, -6]);

  // Background and foreground parallax speeds
  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const fgParallaxY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  // Sector structural data (widely spaced safe-zone coordinates)
  const sectors = [
    {
      id: 1,
      num: "01",
      name: "Origin",
      title: "Origin Core",
      desc: "The beginning of my journey into software development, where curiosity became a passion for building digital experiences.",
      status: "ACTIVE DEVELOPMENT",
      x: 10,
      y: 12,
      camTranslate: { x: "-3px", y: "-3px" },
      image: "/images/origin_bg.png",
      color: "#e9b15d", // Golden orange
      icon: Laptop
    },
    {
      id: 2,
      num: "02",
      name: "Shagun Fashion",
      title: "Shagun Fashion",
      desc: "Premium uniform and apparel manufacturing portal. Complete brand identity and digital business transformation.",
      status: "COMPLETED",
      x: 12,
      y: 82,
      camTranslate: { x: "-3px", y: "3px" },
      image: "/images/shagun_fashion_bg.png",
      color: "#f59e0b", // Warm gold
      icon: Globe
    },
    {
      id: 3,
      num: "03",
      name: "ASEcoShine",
      title: "ASEcoShine",
      desc: "Premium product branding, luxury packaging layout, manufacturing systems, and semantic marketing platform.",
      status: "COMPLETED",
      x: 48,
      y: 18,
      camTranslate: { x: "0px", y: "-3px" },
      image: "/images/asecoshine_bg.png",
      color: "#06b6d4", // Teal / cyan
      icon: Cpu
    },
    {
      id: 4,
      num: "04",
      name: "HabitaAI",
      title: "HabitaAI",
      desc: "AI-powered architectural visualization using computer vision, generative intelligence, and interactive 3D landscapes.",
      status: "ACTIVE DEVELOPMENT",
      x: 45,
      y: 86,
      camTranslate: { x: "0px", y: "3px" },
      image: "/images/habita_ai_bg.png",
      color: "#3b82f6", // Electric blue
      icon: Server
    },
    {
      id: 5,
      num: "05",
      name: "Creative Lab",
      title: "Creative Lab",
      desc: "An experimental sandbox crafting high-fidelity user interfaces, custom shaders, physics, and fluid animations.",
      status: "ACTIVE DEVELOPMENT",
      x: 88,
      y: 58,
      camTranslate: { x: "3px", y: "1px" },
      image: "/images/creative_nebula_bg.png",
      color: "#a855f7", // Deep purple
      icon: Compass
    },
    {
      id: 6,
      num: "06",
      name: "Future Mission",
      title: "Future Mission",
      desc: "Researching artificial intelligence nodes, high-performance graphics programming, and distributed full stack engineering.",
      status: "ACTIVE DEVELOPMENT",
      x: 90,
      y: 12,
      camTranslate: { x: "3px", y: "-3px" },
      image: "/images/future_horizons_bg.png",
      color: "#e2e8f0", // Silver / white
      icon: Globe
    }
  ];

  // 2. Measure map boundaries
  useEffect(() => {
    if (!mapRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(mapRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Generate Bezier path curves
  const getCurvePath = (s1, s2, idx) => {
    if (dimensions.width === 0 || dimensions.height === 0) return "";
    const cx1 = dimensions.width * (s1.x / 100);
    const cy1 = dimensions.height * (s1.y / 100);
    const cx2 = dimensions.width * (s2.x / 100);
    const cy2 = dimensions.height * (s2.y / 100);

    const mx = (cx1 + cx2) / 2;
    const my = (cy1 + cy2) / 2;

    const isEven = idx % 2 === 0;
    const bendFactorX = isEven ? 25 : -25;
    const bendFactorY = isEven ? -45 : 45;

    return `M ${cx1} ${cy1} Q ${mx + bendFactorX} ${my + bendFactorY} ${cx2} ${cy2}`;
  };

  const activeSector = hoveredPlanet ? sectors.find(s => s.id === hoveredPlanet) : null;

  // Camera Lock-on vectors
  const mapScale = hoveredPlanet ? 1.03 : 1.0;
  const mapTranslateX = activeSector ? activeSector.camTranslate.x : "0px";
  const mapTranslateY = activeSector ? activeSector.camTranslate.y : "0px";

  return (
    <section
      id="galactic-archive"
      ref={containerRef}
      className="relative w-full h-[900px] lg:h-[950px] bg-transparent select-none overflow-hidden flex flex-col justify-between py-12 md:py-16 border-b border-white/5"
    >
      {/* Keyframe stylesheet injection for rotation, drift, and orbit */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanRotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbitParticle {
          0% { transform: rotate(0deg) translate(40px) rotate(0deg); }
          100% { transform: rotate(360deg) translate(40px) rotate(-360deg); }
        }
        @keyframes floatZeroG {
          0%, 100% { transform: translate(0px, 0px); }
          25% { transform: translate(2px, -3px); }
          50% { transform: translate(-1px, 2px); }
          75% { transform: translate(1.5px, 1.5px); }
        }
        @keyframes panBackdrop {
          0%, 100% { background-position: 50% 50%; }
          50% { background-position: 51.5% 48.5%; }
        }
        @keyframes driftFog {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-6px, 4px) scale(1.03); }
        }
        @keyframes pathPulse {
          0%, 100% { opacity: 0.18; stroke-width: 3.5px; }
          50% { opacity: 0.35; stroke-width: 5.5px; }
        }
        .animate-orbit-particle {
          animation: orbitParticle 10s linear infinite;
        }
        .animate-float-g {
          animation: floatZeroG 10s ease-in-out infinite;
        }
        .animate-path-pulse {
          animation: pathPulse 4s ease-in-out infinite;
        }
      `}} />

      {/* LAYER 1: Full-screen cinematic environment images (Concurrent crossfade) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black/60 pointer-events-none">
        <AnimatePresence>
          {activeSector && (
            <motion.div
              key={`bg-${activeSector.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Pan-enhanced high-fidelity background */}
              <motion.div
                initial={{ scale: 1.08 }}
                animate={{ scale: 1.00 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full origin-center"
                style={{
                  animation: "panBackdrop 25s ease-in-out infinite"
                }}
              >
                <Image
                  src={activeSector.image}
                  alt={activeSector.title}
                  fill
                  priority
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LAYER 2: Dark Cinematic Overlays (Top, bottom, vignettes, film grain) */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {/* Top shadow overlay */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/40 to-transparent opacity-80" />
        
        {/* Bottom shadow overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black via-black/75 to-transparent opacity-90" />
        
        {/* Vignette edge dimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.95)_95%)]" />

        {/* Dynamic Dark Cinematic Overlay for Text Readability */}
        <motion.div
          animate={{ opacity: hoveredPlanet ? 0.65 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-black pointer-events-none"
        />

        {/* Soft Film Grain */}
        <div className="absolute inset-0 bg-noise opacity-[0.015] pointer-events-none" />
      </div>

      {/* LAYER 3: Slow Moving Nebula Fog & Cosmic Dust */}
      <div className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-hidden">
        {/* Drifting Nebula */}
        <div
          className="absolute inset-[-10%] bg-[radial-gradient(circle_at_40%_45%,rgba(233,177,93,0.02)_0%,transparent_60%)] opacity-80"
          style={{ animation: "driftFog 28s ease-in-out infinite" }}
        />
        <div
          className="absolute inset-[-10%] bg-[radial-gradient(circle_at_70%_65%,rgba(168,85,247,0.015)_0%,transparent_55%)] opacity-80"
          style={{ animation: "driftFog 35s ease-in-out infinite" }}
        />

        {/* Foreground Starfield (Maintained above cinematic background at 12% opacity) */}
        <div className="absolute inset-0 opacity-12 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Slow floating cosmic dust particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute bg-white/20 rounded-full blur-[1px] pointer-events-none"
            style={{
              width: `${(i % 3) * 0.8 + 1.2}px`,
              height: `${(i % 3) * 0.8 + 1.2}px`,
              top: `${15 + (i * 9) % 70}%`,
              left: `${10 + (i * 12) % 80}%`,
              animation: `floatZeroG ${12 + i * 4}s ease-in-out infinite`,
              animationDelay: `${i * -1.5}s`
            }}
          />
        ))}
      </div>

      {/* Content wrapper */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-between py-8">
        
        {/* Header HUD System Readout */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)", y: 15 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center max-w-2xl mx-auto"
        >
          <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase select-none mb-2">
            SYSTEM LOG // NAV MODULE
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none uppercase">
            ORBITAL NEXUS
          </h2>
          <p className="text-white/60 text-xs font-light leading-relaxed mt-3">
            Explore the sectors of my journey.
          </p>
        </motion.div>

        {/* CENTERED GALAXY MAP */}
        <div className="flex-grow w-full flex items-center justify-center relative min-h-[450px]">
          <motion.div
            style={{ x: cameraX, y: cameraY }}
            ref={mapRef}
            // Dynamic HUD Opacity: 8% on hover for premium ghosted silhouette
            animate={{ 
              scale: mapScale,
              translateX: mapTranslateX,
              translateY: mapTranslateY,
              opacity: hoveredPlanet ? 0.08 : 1.0
            }}
            transition={{ 
              scale: { type: "spring", stiffness: 120, damping: 15 },
              translateX: { type: "spring", stiffness: 120, damping: 15 },
              translateY: { type: "spring", stiffness: 120, damping: 15 },
              opacity: { duration: 0.45, ease: "easeInOut" }
            }}
            className="relative w-full aspect-[4/3] max-w-[620px] bg-transparent"
          >
            {/* SVG Constellation Paths */}
            {dimensions.width > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                <defs>
                  <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(233,177,93,0.04)" />
                    <stop offset="50%" stopColor="rgba(233,177,93,0.3)" />
                    <stop offset="100%" stopColor="rgba(233,177,93,0.04)" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Draw connecting lines with reinforced readability details */}
                {sectors.slice(0, -1).map((s1, idx) => {
                  const s2 = sectors[idx + 1];
                  const pathStr = getCurvePath(s1, s2, idx);

                  return (
                    <g key={`route-${s1.id}`}>
                      {/* Luminous thick glowing path */}
                      <path
                        d={pathStr}
                        fill="none"
                        stroke="#E9B15D"
                        strokeWidth="5"
                        opacity="0.3"
                        filter="url(#glow)"
                        className="animate-path-pulse"
                      />
                      {/* Clean center stroke path */}
                      <path
                        id={`path-${idx}`}
                        d={pathStr}
                        fill="none"
                        stroke="rgba(233,177,93,0.45)"
                        strokeWidth="2"
                      />
                      {/* Traveling Particle Pulses */}
                      <circle r="2.2" fill="#FFFFFF" className="shadow-[0_0_8px_#FFFFFF]">
                        <animateMotion dur={`${10 + idx * 2}s`} repeatCount="indefinite">
                          <mpath href={`#path-${idx}`} />
                        </animateMotion>
                      </circle>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Transparent Portal Gateways */}
            {sectors.map((sector) => {
              return (
                <div
                  key={sector.id}
                  className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    left: `${sector.x}%`,
                    top: `${sector.y}%`,
                    zIndex: 10
                  }}
                  onMouseEnter={() => handleMouseEnter(sector.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Outer atmospheric glow */}
                  <div
                    className="absolute w-28 h-28 md:w-32 md:h-32 rounded-full pointer-events-none z-0 opacity-25"
                    style={{
                      background: `radial-gradient(circle, ${sector.color}25 0%, transparent 70%)`
                    }}
                  />

                  {/* Portal ring construction (concentric transparent elements) */}
                  {/* Subtle float animation applied (3-6px over 10s) */}
                  <div className="animate-float-g relative cursor-pointer z-10 flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                    
                    {/* Glass refraction outer ring */}
                    <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.01] backdrop-blur-[2px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_0_18px_rgba(255,255,255,0.02)]" />

                    {/* Rotating scanner ring */}
                    <div
                      style={{
                        animation: `scanRotation 10s linear infinite`
                      }}
                      className="absolute inset-[-4px] rounded-full border border-dashed pointer-events-none transition-all duration-500 border-white/12"
                    />

                    {/* Tiny orbiting energy particle */}
                    <div className="absolute w-16 h-16 rounded-full pointer-events-none z-0 flex items-center justify-center">
                      <div
                        className="absolute w-1.5 h-1.5 rounded-full shadow-sm animate-orbit-particle"
                        style={{
                          backgroundColor: sector.color,
                          boxShadow: `0 0 8px ${sector.color}`
                        }}
                      />
                    </div>

                    {/* Circular Project Thumbnail (Focal Point) */}
                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden object-cover border border-white/20 z-10 relative shadow-inner bg-black/40">
                      <Image
                        src={sector.image}
                        alt={sector.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>

                    {/* Number and Name label tags (Monospaced above, uppercase title below) */}
                    <div className="absolute top-full flex flex-col items-center pointer-events-none whitespace-nowrap mt-1.5 opacity-80">
                      <span className="text-[7.5px] font-mono text-primary/75 tracking-wider leading-none">
                        {sector.num}
                      </span>
                      <span className="text-[9px] text-white/90 uppercase tracking-widest leading-none font-bold mt-1">
                        {sector.name}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* TYPOGRAPHY: Cinematic Mission Briefing Corner Layout */}
        <div className="relative h-32 w-full">
          <AnimatePresence>
            {activeSector && (
              <motion.div
                key={`briefing-${activeSector.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className={`absolute z-30 flex flex-col gap-2.5 max-w-sm md:max-w-md ${
                  activeSector.id % 2 !== 0
                    ? "bottom-0 right-0 text-right items-end"
                    : "bottom-0 left-0 text-left items-start"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] uppercase font-bold tracking-[0.25em] text-white/35 leading-none">
                    PROJECT
                  </span>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight leading-normal uppercase">
                    {activeSector.title}
                  </h3>
                </div>

                <div
                  className="w-10 h-[1.5px] rounded-full"
                  style={{ backgroundColor: activeSector.color }}
                />

                <p className="text-white/70 text-xs font-light leading-relaxed mt-0.5 max-w-xs md:max-w-sm">
                  {activeSector.desc}
                </p>

                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[7.5px] uppercase font-bold tracking-[0.2em] text-white/25 leading-none">
                    STATUS
                  </span>
                  <span className="text-[9.5px] uppercase font-extrabold tracking-wider leading-none text-primary">
                    {activeSector.status}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
