"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import SimpleSkillCard from "./SimpleSkillCard";

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
  
  const categoryRefs = useRef({});
  const cardRefs = useRef({});
  
  const engineRef = useRef(null);
  const bodiesRef = useRef([]);
  const particlesRef = useRef([]);
  const categoryAwakeStatesRef = useRef({ frontend: false, backend: false, tools: false });
  const rafRef = useRef(null);
  const observerRef = useRef(null);
  const isPausedRef = useRef(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
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
    const gravityVal = 0.45;
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
        }
      });
    });

    // Capture starting offsets of all cards relative to mainContainer
    const initialPlacements = [];
    GRID_SECTIONS.forEach((sec) => {
      const containerEl = categoryRefs.current[sec.id];
      if (!containerEl) return;

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
            y: startY
          });
        }
      });
    });

    // Create matter.js engine with low space gravity (microgravity feel)
    const engine = M.Engine.create({
      enableSleeping: false,
      positionIterations: isMobile ? 4 : 6,
      velocityIterations: isMobile ? 4 : 6
    });
    engine.gravity.y = 0.08; // very low space gravity
    engine.gravity.x = 0;

    engineRef.current = engine;

    // Define boundary walls around each category container area
    const wallThickness = 120;
    const walls = [];

    GRID_SECTIONS.forEach((sec) => {
      const containerEl = categoryRefs.current[sec.id];
      if (!containerEl) return;

      const containerRect = containerEl.getBoundingClientRect();
      const localTop = containerRect.top - mainRect.top;
      const localBottom = containerRect.bottom - mainRect.top;
      const localLeft = containerRect.left - mainRect.left;
      const localRight = containerRect.right - mainRect.left;

      const w = localRight - localLeft;
      const h = localBottom - localTop;

      // Category boundary walls
      // Top wall
      walls.push(M.Bodies.rectangle((localLeft + localRight) / 2, localTop - wallThickness / 2, w + 100, wallThickness, { isStatic: true }));
      // Bottom wall
      walls.push(M.Bodies.rectangle((localLeft + localRight) / 2, localBottom + wallThickness / 2, w + 100, wallThickness, { isStatic: true }));
      // Left wall
      walls.push(M.Bodies.rectangle(localLeft - wallThickness / 2, (localTop + localBottom) / 2, wallThickness, h + 100, { isStatic: true }));
      // Right wall
      walls.push(M.Bodies.rectangle(localRight + wallThickness / 2, (localTop + localBottom) / 2, wallThickness, h + 100, { isStatic: true }));
    });

    M.Composite.add(engine.world, walls);

    // Create physics bodies for all skill cards matching exact DOM dimensions
    const tempBodies = [];
    initialPlacements.forEach((p) => {
      const cardRect = p.el.getBoundingClientRect();
      const w = cardRect.width;
      const h = cardRect.height;

      const body = M.Bodies.rectangle(p.x, p.y, w, h, {
        friction: 0.12,
        frictionAir: 0.04, // slight air resistance
        restitution: 0.15, // soft collisions bounce
        density: 0.001
      });

      body.plugin = { el: p.el, secId: p.secId, originX: p.x, originY: p.y, width: w, height: h };
      tempBodies.push(body);
    });

    // Run overlap separation pass statically so no two bodies in the same category start overlapping
    let overlapsResolved = false;
    let iterations = 0;
    const maxIterations = 10;

    while (!overlapsResolved && iterations < maxIterations) {
      overlapsResolved = true;
      for (let i = 0; i < tempBodies.length; i++) {
        const bA = tempBodies[i];
        const wA = bA.plugin.width;
        const hA = bA.plugin.height;

        for (let j = i + 1; j < tempBodies.length; j++) {
          const bB = tempBodies[j];
          if (bA.plugin.secId !== bB.plugin.secId) continue;

          const wB = bB.plugin.width;
          const hB = bB.plugin.height;

          // Check for bounding box overlap with a tiny safety padding (4px)
          const padding = 4;
          const overlapX = (wA + wB) / 2 + padding - Math.abs(bA.position.x - bB.position.x);
          const overlapY = (hA + hB) / 2 + padding - Math.abs(bA.position.y - bB.position.y);

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
      mouse.mousedown(e);

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
      mouse.mousemove(e);
    };

    const handleEnd = (e) => {
      isDraggingCard = false;
      mouse.mouseup(e);
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
        
        // Wake up all bodies in the category container
        const currentSecId = body.plugin.secId;
        categoryAwakeStatesRef.current[currentSecId] = true;

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
        
        const dx = position.x - originX;
        const dy = position.y - originY;

        const isDragging = el.classList.contains("is-dragging");
        const scale = isDragging ? 1.03 : 1.0;
        
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${angle}rad) scale(${scale})`;
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
              initPhysics();
            } else {
              // Restart requestAnimationFrame loop
              const update = () => {
                if (isPausedRef.current) return;
                rafRef.current = requestAnimationFrame(update);
                if (engineRef.current) {
                  M.Engine.update(engineRef.current);
                  
                  bodiesRef.current.forEach(({ body, el, originX, originY }) => {
                    if (!el) return;
                    const { position, angle } = body;
                    
                    const dx = position.x - originX;
                    const dy = position.y - originY;

                    const isDragging = el.classList.contains("is-dragging");
                    const scale = isDragging ? 1.03 : 1.0;
                    el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${angle}rad) scale(${scale})`;
                  });
                }
              };
              if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(update);
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

  return (
    <div ref={mainContainerRef} className="w-full bg-black flex flex-col relative z-10 py-6 select-none overflow-visible touch-pan-y">
      {/* Particle Explosion Layer */}
      <div ref={particleLayerRef} className="absolute inset-0 pointer-events-none z-50 overflow-hidden" />

      {GRID_SECTIONS.map((sec) => (
        <div 
          key={sec.id} 
          id={sec.id}
          ref={(el) => (categoryRefs.current[sec.id] = el)}
          className="w-full flex flex-col items-center py-10 md:py-14 border-b border-white/[0.02] last:border-b-0 relative overflow-hidden"
        >
          {/* Elegant Centered Section Heading */}
          <div className="flex flex-col items-center mb-10 pointer-events-none select-none">
            <h3 className="text-lg md:text-xl font-bold text-white tracking-[0.25em] text-center uppercase font-sans">
              {sec.title}
            </h3>
            {/* Subtle Gold Stage Accent Line */}
            <div className="w-10 h-[2px] bg-gradient-to-r from-transparent via-[#e9b15d] to-transparent mt-2.5" />
          </div>

          {/* Cards Grid Grid Wrapper (Maintains natural layout and responsive spacing) */}
          <div className="grid-wrapper relative max-w-6xl mx-auto w-full px-6 min-h-[160px] overflow-visible">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 justify-items-center w-full">
              {sec.skills.map((skill) => (
                <SimpleSkillCard
                  key={skill.name}
                  skill={skill}
                  categoryLabel={sec.id === "tools" ? "Tool" : sec.title}
                  cardRef={(el) => (cardRefs.current[`${sec.id}-${skill.name}`] = el)}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Styled animation CSS and overrides */}
      <style jsx global>{`
        .skill-card-physics {
          will-change: transform;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .skill-card-physics:hover {
          border-color: rgba(233, 177, 93, 0.45) !important;
          box-shadow: 0 0 20px rgba(233, 177, 93, 0.2) !important;
          cursor: grab;
        }
        .skill-card-physics:active {
          cursor: grabbing;
        }
        .skill-card-physics.is-dragging {
          border-color: rgba(233, 177, 93, 0.8) !important;
          box-shadow: 0 0 35px rgba(233, 177, 93, 0.4) !important;
          cursor: grabbing !important;
          z-index: 99999 !important;
        }
      `}</style>
    </div>
  );
}
