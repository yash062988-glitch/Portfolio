"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Static mapping of skill names to their copied static PNG assets
const SKILL_IMAGES = {
  "React": "/images/skills/react.png",
  "Next.js": "/images/skills/next.png",
  "TypeScript": "/images/skills/ts.png",
  "JavaScript": "/images/skills/js.png",
  "HTML": "/images/skills/html.png",
  "CSS": "/images/skills/css.png",
  "TailwindCSS": "/images/skills/tailwind.png",
  "Node.js": "/images/skills/node.png",
  "Express": "/images/skills/express.png",
  "MongoDB": "/images/skills/mongodb.png",
  "GraphQL": "/images/skills/graphql.png",
  "PostgreSQL": "/images/skills/postgresql.png",
  "MySQL": "/images/skills/mysql.png",
  "Prisma": "/images/skills/prisma.png",
  "Firebase": "/images/skills/firebase.png",
  "React Native": "/images/skills/reactnative.png",
  "Redux": "/images/skills/redux.png",
  "React Query": "/images/skills/reactquery.png",
  "Stripe": "/images/skills/stripe.png",
  "Figma": "/images/skills/figma.png",
  "Go": "/images/skills/go.png",
  "Tauri": "/images/skills/tauri.png",
  "Docker": "/images/skills/docker.png",
  "Framer": "/images/skills/framer.png",
  "MUI": "/images/skills/mui.png"
};

// Tech brand glows color map for hover glow effects
const GLOW_COLOR_MAP = {
  "React": "#61dafb",
  "Next.js": "#ffffff",
  "TypeScript": "#3178c6",
  "JavaScript": "#f7df1e",
  "HTML": "#e34f26",
  "CSS": "#264de4",
  "TailwindCSS": "#38bdf8",
  "Node.js": "#339933",
  "Express": "#ffffff",
  "MongoDB": "#47a248",
  "GraphQL": "#e10098",
  "PostgreSQL": "#336791",
  "MySQL": "#00758f",
  "Prisma": "#16a34a",
  "Firebase": "#ffca28",
  "React Native": "#61dafb",
  "Redux": "#764abc",
  "React Query": "#ff4154",
  "Stripe": "#635bff",
  "Figma": "#f24e1e",
  "Go": "#00add8",
  "Tauri": "#24c8db",
  "Docker": "#0db7ed",
  "Framer": "#ffffff",
  "MUI": "#007fff"
};

// 5 independent premium orbits configuration (Rx, Ry, Tilt, Speed, Direction)
const ORBITS_CONFIG = [
  { rx: 200, ry: 180, tilt: 8, speed: 22, direction: 1, rotSpeed: 45, rotDir: 1, strokeWidth: 1.5, baseOpacity: 0.25 },    // Orbit 1
  { rx: 280, ry: 220, tilt: 22, speed: 30, direction: -1, rotSpeed: 60, rotDir: -1, strokeWidth: 1.2, baseOpacity: 0.18 }, // Orbit 2
  { rx: 360, ry: 280, tilt: -16, speed: 38, direction: 1, rotSpeed: 75, rotDir: 1, strokeWidth: 1.0, baseOpacity: 0.12 },  // Orbit 3
  { rx: 440, ry: 200, tilt: 14, speed: 46, direction: -1, rotSpeed: 52, rotDir: -1, strokeWidth: 0.8, baseOpacity: 0.09 }, // Orbit 4
  { rx: 240, ry: 440, tilt: -12, speed: 42, direction: 1, rotSpeed: 68, rotDir: 1, strokeWidth: 0.6, baseOpacity: 0.07 }   // Orbit 5
];

