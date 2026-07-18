"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import SimpleSkillCard from "./SimpleSkillCard";
import FloatingModel from "../FloatingModel";
import OrbitSystem from "../OrbitSystem";
import AuraRings from "../AuraRings";
import PlatformGlow from "../PlatformGlow";
import SmokyMeshText from "@/components/design-system/SmokyMeshText";

const GRID_SECTIONS = [
  {
    id: "frontend",
    title: "Frontend",
    skills: [
      { name: "React" },
      { name: "Next.js" },
      { name: "JavaScript" },
      { name: "TypeScript" },
      { name: "HTML5" },
      { name: "CSS3" },
      { name: "Tailwind CSS" },
      { name: "GSAP" },
      { name: "Framer Motion" }
    ]
  },
  {
    id: "backend",
    title: "Backend",
    skills: [
      { name: "Node.js" },
      { name: "Express" },
      { name: "Python" },
      { name: "FastAPI" },
      { name: "MongoDB" },
      { name: "Firebase" },
      { name: "REST API" },
      { name: "SQL" },
      { name: "Git" }
    ]
  },
  {
    id: "tools",
    title: "Tools",
    skills: [
      { name: "Cursor" },
      { name: "Antigravity" },
      { name: "ChatGPT" },
      { name: "Figma" },
      { name: "Framer" },
      { name: "Canva" },
      { name: "Blender" },
      { name: "VS Code" },
      { name: "GitHub" },
      { name: "Vercel" },
      { name: "Postman" },
      { name: "npm" }
    ]
  }
];

const SPACE_EMOJIS = ["🚀", "🛸", "⭐", "✨", "🪐", "☄️", "🌌", "👨‍🚀", "👾", "🛰️"];
const M = Matter;

