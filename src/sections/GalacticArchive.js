"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion, useMotionValueEvent, animate } from "framer-motion";
import { Quaternion, Euler } from "three";
import SmokyMeshText from "@/components/design-system/SmokyMeshText";

// Sub-component for individual premium luxury holographic navigation beacons
function PlanetNode({ sector, isHovered, hoveredPlanet, shipProgress, onMouseEnter, onMouseLeave }) {
  const shouldReduceMotion = useReducedMotion();

  // Randomize floating & breathing durations per node so they animate independently
  const breathingDuration = useMemo(() => 4.5 + Math.random() * 1.5, []);

  // Orbiting satellites parameters
  const satelliteRotation1 = "spinClockwise 12s linear infinite";
  const satelliteRotation2 = "spinCounterClockwise 18s linear infinite";

  // Proximity to spaceship calculation (executed on Framer Motion's GPU thread)
  const nodeProgress = (sector.id - 1) / 4;
  const arrivalActive = useTransform(shipProgress, (val) => {
    const dist = Math.abs(val - nodeProgress);
    return dist < 0.05 ? 1 : 0;
  });

  // Proximity animations
  const arrivalScaleBoost = useTransform(arrivalActive, [0, 1], [1, 1.08]);
  const arrivalGlowBoost = useTransform(arrivalActive, [0, 1], [0.15, 0.45]);

  // Compute scale and dimming opacity when another portal is hovered
  const finalScale = isHovered ? sector.baseScale * 1.06 : sector.baseScale;
  const targetOpacity = isHovered
    ? 1.0
    : (hoveredPlanet && hoveredPlanet !== sector.id ? 0.25 : sector.baseOpacity);

  return (
    <div
      className={`absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group pointer-events-auto transition-all duration-500 ${sector.blurClass}`}
      style={{
        left: `${sector.x}%`,
        top: `${sector.y}%`,
        zIndex: isHovered ? 60 : sector.depthZ
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Volumetric node glow matching accent color */}
      <motion.div
        className="absolute w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full pointer-events-none z-0 blur-2xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${sector.color} 0%, transparent 70%)`,
          opacity: isHovered ? 0.65 : arrivalGlowBoost
        }}
      />

      {/* Expanding energy ripple on ship arrival */}
      {!shouldReduceMotion && (
        <motion.div
          style={{
            scale: useTransform(arrivalActive, [0, 1], [0.8, 1.35]),
            opacity: useTransform(arrivalActive, [0, 1], [0, 0.55]),
            borderColor: sector.color
          }}
          className="absolute rounded-full border border-dashed pointer-events-none w-36 h-36 sm:w-42 sm:h-42 md:w-48 md:h-48"
        />
      )}

      {/* Transparent HUD intersecting guide circle */}
      <div
        className={`absolute rounded-full border border-dashed pointer-events-none transition-all duration-700 ${isHovered ? "w-44 h-44 opacity-45 border-primary" : "w-32 h-32 opacity-12 border-white/40"
          }`}
      />

      {/* Two miniature orbiting satellites at distinct speeds and radii (Responsive percentage-based widths) */}
      {!shouldReduceMotion && (
        <>
          {/* Satellite A (Inner) */}
          <div
            style={{
              animation: satelliteRotation1,
            }}
            className="absolute w-[135%] h-[135%] pointer-events-none z-0 flex items-center justify-start animate-float-g"
          >
            <div
              className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor]"
              style={{
                backgroundColor: sector.color,
                transform: "translateX(-2px)"
              }}
            />
          </div>
          {/* Satellite B (Outer) */}
          <div
            style={{
              animation: satelliteRotation2,
            }}
            className="absolute w-[165%] h-[165%] pointer-events-none z-0 flex items-center justify-end"
          >
            <div
              className="w-1 h-1 rounded-full bg-white/80 shadow-[0_0_6px_#ffffff]"
              style={{
                transform: "translateX(3px)"
              }}
            />
          </div>
        </>
      )}

      {/* Interactive animated beacon body */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
              scale: finalScale,
              y: isHovered ? -8 : 0,
              opacity: targetOpacity
            }
        }
        style={{
          scale: isHovered ? undefined : arrivalScaleBoost
        }}
        transition={
          isHovered
            ? { type: "spring", stiffness: 350, damping: 18 }
            : { repeat: Infinity, duration: breathingDuration, ease: "easeInOut" }
        }
        className="relative cursor-pointer z-10 flex items-center justify-center w-28 h-28 sm:w-34 sm:h-34 md:w-42 md:h-42 lg:w-48 lg:h-48"
      >
        {/* Floating coordinate sector number identifier */}
        <div
          className={`absolute -top-1.5 -right-1.5 z-30 pointer-events-none px-2 py-0.5 rounded text-[8.5px] font-mono tracking-widest border transition-all duration-500 bg-[#0d0908]/95 ${isHovered
            ? "text-primary border-primary/50 shadow-[0_0_12px_var(--accent-glow)]"
            : "text-white/45 border-white/10"
            }`}
        >
          {sector.num}
        </div>

        {/* Outer glass refraction ring */}
        <div
          className={`absolute inset-0 rounded-full border transition-all duration-700 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-[4px] ${isHovered
            ? "border-primary/60 shadow-[inset_0_1px_4px_var(--accent-glow),0_16px_36px_rgba(0,0,0,0.75)]"
            : "border-white/15 shadow-[inset_0_1px_3px_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.55)]"
            }`}
        />

        {/* Rotating outer segmented HUD ring */}
        <div
          style={{ transform: "translateZ(15px)" }}
          className={`absolute inset-[-10px] rounded-full pointer-events-none transition-all duration-700 ${isHovered
            ? "animate-spin-fast opacity-95 scale-105"
            : "animate-spin-slow opacity-40"
            }`}
        >
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              stroke={isHovered ? sector.color : "rgba(255,255,255,0.25)"}
              strokeWidth="1.5"
              strokeDasharray="16 12 4 12 28 12"
              className="transition-colors duration-500"
            />
          </svg>
        </div>

        {/* Rotating middle segmented HUD ring */}
        <div
          className={`absolute inset-[3px] rounded-full pointer-events-none transition-all duration-700 ${isHovered
            ? "animate-spin-reverse-fast opacity-85"
            : "animate-spin-reverse-slow opacity-25"
            }`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isHovered ? sector.color : "rgba(255,255,255,0.18)"}
              strokeWidth="0.85"
              strokeDasharray="10 14 3 14"
            />
          </svg>
        </div>

        {/* Emissive energy ring */}
        <div
          className={`absolute inset-[10px] rounded-full border transition-all duration-700 pointer-events-none z-10 ${isHovered ? "border-primary/40 scale-102" : "border-white/5"
            }`}
          style={{
            boxShadow: isHovered ? `0 0 16px ${sector.color}35` : "none"
          }}
        />

        {/* Circular Project Thumbnail (Focal Point / Glass Sphere) */}
        <div className="w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 lg:w-28 lg:h-28 rounded-full overflow-hidden object-cover border border-white/25 z-10 relative bg-black/50 shadow-inner">
          <Image
            src={sector.image}
            alt={sector.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {/* Ambient tint overlay */}
          <div className={`absolute inset-0 transition-colors duration-500 ${isHovered ? "bg-transparent" : "bg-black/30"
            }`} />

          {/* Premium diagonal reflection sheen sweep */}
          <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none z-20">
            <div className="absolute top-0 w-[60%] h-full bg-gradient-to-r from-transparent via-white/18 to-transparent skew-x-12 animate-reflection" />
          </div>
        </div>

        {/* Node Name Label Beneath */}
        <div className="absolute top-[106%] flex flex-col items-center pointer-events-none whitespace-nowrap transition-all duration-500">
          <span
            className={`text-[10px] uppercase font-extrabold tracking-[0.25em] transition-colors duration-500 ${isHovered ? "text-primary" : "text-white/80"
              }`}
            style={{
              textShadow: isHovered ? "0 0 12px var(--accent-glow)" : "none"
            }}
          >
            {sector.name}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default function GalacticArchive({ setIsPortalActive }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pathRef = useRef(null);
  const shipRef = useRef(null);
  const completedPathRef = useRef(null);

  // Bidirectional ping-pong variables
  const progressRef = useRef(0);
  const directionRef = useRef(1);
  const lastRawProgressRef = useRef(0);

  // Quaternion slerp orientation helpers
  const currentQRef = useRef(null);
  const targetQRef = useRef(null);
  const tempEulerRef = useRef(null);

  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const hoverTimeoutRef = useRef(null);
  const navbarEnterTimeoutRef = useRef(null);
  const navbarExitTimeoutRef = useRef(null);

  // Smooth springs to interpolate interactive mouse/parallax offsets
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 90, damping: 22, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Mouse Parallax values (Maximum translation: ±20px, rotation: ±3°)
  const mouseTranslateX = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const mouseTranslateY = useTransform(smoothMouseY, [-1, 1], [-20, 20]);
  const mouseRotateX = useTransform(smoothMouseY, [-1, 1], [3, -3]);
  const mouseRotateY = useTransform(smoothMouseX, [-1, 1], [-3, 3]);

  const triggerNavbarFadeOut = () => {
    if (navbarExitTimeoutRef.current) clearTimeout(navbarExitTimeoutRef.current);
    navbarEnterTimeoutRef.current = setTimeout(() => {
      if (setIsPortalActive) setIsPortalActive(true);
    }, 200);
  };

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
    }, 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPlanet(null);
      triggerNavbarFadeIn();
    }, 80);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleContainerMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    handleMouseLeave();
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (navbarEnterTimeoutRef.current) clearTimeout(navbarEnterTimeoutRef.current);
      if (navbarExitTimeoutRef.current) clearTimeout(navbarExitTimeoutRef.current);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const shipProgress = useMotionValue(0);

  // Automatic looping animation of the spaceship over time (linear progress timer)
  useEffect(() => {
    const controls = animate(shipProgress, 1, {
      duration: 24, // 24 seconds for a complete loop (12s forward, 12s back)
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop"
    });
    return () => controls.stop();
  }, [shipProgress]);

  // Symmetrical forward progress for sector glows
  const forwardProgress = useMotionValue(0);

  // Parallax layers transform speeds
  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const fgParallaxY = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const cameraX = useTransform(scrollYProgress, [0, 1], [-12, 12]);
  const cameraY = useTransform(scrollYProgress, [0, 1], [8, -8]);

  // Premium, 5-Node Constellation Journey Navigation Sector List (Alternating above/below axis, 90% wide)
  const sectors = [
    {
      id: 1,
      num: "01",
      name: "Genesis Sector",
      title: "Genesis Core",
      subtitle: "Where everything began.",
      desc: "Curiosity initialized. Discovering computer architecture, writing my first lines of code, and discovering a lifelong passion for designing digital logic.",
      status: "ACTIVE DEVELOPMENT",
      x: 5,
      y: 24,
      camTranslate: { x: "-2px", y: "2px" },
      image: "/images/origin_bg.png",
      color: "#d97706", // Warm Gold
      baseScale: 1.05,
      baseOpacity: 0.9,
      depthZ: 18,
      blurClass: "blur-0",
      glowIntensity: "opacity-25",
      represents: ["Curiosity", "First Computer", "First Line of Code", "Love for Technology"]
    },
    {
      id: 2,
      num: "02",
      name: "Current Orbit",
      title: "Current Orbit",
      subtitle: "Where I am today.",
      desc: "Navigating full stack systems, crafting high-performance creative user interfaces, building custom shader components, and integrating generative AI engines.",
      status: "COMPLETED",
      x: 28,
      y: 74,
      camTranslate: { x: "-2.5px", y: "3px" },
      image: "/images/habita_ai_bg.png",
      color: "#3b82f6", // Electric Blue
      baseScale: 0.85,
      baseOpacity: 0.65,
      depthZ: 10,
      blurClass: "blur-[0.8px]",
      glowIntensity: "opacity-10",
      represents: ["Web Development", "UI / UX", "Artificial Intelligence", "Machine Learning", "Data Analysis", "Creative Design"]
    },
    {
      id: 3,
      num: "03",
      name: "Construction Zone",
      title: "Construction Zone",
      subtitle: "Currently Building.",
      desc: "Architecting interactive frameworks, experimenting with real-time web-graphics pipelines, and writing AI-agent driven workspace environments.",
      status: "ACTIVE DEVELOPMENT",
      x: 52,
      y: 26,
      camTranslate: { x: "2.5px", y: "3px" },
      image: "/images/creative_nebula_bg.png",
      color: "#a855f7", // Premium Purple
      baseScale: 1.15,
      baseOpacity: 0.98,
      depthZ: 25,
      blurClass: "blur-0",
      glowIntensity: "opacity-35",
      represents: ["Premium Websites", "AI Experiences", "Interactive Interfaces", "Learning New Technologies", "Creative Experiments"]
    },
    {
      id: 4,
      num: "04",
      name: "Launch Sequence",
      title: "Launch Sequence",
      subtitle: "Preparing For What's Next.",
      desc: "Deploying high-performance SaaS environments, preparing public open-source developer tool pipelines, and building autonomous agent solutions.",
      status: "ACTIVE DEVELOPMENT",
      x: 76,
      y: 76,
      camTranslate: { x: "3px", y: "-2.5px" },
      image: "/images/current_mission_bg.png",
      color: "#ea580c", // Orange
      baseScale: 0.95,
      baseOpacity: 0.8,
      depthZ: 14,
      blurClass: "blur-[0.4px]",
      glowIntensity: "opacity-20",
      represents: ["Freelancing", "SaaS Products", "Open Source", "AI Products", "Startup Ideas"]
    },
    {
      id: 5,
      num: "05",
      name: "Beyond Horizon",
      title: "Beyond Horizon",
      subtitle: "The Future I'm Working Towards.",
      desc: "Building scalable technology ecosystems used by millions globally, founding innovative AI startups, and defining state-of-the-art interactive platforms.",
      status: "ACTIVE DEVELOPMENT",
      x: 95,
      y: 38,
      camTranslate: { x: "4px", y: "-3px" },
      image: "/images/future_horizons_bg.png",
      color: "#06b6d4", // Cyan
      baseScale: 1.1,
      baseOpacity: 0.95,
      depthZ: 22,
      blurClass: "blur-0",
      glowIntensity: "opacity-30",
      represents: ["Building Scalable SaaS", "AI Research Startup", "World-Class UX Design", "Global Innovation", "Long-Term Vision"]
    }
  ];

  // Spaceship scroll-driven translation and tangent calculation
  useMotionValueEvent(shipProgress, "change", (progressVal) => {
    const path = pathRef.current;
    const ship = shipRef.current;
    if (!path || !ship) return;

    try {
      const totalLength = path.getTotalLength();
      if (totalLength === 0) return;

      // 1. Frame stability: Initialize static Three.js mutable math helpers in refs
      if (!currentQRef.current) {
        currentQRef.current = new Quaternion();
        targetQRef.current = new Quaternion();
        tempEulerRef.current = new Euler();
      }

      // 2. Symmetrical travel progress & direction accumulator (Handling linear timer loops)
      let delta = progressVal - lastRawProgressRef.current;
      if (delta < -0.5) {
        delta += 1; // loop wrapped around from 1 to 0
      } else if (delta > 0.5) {
        delta -= 1;
      }
      lastRawProgressRef.current = progressVal;

      progressRef.current += delta * directionRef.current;

      // Boundary ping-pong reversal
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        directionRef.current = -1;
      } else if (progressRef.current <= 0) {
        progressRef.current = 0;
        directionRef.current = 1;
      }

      const t = progressRef.current;
      const isForward = directionRef.current === 1;

      // Update forward progress for planet sector arrival glows
      forwardProgress.set(t);

      const currentLength = t * totalLength;
      const point = path.getPointAtLength(currentLength);

      // 3. Tangent vector calculation purely on horizontal movement
      const sampleDelta = 1;
      const nextLength = isForward
        ? Math.min(totalLength, currentLength + sampleDelta)
        : Math.max(0, currentLength - sampleDelta);
      const nextPoint = path.getPointAtLength(nextLength);

      // Horizontal travel direction (ignoring travelY for flat visual orientation)
      const travelX = isForward ? nextPoint.x - point.x : point.x - nextPoint.x;

      // Target Y-rotation: 0 rad (facing right) or PI rad (facing left)
      const targetYAngle = travelX >= 0 ? 0 : Math.PI;

      // 4. Orientation: Quaternion slerp for smooth Y-axis rotation (Yaw only, pitch = 0, roll = 0)
      const targetEuler = tempEulerRef.current.set(0, targetYAngle, 0);
      targetQRef.current.setFromEuler(targetEuler);

      // Copy target directly on first frame to prevent starting spin, slerp thereafter
      if (currentQRef.current.lengthSq() === 0) {
        currentQRef.current.copy(targetQRef.current);
      } else {
        currentQRef.current.slerp(targetQRef.current, 0.12);
      }

      tempEulerRef.current.setFromQuaternion(currentQRef.current);
      const renderYRotation = tempEulerRef.current.y * (180 / Math.PI);

      // 5. Natural hover motion using continuous time bobbing and drift
      const time = performance.now() * 0.0025;
      const hoverX = Math.cos(time * 0.7) * 2; // subtle horizontal drift
      const hoverY = Math.sin(time * 1.1) * 3.5; // gentle vertical bobbing

      // Position and rotate the HTML spaceship element in DOM (60 FPS bypass)
      // Keeps pitch (X) and roll (Z) at 0, applying only Yaw (Y) rotation and hover offsets
      ship.style.transform = `translate3d(${point.x + hoverX}px, ${point.y + hoverY}px, 0) translate(-50%, -50%) rotateY(${renderYRotation}deg)`;

      // 5. Update completed path glow symmetrically in both directions
      if (completedPathRef.current) {
        completedPathRef.current.style.strokeDashoffset = (1 - t) * 1000;
        completedPathRef.current.style.opacity = 0.75; // Always show progress glow trail
      }

      // 6. Dynamic planet occlusion z-index calculation
      let currentOccludingPlanet = null;
      for (const sector of sectors) {
        const planetX = (sector.x / 100) * dimensions.width;
        const planetY = (sector.y / 100) * dimensions.height;

        const dx = point.x - planetX;
        const dy = point.y - planetY;
        const dist = Math.hypot(dx, dy);

        // Responsive radius threshold based on window width
        let planetRadius = 56;
        if (window.innerWidth >= 1024) planetRadius = 96; // lg
        else if (window.innerWidth >= 768) planetRadius = 84;  // md
        else if (window.innerWidth >= 640) planetRadius = 68;  // sm

        if (dist < planetRadius) {
          currentOccludingPlanet = sector;
          break;
        }
      }

      // Symmetrically apply z-index layering
      if (currentOccludingPlanet) {
        const planetZ = (hoveredPlanet === currentOccludingPlanet.id) ? 60 : currentOccludingPlanet.depthZ;
        ship.style.zIndex = planetZ - 1;
      } else {
        // Foreground layering outside planets
        ship.style.zIndex = 40;
      }

    } catch (err) {
      // Graceful error handling for layout transitions
    }
  });

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

  // Continuous Bezier path connecting the 5 nodes in left-to-right chronological order
  const getCurvePath = () => {
    if (dimensions.width === 0 || dimensions.height === 0) return "";
    let path = "";
    for (let i = 0; i < sectors.length - 1; i++) {
      const s1 = sectors[i];
      const s2 = sectors[i + 1];
      const x1 = dimensions.width * (s1.x / 100);
      const y1 = dimensions.height * (s1.y / 100);
      const x2 = dimensions.width * (s2.x / 100);
      const y2 = dimensions.height * (s2.y / 100);

      const dx = Math.abs(x2 - x1) * 0.45;
      if (i === 0) {
        path += `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      } else {
        path += ` C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      }
    }
    return path;
  };

  const activeSector = hoveredPlanet ? sectors.find(s => s.id === hoveredPlanet) : null;

  const fullSplinePath = getCurvePath();

  return (
    <section
      id="galactic-archive"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleContainerMouseLeave}
      className="relative w-full h-[900px] lg:h-[950px] bg-transparent select-none overflow-hidden flex flex-col justify-between py-12 md:py-16 border-b border-white/5"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spinClockwise { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes spinCounterClockwise { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        @keyframes floatZeroG { 0%, 100% { transform: translate(0px, 0px); } 50% { transform: translate(-3px, 4px); } }
        @keyframes pathPulse { 0%, 100% { opacity: 0.18; stroke-width: 2.5px; } 50% { opacity: 0.38; stroke-width: 4px; } }
        @keyframes pathDash { 0% { stroke-dashoffset: 240; } 100% { stroke-dashoffset: 0; } }
        @keyframes reflectionSweep { 0% { left: -150%; } 100% { left: 150%; } }
        .animate-spin-slow { animation: spinClockwise 25s linear infinite; }
        .animate-spin-fast { animation: spinClockwise 6s linear infinite; }
        .animate-spin-reverse-slow { animation: spinCounterClockwise 30s linear infinite; }
        .animate-spin-reverse-fast { animation: spinCounterClockwise 8s linear infinite; }
        .animate-path-pulse { animation: pathPulse 4s ease-in-out infinite; }
        .animate-reflection { animation: reflectionSweep 8s ease-in-out infinite; }
      `}} />

      {/* LAYER 1: Full-Screen Cinematic Image Expansion (Smoothly reveals active hovered sector image) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black/60 pointer-events-none">
        <AnimatePresence>
          {activeSector && activeSector.image && (
            <motion.div
              key={`bg-${activeSector.id}`}
              initial={{ 
                clipPath: `circle(0% at ${activeSector.x}% ${activeSector.y}%)`,
                opacity: 0 
              }}
              animate={{ 
                clipPath: `circle(150% at ${activeSector.x}% ${activeSector.y}%)`,
                opacity: 1 
              }}
              exit={{ 
                clipPath: `circle(0% at ${activeSector.x}% ${activeSector.y}%)`,
                opacity: 0 
              }}
              transition={{ 
                clipPath: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.8, ease: "easeInOut" }
              }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Cinematic expand zoom animation */}
              <motion.div
                initial={{ scale: 1.08 }}
                animate={{ scale: 1.00 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full origin-center"
                style={{
                  animation: "panBackdrop 25s ease-in-out infinite",
                  y: bgParallaxY
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

      {/* Static Space Background Cover */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Image
          src="/images/orbital nexus background.png"
          alt="Cinematic Cosmic Star Chart Background"
          fill
          priority
          className="object-cover opacity-50"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-b from-[#0b0705]/20 via-[#0b0705]/85 to-[#0b0705]" /> */}
      </div>

      {/* Volumetric spot lights and dark vignette overlay */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {/* <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#0b0705] via-[#0b0705]/40 to-transparent opacity-90" /> */}
        {/* <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#0b0705] via-[#0b0705]/75 to-transparent opacity-95" /> */}
        {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(11,7,5,0.95)_95%)]" /> */}
        {/* <div className="absolute top-0 left-0 w-[45%] h-[80%] bg-gradient-to-br from-[#e9b15d]/[0.035] via-transparent to-transparent blur-2xl transform origin-top-left rotate-12" /> */}
        {/* <div className="absolute top-0 right-0 w-[45%] h-[80%] bg-gradient-to-bl from-[#e9b15d]/[0.035] via-transparent to-transparent blur-2xl transform origin-top-right -rotate-12" /> */}

        {/* Darkening veil sits in z-10 layer (behind map container at z-30) */}
        <motion.div
          animate={{ opacity: hoveredPlanet ? 0.72 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-black pointer-events-none"
        />
        <div className="absolute inset-0 bg-noise opacity-[0.015]" />
      </div>

      {/* Floating asteroid shapes and space particles */}
      <div className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-hidden">
        <div style={{ width: "30px", height: "20px", top: "22%", left: "14%", background: "rgba(10,8,7,0.85)", clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)", animation: "spinClockwise 50s linear infinite" }} className="absolute border border-white/5 opacity-40 blur-[0.5px]" />
        <div style={{ width: "26px", height: "26px", top: "72%", left: "82%", background: "rgba(10,8,7,0.85)", clipPath: "polygon(40% 10%, 80% 20%, 90% 60%, 50% 90%, 10% 70%, 20% 30%)", animation: "spinCounterClockwise 65s linear infinite" }} className="absolute border border-white/5 opacity-30 blur-[0.5px]" />
        {[...Array(8)].map((_, i) => (
          <div key={`dust-${i}`} className="absolute bg-white/20 rounded-full blur-[1px] pointer-events-none" style={{ width: `${(i % 3) * 0.8 + 1.2}px`, height: `${(i % 3) * 0.8 + 1.2}px`, top: `${12 + (i * 9) % 70}%`, left: `${8 + (i * 12) % 84}%`, animation: `floatZeroG ${14 + i * 4}s ease-in-out infinite`, animationDelay: `${i * -1.8}s` }} />
        ))}
      </div>



      {/* Main Viewport Container */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-between py-8 pointer-events-none">

        {/* Header HUD Readout Title (Fixed at the top center with premium spacing) */}
        <div className="flex flex-col items-center text-center w-full pt-6 pb-4 pointer-events-none">
          <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-primary uppercase select-none mb-3">
            SYSTEM LOG // NAV MODULE
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-[0.22em] leading-none uppercase flex flex-wrap justify-center gap-x-4">
            <SmokyMeshText text="ORBITAL" className="text-4xl md:text-5xl font-extrabold text-white tracking-[0.22em] leading-none uppercase font-sans font-black" as="span" />
            <SmokyMeshText text="NEXUS" className="text-4xl md:text-5xl font-extrabold text-primary tracking-[0.22em] leading-none uppercase font-sans font-black" color="var(--accent-primary)" as="span" />
          </h2>
          <p className="text-white/45 text-[10px] tracking-[0.2em] uppercase font-light mt-5">
            MAPPING MY JOURNEY THROUGH INNOVATION
          </p>
          <span className="text-[8px] font-mono tracking-[0.25em] text-primary/70 mt-4 border border-primary/20 px-3 py-1 rounded bg-primary/5">
            SYSTEM STATUS : EVOLVING
          </span>
        </div>

        {/* CENTERED GALAXY MAP (Sits cleanly inside left/right safe horizontal margins) */}
        <div className="flex-grow w-full flex items-center justify-center relative min-h-[450px]">
          <motion.div
            ref={mapRef}
            className="absolute left-[8%] right-[8%] top-[10%] bottom-[12%] bg-transparent overflow-visible z-30 pointer-events-none"
          >
            {/* SVG Connecting Spline Paths with dynamic gradients */}
            {dimensions.width > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                <defs>
                  {sectors.slice(0, -1).map((s1, idx) => {
                    const s2 = sectors[idx + 1];
                    return (
                      <linearGradient
                        key={`grad-${idx}`}
                        id={`grad-${idx}`}
                        x1={`${s1.x}%`}
                        y1={`${s1.y}%`}
                        x2={`${s2.x}%`}
                        y2={`${s2.y}%`}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor={s1.color} stopOpacity="0.15" />
                        <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="0.7" />
                        <stop offset="100%" stopColor={s2.color} stopOpacity="0.15" />
                      </linearGradient>
                    );
                  })}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(var(--accent-glow-raw),0.1)" />
                    <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="rgba(var(--accent-glow-raw),0.1)" />
                  </linearGradient>
                </defs>

                {/* Curved paths connector layout */}
                {fullSplinePath && (
                  <g>
                    {/* Soft base structural line */}
                    <path
                      d={fullSplinePath}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="1.5"
                    />
                    {/* Dynamic gold glow path */}
                    <path
                      id="journeySplineForward"
                      d={fullSplinePath}
                      fill="none"
                      stroke="url(#orbitGlow)"
                      strokeWidth="3.5"
                      filter="url(#glow)"
                      className="animate-path-pulse opacity-45"
                    />
                    {/* Animated traveling energy pulses flow */}
                    <path
                      d={fullSplinePath}
                      fill="none"
                      stroke="rgba(233, 177, 93, 0.55)"
                      strokeWidth="1.25"
                      strokeDasharray="8 20"
                      style={{
                        animation: "pathDash 10s linear infinite"
                      }}
                    />
                    {/* Completed portion path glowing significantly brighter based on loop progress */}
                    <path
                      ref={completedPathRef}
                      d={fullSplinePath}
                      fill="none"
                      stroke="var(--accent-primary)"
                      strokeWidth="2.5"
                      strokeDasharray="1000"
                      className="opacity-0 filter"
                      style={{
                        filter: "drop-shadow(0 0 8px var(--accent-primary))",
                        strokeDashoffset: 1000,
                        transition: "opacity 300ms ease"
                      }}
                    />
                  </g>
                )}

                {/* Micro probe drones traveling slowly along the curve */}
                {sectors.slice(0, -1).map((s1, idx) => (
                  <g key={`probe-${idx}`}>
                    {/* Slow-traveling circular energy probe */}
                    <circle r="2.2" fill="#ffffff" className="shadow-[0_0_8px_#ffffff]">
                      <animateMotion dur={`${16 + idx * 3.5}s`} repeatCount="indefinite">
                        <mpath href="#journeySpline" />
                      </animateMotion>
                    </circle>
                    {/* Tiny micro drone arrow orienting to path tangent curve */}
                    <polygon points="-3,-2 3,0 -3,2" fill={s1.color} className="opacity-90">
                      <animateMotion dur={`${24 + idx * 4}s`} repeatCount="indefinite" rotate="auto">
                        <mpath href="#journeySpline" />
                      </animateMotion>
                    </polygon>
                  </g>
                ))}

                {/* Continuous hidden spline path for spaceship getPointAtLength and motion targets */}
                {fullSplinePath && (
                  <path
                    id="journeySpline"
                    ref={pathRef}
                    d={fullSplinePath}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="0"
                  />
                )}
              </svg>
            )}

            {/* Layered Beacons */}
            {sectors.map((sector) => (
              <PlanetNode
                key={sector.id}
                sector={sector}
                isHovered={hoveredPlanet === sector.id}
                hoveredPlanet={hoveredPlanet}
                shipProgress={forwardProgress}
                onMouseEnter={() => handleMouseEnter(sector.id)}
                onMouseLeave={handleMouseLeave}
              />
            ))}

            {/* Scroll-driven Spaceship Navigation Asset (Perfect centering lock with transition-none) */}
            <div
              ref={shipRef}
              className="absolute z-40 pointer-events-none w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-none"
              style={{
                left: 0,
                top: 0,
                willChange: "transform"
              }}
            >
              {/* Spaceship Image Graphic */}
              <div className="relative w-full h-full">
                <Image
                  src="/images/space ship.png"
                  alt="Spaceship console probe"
                  fill
                  className="object-contain"
                />
                {/* Engine fire/thruster glow particle tail */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-4 rounded-full bg-gradient-to-t from-transparent via-primary/40 to-primary blur-[2px] opacity-75 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* TYPOGRAPHY: Cinematic Journey Briefing HUD Overlay */}
        <div className="relative h-40 w-full mt-4 border-t border-white/[0.03] pt-6 pointer-events-auto">
          <AnimatePresence>
            {activeSector && (
              <motion.div
                key={`briefing-${activeSector.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: 0.1, duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col md:flex-row gap-6 justify-between items-start"
              >
                {/* Left Col: Milestone Meta Details */}
                <div className="flex flex-col gap-2.5 max-w-md items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono uppercase font-bold tracking-[0.25em] text-primary leading-none">
                      SECTOR {activeSector.num} // MISSION ARCHIVE
                    </span>
                    <h3 className="text-2xl font-extrabold text-white tracking-tight leading-normal uppercase">
                      {activeSector.name}
                    </h3>
                  </div>

                  <span className="text-[10px] font-sans font-medium text-white/50 tracking-wider">
                    {activeSector.subtitle}
                  </span>

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    <span className="text-[8px] font-mono tracking-widest text-primary uppercase">
                      {activeSector.status}
                    </span>
                  </div>
                </div>

                {/* Mid Col: Description Paragraph */}
                <div className="flex-grow max-w-lg">
                  <p className="text-white/60 text-xs font-light leading-relaxed">
                    {activeSector.desc}
                  </p>
                </div>

                {/* Right Col: Focus Capabilities / Represents Grid */}
                <div className="flex flex-col gap-2 min-w-[200px] border-l border-white/5 pl-6">
                  <span className="text-[7.5px] uppercase font-bold tracking-[0.2em] text-white/35 leading-none">
                    KEY CAPABILITIES
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {activeSector.represents.map((focus, index) => (
                      <span
                        key={index}
                        className="text-[8.5px] font-mono px-2 py-1 rounded bg-white/[0.02] border border-white/[0.04] text-white/65 hover:text-white hover:border-primary/20 transition-all duration-300"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