// 25 skills evenly distributed across 5 orbits
const ICONS_CONFIG = [
  // Orbit 1: Inner Core (5 icons)
  { name: "React", orbitIndex: 0, startAngle: (0 / 5) * 2 * Math.PI },
  { name: "Next.js", orbitIndex: 0, startAngle: (1 / 5) * 2 * Math.PI },
  { name: "TypeScript", orbitIndex: 0, startAngle: (2 / 5) * 2 * Math.PI },
  { name: "JavaScript", orbitIndex: 0, startAngle: (3 / 5) * 2 * Math.PI },
  { name: "HTML", orbitIndex: 0, startAngle: (4 / 5) * 2 * Math.PI },

  // Orbit 2: Standard Stack (5 icons)
  { name: "CSS", orbitIndex: 1, startAngle: (0 / 5) * 2 * Math.PI },
  { name: "TailwindCSS", orbitIndex: 1, startAngle: (1 / 5) * 2 * Math.PI },
  { name: "Node.js", orbitIndex: 1, startAngle: (2 / 5) * 2 * Math.PI },
  { name: "Express", orbitIndex: 1, startAngle: (3 / 5) * 2 * Math.PI },
  { name: "MongoDB", orbitIndex: 1, startAngle: (4 / 5) * 2 * Math.PI },

  // Orbit 3: DB & Architecture (5 icons)
  { name: "GraphQL", orbitIndex: 2, startAngle: (0 / 5) * 2 * Math.PI },
  { name: "PostgreSQL", orbitIndex: 2, startAngle: (1 / 5) * 2 * Math.PI },
  { name: "MySQL", orbitIndex: 2, startAngle: (2 / 5) * 2 * Math.PI },
  { name: "Prisma", orbitIndex: 2, startAngle: (3 / 5) * 2 * Math.PI },
  { name: "Firebase", orbitIndex: 2, startAngle: (4 / 5) * 2 * Math.PI },

  // Orbit 4: Toolkits & Design (5 icons)
  { name: "React Native", orbitIndex: 3, startAngle: (0 / 5) * 2 * Math.PI },
  { name: "Redux", orbitIndex: 3, startAngle: (1 / 5) * 2 * Math.PI },
  { name: "React Query", orbitIndex: 3, startAngle: (2 / 5) * 2 * Math.PI },
  { name: "Stripe", orbitIndex: 3, startAngle: (3 / 5) * 2 * Math.PI },
  { name: "Figma", orbitIndex: 3, startAngle: (4 / 5) * 2 * Math.PI },

  // Orbit 5: Systems & Utilities (5 icons)
  { name: "Go", orbitIndex: 4, startAngle: (0 / 5) * 2 * Math.PI },
  { name: "Tauri", orbitIndex: 4, startAngle: (1 / 5) * 2 * Math.PI },
  { name: "Docker", orbitIndex: 4, startAngle: (2 / 5) * 2 * Math.PI },
  { name: "Framer", orbitIndex: 4, startAngle: (3 / 5) * 2 * Math.PI },
  { name: "MUI", orbitIndex: 4, startAngle: (4 / 5) * 2 * Math.PI }
];