export default function PlaygroundV2() {
  const mainContainerRef = useRef(null);
  const particleLayerRef = useRef(null);
  const centerpieceRef = useRef(null);

  const categoryRefs = useRef({});
  const cardRefs = useRef({});

  const engineRef = useRef(null);
  const bodiesRef = useRef([]);
  const particlesRef = useRef([]);
  const categoryAwakeStatesRef = useRef({ frontend: false, backend: false, tools: false });
  const hoverCleanupsRef = useRef([]);
  const rafRef = useRef(null);
  const observerRef = useRef(null);
  const isPausedRef = useRef(false);
  const updateRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);

  // Parallax Motion Values (from SkillsScene)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to interpolate coordinate changes
  const springConfig = { stiffness: 95, damping: 26, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Room Tilt rotation transforms for the centerpiece
  const rotateX = useTransform(smoothY, [-1, 1], [4, -4]); // Pitch
  const rotateY = useTransform(smoothX, [-1, 1], [-4, 4]); // Yaw

  // Subtle X/Y translation offsets for parallax
  const glowX = useTransform(smoothX, [-1, 1], [-6, 6]);
  const glowY = useTransform(smoothY, [-1, 1], [-6, 6]);

  const ringsX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const ringsY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const modelX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const modelY = useTransform(smoothY, [-1, 1], [-8, 8]);

  const orbitsX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const orbitsY = useTransform(smoothY, [-1, 1], [-12, 12]);

  const handleMouseMove = (e) => {
    if (!mainContainerRef.current) return;
    const rect = mainContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen to window scroll to instantly reset the section layout and clear active particles
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const isAnyCategoryAwake = Object.values(categoryAwakeStatesRef.current).some(v => v === true);
      const hasActiveParticles = particlesRef.current.length > 0;

      if (isAnyCategoryAwake || hasActiveParticles) {
        // Reset awake states to false (forces category physics back to static grid positions)
        categoryAwakeStatesRef.current = { frontend: false, backend: false, tools: false };

        // Clear all active DOM particles instantly
        particlesRef.current.forEach((p) => {
          if (p.el) p.el.remove();
        });
        particlesRef.current = [];

        // Reset positions and velocity of all card bodies back to layout origins
        if (engineRef.current) {
          bodiesRef.current.forEach(({ body }) => {
            M.Body.setPosition(body, { x: body.plugin.originX, y: body.plugin.originY });
            M.Body.setAngle(body, 0);
            M.Body.setVelocity(body, { x: 0, y: 0 });
            M.Body.setAngularVelocity(body, 0);

            // Instantly sync the visual position of the card element
            const el = body.plugin.el;
            if (el) {
              el.classList.remove("is-dragging");
              el.style.transform = "translate3d(0px, 0px, 0px) rotate(0rad) scale(1)";
            }
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const spawnParticles = (startX, startY) => {
    const layer = particleLayerRef.current;
    if (!layer) return;

    const count = 8;
    const power = 8;
    const spread = 60; // degrees
    const gravityVal = 0.2;
    const emojiSize = 16;

    for (let k = 0; k < count; k++) {
      const el = document.createElement("span");
      el.textContent = SPACE_EMOJIS[Math.floor(Math.random() * SPACE_EMOJIS.length)];
      el.style.position = "absolute";
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.fontSize = `${emojiSize}px`;
      el.style.lineHeight = "1";
      el.style.willChange = "transform, opacity";
      el.style.pointerEvents = "none";
      el.style.userSelect = "none";
      el.style.zIndex = "999999";
      layer.appendChild(el);

      const ang = ((-90 + (Math.random() * 2 - 1) * spread) * Math.PI) / 180;
      const speed = power * (0.6 + Math.random() * 0.7);

      particlesRef.current.push({
        el,
        x: startX - emojiSize / 2,
        y: startY - emojiSize / 2,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        rot: Math.random() * 360,
        vrot: (Math.random() * 2 - 1) * 10,
        gravity: gravityVal,
        life: 140 + Math.random() * 50
      });
    }
  };

  const cleanupPhysics = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (engineRef.current) {
      M.World.clear(engineRef.current.world, false);
      M.Engine.clear(engineRef.current);
      engineRef.current = null;
    }
    bodiesRef.current = [];

    // Clear particles
    particlesRef.current.forEach((p) => {
      if (p.el) p.el.remove();
    });
    particlesRef.current = [];

    // Clear hover triggers
    hoverCleanupsRef.current.forEach((cleanup) => cleanup());
    hoverCleanupsRef.current = [];
  };

  const initPhysics = () => {
    cleanupPhysics();

    const mainContainer = mainContainerRef.current;
    if (!mainContainer) return;

    const mainRect = mainContainer.getBoundingClientRect();
    if (mainRect.width === 0) return;

    // Reset awake states
    categoryAwakeStatesRef.current = { frontend: false, backend: false, tools: false };

    // Reset all card styles to allow clean natural grid layout measurements
    GRID_SECTIONS.forEach((sec) => {
      sec.skills.forEach((skill) => {
        const cardEl = cardRefs.current[`${sec.id}-${skill.name}`];
        if (cardEl) {
          cardEl.style.transform = "none";
          // Trigger synchronous layout reflow to flush transform reset
          const _ = cardEl.offsetHeight;
        }
      });
    });

    // Capture starting offsets of all cards relative to mainContainer
    const initialPlacements = [];
    GRID_SECTIONS.forEach((sec) => {
      sec.skills.forEach((skill) => {
        const cardEl = cardRefs.current[`${sec.id}-${skill.name}`];
        if (cardEl) {
          const cardRect = cardEl.getBoundingClientRect();
          const startX = cardRect.left - mainRect.left + cardRect.width / 2;
          const startY = cardRect.top - mainRect.top + cardRect.height / 2;

          initialPlacements.push({
            id: `${sec.id}-${skill.name}`,
            secId: sec.id,
            skillName: skill.name,
            el: cardEl,
            x: startX,
            y: startY,
            width: cardRect.width,
            height: cardRect.height
          });
        }
      });
    });

    // Create matter.js engine with zero gravity (space environment feel!)
    const engine = M.Engine.create({
      enableSleeping: false,
      positionIterations: isMobile ? 4 : 6,
      velocityIterations: isMobile ? 4 : 6
    });
    engine.gravity.y = 0; // zero gravity
    engine.gravity.x = 0;

    engineRef.current = engine;

    // Define boundary walls around the ENTIRE main container
    const wallThickness = 120;
    const walls = [
      // Top wall
      M.Bodies.rectangle(mainRect.width / 2, -wallThickness / 2, mainRect.width + 100, wallThickness, { isStatic: true }),
      // Bottom wall
      M.Bodies.rectangle(mainRect.width / 2, mainRect.height + wallThickness / 2, mainRect.width + 100, wallThickness, { isStatic: true }),
      // Left wall
      M.Bodies.rectangle(-wallThickness / 2, mainRect.height / 2, wallThickness, mainRect.height + 100, { isStatic: true }),
      // Right wall
      M.Bodies.rectangle(mainRect.width + wallThickness / 2, mainRect.height / 2, wallThickness, mainRect.height + 100, { isStatic: true }),
    ];

    M.Composite.add(engine.world, walls);

    // Centerpiece static circular collider to bounce cards off the astronaut platform
    const centerpieceEl = centerpieceRef.current;
    if (centerpieceEl) {
      const centRect = centerpieceEl.getBoundingClientRect();
      const centX = centRect.left - mainRect.left + centRect.width / 2;
      const centY = centRect.top - mainRect.top + centRect.height / 2;

      // Responsive collider radius
      const radius = Math.min(centRect.width, centRect.height) * 0.32;

      const centerpieceCollider = M.Bodies.circle(centX, centY, radius, {
        isStatic: true,
        label: "centerpiece-collider"
      });
      M.Composite.add(engine.world, centerpieceCollider);
    }

    // Create physics bodies for all skill cards matching exact DOM dimensions
    const tempBodies = [];
    initialPlacements.forEach((p) => {
      const body = M.Bodies.rectangle(p.x, p.y, p.width, p.height, {
        friction: 0.05,
        frictionAir: 0.02, // low air resistance for floating feel
        restitution: 0.8,  // high bounce in space!
        density: 0.001
      });

      body.plugin = { el: p.el, secId: p.secId, originX: p.x, originY: p.y, width: p.width, height: p.height };
      tempBodies.push(body);

      // Register custom mouse hover listeners to enable smooth Javascript-driven card lift and scale zoom offsets
      const cardEl = p.el;
      const onEnter = () => cardEl.classList.add("is-hovered");
      const onLeave = () => cardEl.classList.remove("is-hovered");
      cardEl.addEventListener("mouseenter", onEnter);
      cardEl.addEventListener("mouseleave", onLeave);

      hoverCleanupsRef.current.push(() => {
        cardEl.removeEventListener("mouseenter", onEnter);
        cardEl.removeEventListener("mouseleave", onLeave);
        cardEl.classList.remove("is-hovered");
      });
    });

    // Run overlap separation pass statically so no two bodies start overlapping
    let overlapsResolved = false;
    let iterations = 0;
    const maxIterations = 50;

    while (!overlapsResolved && iterations < maxIterations) {
      overlapsResolved = true;
      for (let i = 0; i < tempBodies.length; i++) {
        const bA = tempBodies[i];
        const wA = bA.plugin.width;
        const hA = bA.plugin.height;

        for (let j = i + 1; j < tempBodies.length; j++) {
          const bB = tempBodies[j];
          const wB = bB.plugin.width;
          const hB = bB.plugin.height;

          // Check for bounding box overlap with a safe margin
          const paddingX = 16;
          const paddingY = 16;
          const overlapX = (wA + wB) / 2 + paddingX - Math.abs(bA.position.x - bB.position.x);
          const overlapY = (hA + hB) / 2 + paddingY - Math.abs(bA.position.y - bB.position.y);

          if (overlapX > 0 && overlapY > 0) {
            overlapsResolved = false;
            // Shift bodies apart statically along minimum penetration axis
            if (overlapX < overlapY) {
              const sign = bA.position.x < bB.position.x ? -1 : 1;
              const shift = (overlapX / 2) * sign;
              M.Body.setPosition(bA, { x: bA.position.x + shift, y: bA.position.y });
              M.Body.setPosition(bB, { x: bB.position.x - shift, y: bB.position.y });
            } else {
              const sign = bA.position.y < bB.position.y ? -1 : 1;
              const shift = (overlapY / 2) * sign;
              M.Body.setPosition(bA, { x: bA.position.x, y: bA.position.y + shift });
              M.Body.setPosition(bB, { x: bB.position.x, y: bB.position.y - shift });
            }
          }
        }
      }
      iterations++;
    }

    // Now finalize resolved positions and add to composite
    tempBodies.forEach((body) => {
      body.plugin.originX = body.position.x;
      body.plugin.originY = body.position.y;

      M.Composite.add(engine.world, body);
      bodiesRef.current.push({
        body,
        el: body.plugin.el,
        secId: body.plugin.secId,
        originX: body.position.x,
        originY: body.position.y
      });
    });

    // Create Mouse Constraint using isolated dummy element so Matter.js NEVER binds DOM listeners to mainContainer
    const dummyElement = document.createElement("div");
    const mouse = M.Mouse.create(dummyElement);

    // Explicitly configure container pointer reference for coordinate translation offsets
    mainContainer.width = mainRect.width;
    mainContainer.height = mainRect.height;
    mouse.element = mainContainer;

    const mouseConstraint = M.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.12,
        render: { visible: false }
      }
    });

    M.Composite.add(engine.world, mouseConstraint);

    // Completely unbind Matter.js auto-bound event listeners to allow native scroll behavior
    mainContainer.removeEventListener("mousemove", mouse.mousemove);
    mainContainer.removeEventListener("mousedown", mouse.mousedown);
    mainContainer.removeEventListener("mouseup", mouse.mouseup);
    mainContainer.removeEventListener("mousewheel", mouse.mousewheel);
    mainContainer.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    mainContainer.removeEventListener("touchmove", mouse.mousemove);
    mainContainer.removeEventListener("touchstart", mouse.mousedown);
    mainContainer.removeEventListener("touchend", mouse.mouseup);

    // Scroll-friendly conditional mouse/touch delegates
    let isDraggingCard = false;

    const handleStart = (e) => {
      // Left mouse button only for desktop mouse events
      if (e.type === "mousedown" && e.button !== 0) return;

      const card = e.target.closest(".skill-card-physics");
      if (!card) return; // Swiping/clicking category background -> let page scroll normally

      isDraggingCard = true;

      // Feed mousedown/touchstart event manually to Matter.js mouse controller
      mouse.mousedown(e.nativeEvent || e);

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    };

    const handleMove = (e) => {
      if (!isDraggingCard) return;

      // Lock viewport scrolling ONLY during active card drag
      if (e.type === "touchmove" || e.type === "mousemove") {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
      mouse.mousemove(e.nativeEvent || e);
    };

    const handleEnd = (e) => {
      isDraggingCard = false;
      mouse.mouseup(e.nativeEvent || e);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };

    mainContainer.addEventListener("mousedown", handleStart);
    mainContainer.addEventListener("touchstart", handleStart, { passive: false });

    // Store custom listener unbind callbacks directly in engine config
    engine.cleanupScrollProtection = () => {
      mainContainer.removeEventListener("mousedown", handleStart);
      mainContainer.removeEventListener("touchstart", handleStart);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };

    // Freeze positions of bodies belonging to sleeping categories in beforeUpdate
    M.Events.on(engine, "beforeUpdate", () => {
      bodiesRef.current.forEach(({ body }) => {
        const secId = body.plugin.secId;
        const isAwake = categoryAwakeStatesRef.current[secId];

        // If category is sleeping and this body is not currently grabbed, freeze it in grid position
        if (!isAwake && mouseConstraint.body !== body) {
          M.Body.setPosition(body, { x: body.plugin.originX, y: body.plugin.originY });
          M.Body.setAngle(body, 0);
          M.Body.setVelocity(body, { x: 0, y: 0 });
          M.Body.setAngularVelocity(body, 0);
        }
      });
    });

    // Drag events handlers
    M.Events.on(mouseConstraint, "startdrag", (event) => {
      const body = event.body;
      const el = body?.plugin?.el;
      if (body && el) {
        el.classList.add("is-dragging");

        // Wake up all categories!
        categoryAwakeStatesRef.current = { frontend: true, backend: true, tools: true };

        // Spawns satisfying golden particle burst on grab
        const { position } = body;
        spawnParticles(position.x, position.y);
      }
    });

    M.Events.on(mouseConstraint, "enddrag", (event) => {
      const body = event.body;
      const el = body?.plugin?.el;
      if (el) {
        el.classList.remove("is-dragging");
      }
    });

    // requestAnimationFrame animation update loop
    const update = () => {
      if (isPausedRef.current) return;
      rafRef.current = requestAnimationFrame(update);

      M.Engine.update(engine);

      // Render loops: position divs relative to their natural CSS coordinates using CSS transforms delta offsets
      bodiesRef.current.forEach(({ body, el, originX, originY }) => {
        if (!el) return;
        const { position, angle } = body;

        const isHovered = el.classList.contains("is-hovered");
        const isDragging = el.classList.contains("is-dragging");

        const scale = isDragging ? 1.05 : (isHovered ? 1.025 : 1.0);
        const liftY = (isHovered && !isDragging) ? -8 : 0; // -8px pop-up lift on hover

        const dx = position.x - originX;
        const dy = position.y - originY;

        el.style.transform = `translate3d(${dx}px, ${dy + liftY}px, 0) rotate(${angle}rad) scale(${scale})`;
      });

      // Update particle physics
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.life -= 1;

        if (p.life <= 0) {
          p.el.remove();
          particles.splice(i, 1);
          continue;
        }

        const opacity = p.life < 20 ? Math.max(0, p.life / 20) : 1;
        p.el.style.opacity = String(opacity);
        p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}deg)`;
      }
    };

    updateRef.current = update;
    rafRef.current = requestAnimationFrame(update);
  };

  // IntersectionObserver to pause physics when section is off-screen
  useEffect(() => {
    const mainContainer = mainContainerRef.current;
    if (!mainContainer) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isPausedRef.current = false;
            // Initialize or resume
            if (!engineRef.current) {
              setTimeout(initPhysics, 200);
            } else {
              if (updateRef.current && !rafRef.current) {
                rafRef.current = requestAnimationFrame(updateRef.current);
              }
            }
          } else {
            isPausedRef.current = true;
            if (rafRef.current) {
              cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
            }
          }
        });
      },
      { threshold: 0.05 }
    );

    observerRef.current.observe(mainContainer);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (engineRef.current && engineRef.current.cleanupScrollProtection) {
        engineRef.current.cleanupScrollProtection();
      }
      cleanupPhysics();
    };
  }, [isMobile]);

  // Handle debounced resize re-initialization
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!isPausedRef.current) {
          initPhysics();
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const frontendSection = GRID_SECTIONS.find((s) => s.id === "frontend");
  const backendSection = GRID_SECTIONS.find((s) => s.id === "backend");
  const toolsSection = GRID_SECTIONS.find((s) => s.id === "tools");

  return (
    <div
      ref={mainContainerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full bg-black flex flex-col relative z-10 py-16 md:py-24 select-none overflow-hidden touch-pan-y"
      style={{
        perspective: 1500, // Essential for 3D centerpiece transforms
      }}
    >
      {/* 1. Full-width Environment Background Image & Soft Blending Layers (from SkillsScene) */}
      <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none overflow-hidden bg-layer-artwork-behind">
        {/* Static Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/background image 2.png"
            alt="Skills Environment Background"
            className="w-full h-full object-cover object-center"
            style={{
              willChange: "transform",
            }}
          />
        </div>

        {/* Seamless Edge Blending Overlays */}
        <div className="absolute top-0 left-0 right-0 h-[220px] bg-gradient-to-b from-black to-transparent z-2 pointer-events-none bg-layer-overlay" />
        <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-gradient-to-t from-black to-transparent z-2 pointer-events-none bg-layer-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_95%)] z-2 pointer-events-none bg-layer-overlay" />
        <div className="absolute inset-0 bg-black/50 z-1 pointer-events-none bg-layer-overlay" />
      </div>

      {/* Grid line overlay to match portfolio vibe */}
      <div className="absolute inset-0 bg-grid opacity-[0.025] pointer-events-none z-1 bg-layer-overlay" />
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-1 bg-layer-overlay" />

      {/* Particle Explosion Layer */}
      <div ref={particleLayerRef} className="absolute inset-0 pointer-events-none z-50 overflow-hidden" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-6 flex flex-col items-center bg-layer-content">

        {/* Section Heading standardizer */}
        <div className="flex flex-col gap-3 mb-14 md:mb-20 max-w-2xl w-full self-start">
          <span className="text-[12px] font-bold tracking-[0.25em] text-primary uppercase select-none">
            SKILLS
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-none flex flex-wrap gap-x-3">
            <SmokyMeshText text="Skills &" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none font-sans" as="span" gap-x-3 />
            <SmokyMeshText text="Stack" className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-none font-sans" color="var(--accent-primary)" as="span" />
          </h2>
          <p className="text-white/60 text-xs md:text-sm lg:text-base font-light leading-relaxed mt-2">
            Technologies I use to build modern digital experiences. Grab and fling any card to play in zero gravity!
          </p>
        </div>

        {/* 3-Column Unified Space Layout (Frontend, Centerpiece, Backend) using flexbox for far-edge alignment */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4 relative overflow-visible">

          {/* Left Column: Frontend Column */}
          <div
            ref={(el) => (categoryRefs.current["frontend"] = el)}
            className="flex flex-col items-center lg:items-start z-10 w-full lg:w-[340px]"
          >
            <div className="flex flex-col items-center lg:items-start mb-8">
              <h3 className="text-sm font-bold text-white tracking-[0.25em] uppercase font-sans">
                Frontend
              </h3>
              <div
                className="w-10 h-[2px] mt-2 transition-all duration-300"
                style={{
                  background: "linear-gradient(to right, var(--accent-primary), transparent)"
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full justify-items-center">
              {frontendSection?.skills.map((skill) => (
                <SimpleSkillCard
                  key={skill.name}
                  skill={skill}
                  categoryLabel="Frontend"
                  cardRef={(el) => (cardRefs.current[`frontend-${skill.name}`] = el)}
                />
              ))}
            </div>
          </div>

          {/* Center Column: Astronaut centerpiece */}
          <div
            ref={centerpieceRef}
            className="flex items-center justify-center relative overflow-visible z-20 w-full lg:w-[500px] xl:w-[600px]"
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full h-[400px] sm:h-[500px] md:h-[550px] lg:h-[620px] flex items-center justify-center"
            >
              {/* Volumetric Spotlights & Radial Lighting */}
              <div
                className="absolute top-[35%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[95%] h-[95%] bg-[radial-gradient(circle,rgba(233,177,93,0.06)_0%,transparent_65%)] pointer-events-none z-5"
                style={{ transform: "translateZ(-80px)" }}
              />
              <div
                className="absolute top-[30%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[65%] h-[65%] bg-[radial-gradient(circle,rgba(255,221,168,0.03)_0%,transparent_70%)] blur-[90px] pointer-events-none z-5"
                style={{ transform: "translateZ(-60px)" }}
              />

              {/* Holographic Aura Rings */}
              <AuraRings parallaxX={ringsX} parallaxY={ringsY} translateZ={-30} />

              {/* Platform Emissive Glow */}
              <PlatformGlow parallaxX={glowX} parallaxY={glowY} translateZ={-15} />

              {/* Floating Astronaut Model */}
              <FloatingModel parallaxX={modelX} parallaxY={modelY} translateZ={20} />

              {/* 3D Technology Orbit System */}
              <OrbitSystem parallaxX={orbitsX} parallaxY={orbitsY} translateZ={55} />
            </motion.div>
          </div>

          {/* Right Column: Backend Column */}
          <div
            ref={(el) => (categoryRefs.current["backend"] = el)}
            className="flex flex-col items-center lg:items-end z-10 w-full lg:w-[340px]"
          >
            <div className="flex flex-col items-center lg:items-end mb-8">
              <h3 className="text-sm font-bold text-white tracking-[0.25em] uppercase font-sans">
                Backend
              </h3>
              <div
                className="w-10 h-[2px] mt-2 transition-all duration-300"
                style={{
                  background: "linear-gradient(to left, var(--accent-primary), transparent)"
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full justify-items-center">
              {backendSection?.skills.map((skill) => (
                <SimpleSkillCard
                  key={skill.name}
                  skill={skill}
                  categoryLabel="Backend"
                  cardRef={(el) => (cardRefs.current[`backend-${skill.name}`] = el)}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Row: Tools Section (lg:col-span-12) */}
        <div
          ref={(el) => (categoryRefs.current["tools"] = el)}
          className="w-full flex flex-col items-center mt-20 z-10"
        >
          <div className="flex flex-col items-center mb-10">
            <h3 className="text-sm font-bold text-white tracking-[0.25em] uppercase font-sans">
              Tools
            </h3>
            <div
              className="w-16 h-[2px] mt-2 transition-all duration-300"
              style={{
                background: "linear-gradient(to right, transparent, var(--accent-primary), transparent)"
              }}
            />
          </div>
          <div className="flex flex-wrap gap-5 justify-center max-w-5xl w-full">
            {toolsSection?.skills.map((skill) => (
              <SimpleSkillCard
                key={skill.name}
                skill={skill}
                categoryLabel="Tool"
                cardRef={(el) => (cardRefs.current[`tools-${skill.name}`] = el)}
              />
            ))}
          </div>
        </div>

      </div>

      <style jsx global>{`
        .skill-card-physics {
          will-change: transform;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .skill-card-physics:hover,
        .skill-card-physics.is-hovered {
          border-color: color-mix(in srgb, var(--brand-color) 40%, transparent) !important;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.85), 0 0 25px color-mix(in srgb, var(--brand-color) 15%, transparent) !important;
          cursor: grab;
        }
        .skill-card-physics:hover .skill-icon-container,
        .skill-card-physics.is-hovered .skill-icon-container {
          color: var(--brand-color) !important;
          border-color: color-mix(in srgb, var(--brand-color) 25%, transparent) !important;
        }
        .skill-card-physics:active {
          cursor: grabbing;
        }
        .skill-card-physics.is-dragging {
          border-color: color-mix(in srgb, var(--brand-color) 65%, transparent) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.9), 0 0 35px color-mix(in srgb, var(--brand-color) 25%, transparent) !important;
          cursor: grabbing !important;
          z-index: 99999 !important;
        }
        .skill-card-physics.is-dragging .skill-icon-container {
          color: var(--brand-color) !important;
          border-color: color-mix(in srgb, var(--brand-color) 35%, transparent) !important;
        }
      `}</style>
    </div>
  );
}