export default function OrbitSystem({ parallaxY, parallaxX, translateZ = 0 }) {
  const containerRef = useRef(null);
  const iconRefs = useRef([]);
  const ellipseRefs = useRef([]);

  const [scale, setScale] = useState(1);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const hoveredIndexRef = useRef(null);

  // Responsive state tracking viewport width
  const [windowWidth, setWindowWidth] = useState(1200);

  // References for energy nodes, trails, and sparkles
  const dotRefs = useRef([]);
  const trail1Refs = useRef([]);
  const trail2Refs = useRef([]);
  const sparkleRefs = useRef([]);

  // Generate random starting angles for the energy dots
  const dotStartAngles = useRef(Array.from({ length: 5 }, () => Math.random() * 2 * Math.PI));

  // Sparkles coordinate/velocity pool
  const sparklesPool = useRef(
    Array.from({ length: 15 }, () => ({ x: 0, y: 0, opacity: 0, size: 0, vx: 0, vy: 0 }))
  );
  const frameCounter = useRef(0);

  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
  }, [hoveredIndex]);

  // Handle window resizing and container scaling
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const width = entry.contentRect.width;
          setScale(width / 900);
        }
      });
      observer.observe(containerRef.current);
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine which skill icons to show responsively (prevents overlapping)
  const getVisibleLogos = () => {
    if (windowWidth < 640) {
      // Mobile: Only render 8 core stack logos on first 2 orbits
      return ICONS_CONFIG.filter(
        (logo) =>
          logo.name === "React" ||
          logo.name === "Next.js" ||
          logo.name === "TypeScript" ||
          logo.name === "JavaScript" ||
          logo.name === "HTML" ||
          logo.name === "CSS" ||
          logo.name === "TailwindCSS" ||
          logo.name === "Node.js"
      ).map((logo, idx) => ({
        ...logo,
        orbitIndex: idx % 2,
        startAngle: (idx * 2 * Math.PI) / 8
      }));
    } else if (windowWidth < 1024) {
      // Tablet: 15 logos on first 3 orbits
      return ICONS_CONFIG.filter(
        (logo) => logo.orbitIndex < 3
      ).map((logo, idx) => ({
        ...logo,
        startAngle: (idx * 2 * Math.PI) / 15
      }));
    }
    // Desktop: All 25 logos across 5 orbits
    return ICONS_CONFIG;
  };

  const visibleLogos = getVisibleLogos();

  // Animation Loop (60fps DOM Updates)
  useEffect(() => {
    let animationFrameId;
    const startTime = performance.now();

    // Direct DOM coordinate positioning calculator
    const getCoords = (orbit, theta, elapsed, currentScale, pulseScale) => {
      const currentTilt = orbit.tilt + (elapsed * 360 / orbit.rotSpeed) * orbit.rotDir;
      const rx = orbit.rx * currentScale * pulseScale;
      const ry = orbit.ry * currentScale * pulseScale;

      const xRaw = rx * Math.cos(theta);
      const yRaw = ry * Math.sin(theta);

      const tiltRad = (currentTilt * Math.PI) / 180;
      const x = xRaw * Math.cos(tiltRad) - yRaw * Math.sin(tiltRad);
      const y = xRaw * Math.sin(tiltRad) + yRaw * Math.cos(tiltRad);

      return { x, y };
    };

    const update = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      frameCounter.current += 1;

      const containerWidth = containerRef.current ? containerRef.current.clientWidth : 900;
      const currentScale = containerWidth / 900;

      // 1. Update SVG Ellipse guides (animate independent rotators & asynchronous pulses)
      ORBITS_CONFIG.forEach((orbit, index) => {
        const ellipseEl = ellipseRefs.current[index];
        if (!ellipseEl) return;

        // Individual ellipse rotations
        const currentTilt = orbit.tilt + (elapsed * 360 / orbit.rotSpeed) * orbit.rotDir;
        ellipseEl.setAttribute("transform", `rotate(${currentTilt} 450 450)`);

        // Soft asynchronous pulsing
        const ringPulse = 1.0 + Math.sin(elapsed * 1.2 + index) * 0.022;
        ellipseEl.setAttribute("rx", (orbit.rx * ringPulse).toString());
        ellipseEl.setAttribute("ry", (orbit.ry * ringPulse).toString());
      });

      // 2. Position Energy Nodes and Lag Trails
      const currentDotCoords = [];

      ORBITS_CONFIG.forEach((orbit, index) => {
        const dotEl = dotRefs.current[index];
        const trail1El = trail1Refs.current[index];
        const trail2El = trail2Refs.current[index];
        if (!dotEl) return;

        const dotSpeed = orbit.speed * 0.65;
        const startAngle = dotStartAngles.current[index];
        const ringPulse = 1.0 + Math.sin(elapsed * 1.2 + index) * 0.022;

        // Main dot position
        const thetaDot = startAngle + orbit.direction * ((2 * Math.PI * elapsed) / dotSpeed);
        const posDot = getCoords(orbit, thetaDot, elapsed, currentScale, ringPulse);
        currentDotCoords.push(posDot);

        // Lag trail 1 (50ms lag)
        const thetaTrail1 = startAngle + orbit.direction * ((2 * Math.PI * (elapsed - 0.05)) / dotSpeed);
        const posTrail1 = getCoords(orbit, thetaTrail1, elapsed - 0.05, currentScale, ringPulse);

        // Lag trail 2 (100ms lag)
        const thetaTrail2 = startAngle + orbit.direction * ((2 * Math.PI * (elapsed - 0.10)) / dotSpeed);
        const posTrail2 = getCoords(orbit, thetaTrail2, elapsed - 0.10, currentScale, ringPulse);

        const depthSin = Math.sin(thetaDot);
        const zIndex = depthSin < 0 ? 12 : 42;
        const depthZ = depthSin * 50;

        dotEl.style.transform = `translate3d(calc(-50% + ${posDot.x}px), calc(-50% + ${posDot.y}px), ${depthZ}px)`;
        dotEl.style.zIndex = zIndex;

        if (trail1El) {
          trail1El.style.transform = `translate3d(calc(-50% + ${posTrail1.x}px), calc(-50% + ${posTrail1.y}px), ${depthZ - 1}px)`;
          trail1El.style.zIndex = zIndex - 1;
        }
        if (trail2El) {
          trail2El.style.transform = `translate3d(calc(-50% + ${posTrail2.x}px), calc(-50% + ${posTrail2.y}px), ${depthZ - 2}px)`;
          trail2El.style.zIndex = zIndex - 2;
        }
      });

      // 3. Emit cosmic dust sparkles behind energy dots
      if (frameCounter.current % 14 === 0 && currentDotCoords.length > 0) {
        const sourceDot = currentDotCoords[Math.floor(Math.random() * currentDotCoords.length)];
        const inactiveSparkleIndex = sparklesPool.current.findIndex(s => s.opacity <= 0);
        if (inactiveSparkleIndex !== -1) {
          sparklesPool.current[inactiveSparkleIndex] = {
            x: sourceDot.x,
            y: sourceDot.y,
            opacity: 0.9,
            size: 2.0 + Math.random() * 3.5,
            vx: (Math.random() - 0.5) * 0.8 * currentScale,
            vy: (Math.random() - 0.5) * 0.8 * currentScale
          };
        }
      }

      // Update sparkles positions
      sparklesPool.current.forEach((sparkle, index) => {
        const sparkleEl = sparkleRefs.current[index];
        if (!sparkleEl) return;

        if (sparkle.opacity > 0) {
          sparkle.x += sparkle.vx;
          sparkle.y += sparkle.vy;
          sparkle.opacity -= 0.024;

          sparkleEl.style.transform = `translate3d(calc(-50% + ${sparkle.x}px), calc(-50% + ${sparkle.y}px), -10px)`;
          sparkleEl.style.opacity = sparkle.opacity;
          sparkleEl.style.width = `${sparkle.size}px`;
          sparkleEl.style.height = `${sparkle.size}px`;
          sparkleEl.style.display = "block";
        } else {
          sparkleEl.style.display = "none";
        }
      });

      // 4. Update Skill Icons positioning (depth scaling, blurs, opacities)
      visibleLogos.forEach((icon, index) => {
        const el = iconRefs.current[index];
        if (!el) return;

        const orbitIndex = icon.orbitIndex;
        const orbit = ORBITS_CONFIG[orbitIndex];
        const ringPulse = 1.0 + Math.sin(elapsed * 1.2 + orbitIndex) * 0.022;

        const theta = icon.startAngle + orbit.direction * ((2 * Math.PI * elapsed) / orbit.speed);
        const pos = getCoords(orbit, theta, elapsed, currentScale, ringPulse);

        const depthSin = Math.sin(theta);
        const isBehind = depthSin < 0;

        let zIndex, opacity, depthScale, blurVal, bobY;

        // Custom icon hover states overrides
        if (hoveredIndexRef.current === index) {
          zIndex = 50;
          opacity = 1.0;
          depthScale = 1.35;
          blurVal = 0;
          bobY = 0; // Pause bobbing on hover
        } else {
          zIndex = isBehind ? 10 : 40;
          bobY = Math.sin(elapsed * 2.2 + icon.startAngle) * 6 * currentScale;

          if (isBehind) {
            // behind astronaut (dimmed, blurred, scaled down)
            opacity = 0.35 + (depthSin + 1) * 0.40;  // 0.35 to 0.75
            depthScale = 0.65 + (depthSin + 1) * 0.15; // 0.65 to 0.8
            blurVal = Math.abs(depthSin) * 2.5;
          } else {
            // in front of astronaut (bright, full scale, crisp)
            opacity = 0.75 + depthSin * 0.25;          // 0.75 to 1.0
            depthScale = 0.80 + depthSin * 0.20;         // 0.8 to 1.0
            blurVal = 0;
          }
        }

        const logoZ = depthSin * 60;
        const finalY = pos.y + bobY;

        // Transform applies translation, scaling, but NEVER any rotational tilts to the icon
        el.style.transform = `translate3d(calc(-50% + ${pos.x}px), calc(-50% + ${finalY}px), ${logoZ}px) scale(${depthScale})`;
        el.style.zIndex = zIndex;
        el.style.opacity = opacity;
        el.style.filter = blurVal > 0 ? `blur(${blurVal}px)` : "none";
      });

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [visibleLogos, windowWidth]);

  // CSS Styles for glowing dots, trails, and custom brand box shadows
  const inlineStyles = `
    .orbit-dot {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #ffd700;
      box-shadow: 0 0 10px 2.5px #e9b15d, 0 0 18px 5px #ffaa44;
      pointer-events: none;
      will-change: transform;
      transform-style: preserve-3d;
    }
    
    .orbit-dot-trail {
      position: absolute;
      left: 50%;
      top: 50%;
      border-radius: 50%;
      background-color: #e9b15d;
      pointer-events: none;
      will-change: transform;
      transform-style: preserve-3d;
    }
    
    .orbit-dot-trail.trail-1 {
      width: 5px;
      height: 5px;
      opacity: 0.55;
    }
    
    .orbit-dot-trail.trail-2 {
      width: 3px;
      height: 3px;
      opacity: 0.28;
    }
    
    .orbit-sparkle {
      position: absolute;
      left: 50%;
      top: 50%;
      border-radius: 50%;
      background-color: #ffd700;
      box-shadow: 0 0 6px 1.5px #e9b15d;
      pointer-events: none;
      will-change: transform;
      z-index: 39;
    }

    .orbit-icon-container {
      position: absolute;
      pointer-events: auto;
      left: 50%;
      top: 50%;
      margin-top: -40px;
      margin-left: -40px;
      transform-style: preserve-3d;
    }
  `;

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        x: parallaxX,
        y: parallaxY,
        z: translateZ,
        transformStyle: "preserve-3d",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />

      {/* SVG Container for Holographic Ellipses with Linear Gradients */}
      <svg
        viewBox="0 0 900 900"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none"
        }}
      >
        <defs>
          <linearGradient id="orbit-grad-0" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e9b15d" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffaa44" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="orbit-grad-1" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#e9b15d" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffaa44" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="orbit-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#e9b15d" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="orbit-grad-3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#e9b15d" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="orbit-grad-4" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#ffaa44" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#e9b15d" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Five independent ellipses with individual gradients */}
        {ORBITS_CONFIG.map((orbit, index) => (
          <ellipse
            key={index}
            ref={(el) => (ellipseRefs.current[index] = el)}
            cx="450"
            cy="450"
            rx={orbit.rx}
            ry={orbit.ry}
            fill="none"
            stroke={`url(#orbit-grad-${index})`}
            strokeWidth={orbit.strokeWidth}
            transform={`rotate(${orbit.tilt} 450 450)`}
            style={{
              transition: "stroke 0.4s ease"
            }}
          />
        ))}
      </svg>

      {/* Energy Nodes and Lag Trails */}
      {ORBITS_CONFIG.map((_, index) => (
        <div key={`dots-${index}`}>
          <div ref={(el) => (dotRefs.current[index] = el)} className="orbit-dot" />
          <div ref={(el) => (trail1Refs.current[index] = el)} className="orbit-dot-trail trail-1" />
          <div ref={(el) => (trail2Refs.current[index] = el)} className="orbit-dot-trail trail-2" />
        </div>
      ))}

      {/* Cosmic Dust Sparkle Particle Pool */}
      {Array.from({ length: 15 }).map((_, index) => (
        <div
          key={`sparkle-${index}`}
          ref={(el) => (sparkleRefs.current[index] = el)}
          className="orbit-sparkle"
          style={{ display: "none" }}
        />
      ))}

      {/* Technology Skill Logos (Renders PNG assets with actual colors) */}
      {visibleLogos.map((icon, index) => {
        const glowColor = GLOW_COLOR_MAP[icon.name] || "#ffffff";
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={`${icon.name}-${index}`}
            ref={(el) => (iconRefs.current[index] = el)}
            className="orbit-icon-container"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Glassmorphism Skill Card container */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border backdrop-blur-md relative cursor-pointer transition-all duration-300 ${
                isHovered
                  ? "border-primary/60 scale-120 -translate-y-1 shadow-[0_0_30px_var(--glow-color)] bg-[#0b0705]/50"
                  : "border-white/10 bg-white/[0.03] hover:border-primary/30"
              }`}
              style={{
                "--glow-color": isHovered ? `${glowColor}66` : "rgba(255,255,255,0.05)"
              }}
            >
              {/* Inner subtle glow outline */}
              <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />

              {/* Vibrant PNG Brand Logo */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 relative flex items-center justify-center">
                <img
                  src={SKILL_IMAGES[icon.name]}
                  alt={icon.name}
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>

              {/* Tooltip containing skill name directly underneath hovered icon */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-[75px] sm:top-[85px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 backdrop-blur-md border border-primary/30 text-[10px] text-primary font-bold px-2.5 py-1 rounded-md shadow-[0_5px_15px_rgba(0,0,0,0.6)] z-[10000] pointer-events-none"
                  >
                    {icon.name}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
