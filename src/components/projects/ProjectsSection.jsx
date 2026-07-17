"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS_DATA } from "@/constants/data";
import SectionHeading from "@/components/design-system/SectionHeading";
import ProjectDetailsPanel from "@/components/projects/ProjectDetailsPanel";
import { ArrowRight } from "lucide-react";

// Register GSAP ScrollTrigger plugin safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProjectsSection() {
  const containerRef = useRef(null);
  const pinContainerRef = useRef(null);
  const sliderRef = useRef(null);
  const progressBarRef = useRef(null);
  const counterRef = useRef(null);

  const [selectedProject, setSelectedProject] = useState(null);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(false);

  // Resize listener to track responsive widths for scroll calculations
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cleanupScrollTrigger = () => {
    const mainPin = ScrollTrigger.getById("projects-pin");
    if (mainPin) {
      mainPin.kill(true);
    }
    const helper = ScrollTrigger.getById("projects-helper");
    if (helper) {
      helper.kill();
    }
    const check = ScrollTrigger.getById("projects-check");
    if (check) {
      check.kill();
    }
  };

  const lockPresentation = () => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    setIsLocked(true);

    const mainPin = ScrollTrigger.getById("projects-pin");
    if (mainPin) {
      const startTop = mainPin.start;

      // 1. Kill the pinning and timeline scroll triggers immediately
      mainPin.kill(true);
      
      const helper = ScrollTrigger.getById("projects-helper");
      if (helper) helper.kill();
      
      const check = ScrollTrigger.getById("projects-check");
      if (check) check.kill();

      // 2. Collapse container height to normal flow height (100vh) to eliminate dead scroll space
      if (containerRef.current) {
        containerRef.current.style.height = "100vh";
      }

      // 3. Refresh ScrollTrigger positions globally so other page sections update
      ScrollTrigger.refresh();

      // 4. Set the window scroll position to the bottom of the collapsed Projects section.
      // This aligns the viewport perfectly with the start of the Certifications section,
      // preventing clamping jumps or double-compensation skipping.
      window.scrollTo(0, startTop + window.innerHeight);
    }
  };

  const initScrollTrigger = () => {
    cleanupScrollTrigger();

    const N = PROJECTS_DATA.length;
    const scrollDistance = (N - 1) * window.innerHeight * 0.95;
    const sectionHeight = window.innerHeight + scrollDistance;

    if (containerRef.current && !isLockedRef.current) {
      containerRef.current.style.height = `${sectionHeight}px`;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: pinContainerRef.current,
        scrub: 1.2, // inertia weight
        start: "top top",
        end: () => `+=${scrollDistance}`,
        invalidateOnRefresh: true,
        id: "projects-pin",
        onUpdate: (self) => {
          // If locked and user scrolls back up (direction -1), 
          // lock it immediately and collapse the pinning triggers.
          if (self.progress >= 0.92 && self.direction === -1) {
            lockPresentation();
          }

          // Toggle floating skip-up button visibility
          const skipBtn = document.querySelector(".skip-up-floating-btn");
          if (skipBtn) {
            if (self.direction === -1 && self.progress > 0.05 && self.progress < 0.98) {
              skipBtn.classList.remove("opacity-0", "pointer-events-none", "translate-y-4");
              skipBtn.classList.add("opacity-100", "translate-y-0");
            } else {
              skipBtn.classList.add("opacity-0", "pointer-events-none", "translate-y-4");
              skipBtn.classList.remove("opacity-100", "translate-y-0");
            }
          }
        },
        onLeave: () => {
          lockPresentation();
        }
      },
    });

    // Helper ScrollTrigger to detect when user goes above the projects section
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      id: "projects-helper",
      onLeaveBack: () => {
        if (isLockedRef.current) {
          if (containerRef.current) {
            containerRef.current.style.height = "100vh";
          }
          cleanupScrollTrigger();
          ScrollTrigger.refresh();
        }
      }
    });

    // Active check scroll trigger to re-enable main pin when scrolling down again
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: () => `+=${scrollDistance}`,
      id: "projects-check",
      onUpdate: (self) => {
        if (self.direction === 1) {
          const mainPin = ScrollTrigger.getById("projects-pin");
          if (mainPin && !mainPin.enabled && !isLockedRef.current) {
            mainPin.enable();
          }
        }
      }
    });

    // Initial Pause & Card 0 text entrance (progress: 0.0 to 0.08)
    tl.to({}, { duration: 0.08 });
    tl.fromTo(".active-content-0", { opacity: 0 }, { opacity: 1, duration: 0.05, ease: "power2.out" }, 0.01);

    // Dynamic progress line indicator filling
    tl.to(progressBarRef.current, {
      width: "100%",
      ease: "none",
      duration: 1.0,
    }, 0.0);

    const pauseTimes = [0.04, 0.33, 0.63, 0.94];
    pauseTimes.forEach((time, idx) => {
      tl.call(() => {
        if (counterRef.current) {
          counterRef.current.textContent = String(idx + 1).padStart(2, "0");
        }
      }, null, time);
    });

    // Card 0 -> Card 1 Transition (progress: 0.08 to 0.28)
    tl.to(".project-card-0", {
      x: "-43vw", // Shifted further left so 50% is offscreen
      y: 0,
      scale: 0.32,
      opacity: 1.0, // Opacity stays 100% per specification
      rotate: 0,
      zIndex: 1,
      borderColor: "rgba(233, 177, 93, 0.4)",
      boxShadow: "0 0 10px rgba(233, 177, 93, 0.1)",
      pointerEvents: "none",
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.08);

    tl.to(".active-content-0", { opacity: 0, duration: 0.10, ease: "power2.inOut" }, 0.08);
    tl.to(".archive-content-0", { opacity: 1, duration: 0.10, ease: "power2.inOut" }, 0.18);

    tl.to(".project-card-1", {
      x: 0,
      scale: 1.0,
      opacity: 1.0,
      zIndex: 4,
      borderColor: "rgba(233, 177, 93, 0.55)",
      boxShadow: "0 0 80px rgba(233, 177, 93, 0.25)",
      pointerEvents: "auto",
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.08);

    tl.to(".active-content-1", { opacity: 1, duration: 0.10, ease: "power2.inOut" }, 0.18);

    // Card 1 -> Card 2 Transition (progress: 0.38 to 0.58)
    tl.to(".project-card-0", {
      x: "-43vw",
      y: 0,
      scale: 0.32,
      zIndex: 1,
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.38);

    tl.to(".project-card-1", {
      x: "-43vw", // Aligned in vertical column
      y: -12, // Vertical offset
      scale: 0.32,
      opacity: 1.0,
      rotate: 0,
      zIndex: 2,
      borderColor: "rgba(233, 177, 93, 0.4)",
      boxShadow: "0 0 10px rgba(233, 177, 93, 0.1)",
      pointerEvents: "none",
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.38);

    tl.to(".active-content-1", { opacity: 0, duration: 0.10, ease: "power2.inOut" }, 0.38);
    tl.to(".archive-content-1", { opacity: 1, duration: 0.10, ease: "power2.inOut" }, 0.48);

    tl.to(".project-card-2", {
      x: 0,
      scale: 1.0,
      opacity: 1.0,
      zIndex: 4,
      borderColor: "rgba(233, 177, 93, 0.55)",
      boxShadow: "0 0 80px rgba(233, 177, 93, 0.25)",
      pointerEvents: "auto",
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.38);

    tl.to(".active-content-2", { opacity: 1, duration: 0.10, ease: "power3.inOut" }, 0.48);

    // Card 2 -> Card 3 Transition (progress: 0.68 to 0.88)
    tl.to(".project-card-0", {
      x: "-43vw",
      y: 0,
      scale: 0.32,
      zIndex: 1,
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.68);

    tl.to(".project-card-1", {
      x: "-43vw",
      y: -12,
      scale: 0.32,
      zIndex: 2,
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.68);

    tl.to(".project-card-2", {
      x: "-43vw", // Aligned in vertical column
      y: -24, // Vertical offset
      scale: 0.32,
      opacity: 1.0,
      rotate: 0,
      zIndex: 3,
      borderColor: "rgba(233, 177, 93, 0.4)",
      boxShadow: "0 0 10px rgba(233, 177, 93, 0.1)",
      pointerEvents: "none",
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.68);

    tl.to(".active-content-2", { opacity: 0, duration: 0.10, ease: "power2.inOut" }, 0.68);
    tl.to(".archive-content-2", { opacity: 1, duration: 0.10, ease: "power2.inOut" }, 0.78);

    tl.to(".project-card-3", {
      x: 0,
      scale: 1.0,
      opacity: 1.0,
      zIndex: 4,
      borderColor: "rgba(233, 177, 93, 0.55)",
      boxShadow: "0 0 80px rgba(233, 177, 93, 0.25)",
      pointerEvents: "auto",
      duration: 0.20,
      ease: "power3.inOut"
    }, 0.68);

    tl.to(".active-content-3", { opacity: 1, duration: 0.10, ease: "power3.inOut" }, 0.78);

    tl.to({}, { duration: 0.12 });
  };

  useEffect(() => {
    initScrollTrigger();
    return cleanupScrollTrigger;
  }, [windowWidth]);

  // Card mouse-move parallax effect (only targets active cards)
  const handleMouseMove = (e) => {
    if (isLocked) return;
    const card = e.currentTarget;
    const style = window.getComputedStyle(card);
    if (style.pointerEvents === "none") return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const moveX = (x / rect.width) * 6;
    const moveY = (y / rect.height) * 6;
    
    gsap.to(card, {
      x: moveX,
      y: moveY,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const handleMouseLeave = (e) => {
    if (isLocked) return;
    const card = e.currentTarget;
    gsap.to(card, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const handleUnlock = () => {
    isLockedRef.current = false;
    setIsLocked(false);
    
    // Restore scroll container height
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const startTop = rect.top + window.pageYOffset;
      const scrollDistance = (PROJECTS_DATA.length - 1) * window.innerHeight * 0.95;
      
      containerRef.current.style.height = `${window.innerHeight + scrollDistance}px`;
      
      // Shift scroll position down to the bottom of the restored Projects section
      window.scrollTo(0, startTop + window.innerHeight + scrollDistance);
    }

    // Recreate scroll triggers and timelines
    initScrollTrigger();
  };

  return (
    <div ref={containerRef} className={`relative w-full overflow-visible z-10 bg-black projects-container ${isLocked ? "is-locked" : ""}`}>
      {/* Pinned Visual Viewport */}
      <div 
        ref={pinContainerRef} 
        className="w-full h-screen relative overflow-hidden flex flex-col justify-between py-12 md:py-16 select-none bg-black"
      >
        {/* Cinematic Backdrop Stars Drift */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-noise opacity-[0.015]" />
          <div 
            className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(1px 1px at 40px 60px, #ffffff, transparent), radial-gradient(1.5px 1.5px at 120px 200px, var(--accent-primary), transparent), radial-gradient(2px 2px at 250px 350px, #ffffff, transparent)",
              backgroundSize: "400px 400px",
              animation: "starsFloat 160s linear infinite"
            }}
          />
        </div>

        {/* Section Heading Header (Static within pin viewport) */}
        <div className="w-full max-w-7xl mx-auto px-6 relative z-30 select-none">
          <SectionHeading
            label="Missions"
            title="Featured Projects"
            description="Explore a curated selection of my work spanning frontend platforms, machine learning pipelines, and semantic AI tools."
            className="!mb-0"
          />
        </div>

        {/* Layer 1: Infinite Background Marquee (Independent Loop) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 flex items-center select-none">
          <div 
            className="flex flex-row items-center whitespace-nowrap opacity-[0.06] select-none text-[18vw] md:text-[22vw] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white gap-8 animate-[marquee_45s_linear_infinite] animate-[colorCycle_20s_linear_infinite] select-none"
            style={{
              width: "max-content",
              willChange: "transform"
            }}
          >
            <span>PROJECTS  •  CREATIONS  •  MISSIONS  •  GALLERY  •  </span>
            <span>PROJECTS  •  CREATIONS  •  MISSIONS  •  GALLERY  •  </span>
          </div>
        </div>

        {/* Archive Stack Position Guide (shifted more left, 50% offscreen) */}
        <div className="absolute left-[18%] top-[50%] -translate-y-1/2 w-[15vw] h-[30vh] z-0 pointer-events-none" />

        {/* Layer 2: Projects Cards Stack Container (Z-20) */}
        <div 
          ref={sliderRef} 
          className="relative w-full h-[52vh] md:h-[58vh] max-w-5xl mx-auto flex items-center justify-center z-20 overflow-visible"
        >
          {PROJECTS_DATA.map((project, idx) => {
            const isPlaceholder = project.isPlaceholder;
            const isFirst = idx === 0;

            return (
              <div 
                key={project.id}
                className={`project-card-${idx} absolute w-[90vw] md:w-[48vw] h-full rounded-[32px] border bg-[#0a0705] shadow-2xl flex flex-col justify-end overflow-hidden cursor-pointer select-none transition-all duration-300 will-change-transform`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => {
                  // Only click active card
                  const cardEl = document.querySelector(`.project-card-${idx}`);
                  if (cardEl) {
                    const style = window.getComputedStyle(cardEl);
                    if (style.pointerEvents === "none") return;
                  }
                  if (isPlaceholder) {
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    return;
                  }
                  setSelectedProject(project);
                }}
                style={{
                  zIndex: PROJECTS_DATA.length - idx
                }}
              >
                {/* Subtle golden light sweep */}
                <div 
                  className="absolute inset-0 pointer-events-none z-20 opacity-20"
                  style={{
                    background: "linear-gradient(110deg, transparent 40%, rgba(233,177,93,0.1) 45%, rgba(233,177,93,0.2) 50%, rgba(233,177,93,0.1) 55%, transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "lightSweep 12s linear infinite"
                  }}
                />

                {/* Active content view (large layout contents) */}
                <div 
                  className={`active-content-${idx} absolute inset-0 w-full h-full flex flex-col justify-end p-6 md:p-12 z-20`} 
                  style={{ opacity: isFirst ? 1 : 0 }}
                >
                  <span className="text-[10px] font-mono tracking-widest text-primary/80 uppercase font-bold select-none mb-1">
                    {project.category}
                  </span>

                  <h3 className="text-2xl md:text-5xl font-extrabold text-white leading-none uppercase tracking-tight select-none truncate">
                    {project.title}
                  </h3>

                  <p className="text-xs md:text-sm text-white/70 max-w-[460px] leading-relaxed font-light mt-1 md:mt-2 line-clamp-3">
                    {project.shortDesc}
                  </p>

                  {/* Circular Gold arrow button */}
                  <div className="mt-3 md:mt-5 flex-shrink-0 select-none">
                    <button 
                      className="group/btn flex items-center gap-3.5 text-xs md:text-sm font-bold uppercase tracking-wider text-primary hover:text-white transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlaceholder) {
                          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                        } else {
                          setSelectedProject(project);
                        }
                      }}
                    >
                      <span>{isPlaceholder ? "Let's Build Yours" : "Click to View Details"}</span>
                      <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center bg-black/40 group-hover/btn:border-primary group-hover/btn:bg-primary group-hover/btn:text-black transition-all duration-300 transform group-hover/btn:translate-x-1.5 shrink-0">
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:rotate-[-45deg]" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Archive content view (small thumbnail layout contents) */}
                <div 
                  className={`archive-content-${idx} absolute inset-0 w-full h-full flex flex-col justify-end p-4 z-20 bg-black/70 backdrop-blur-[2px] pointer-events-none`} 
                  style={{ opacity: 0 }}
                >
                  <h4 className="text-[10px] md:text-xs font-mono tracking-wider text-primary uppercase font-extrabold truncate w-full text-center">
                    {project.title.split(" ")[0]}
                  </h4>
                </div>

                {/* Fixed Hero Image */}
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0 rounded-[32px]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
                  />
                  {/* Dark gradient overlay left 0% -> 75% for readable typography */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 45%, transparent 75%)"
                    }}
                  />
                </div>

                {/* Top-Right HUD Slide Counter */}
                <div className="absolute top-6 right-8 font-mono text-sm tracking-widest text-white/30 select-none">
                  {String(idx + 1).padStart(2, "0")}
                </div>
              </div>
            );
          })}
        </div>

        {/* HUD Progress Indicator Bottom HUD block */}
        <div className="w-full flex justify-center relative z-30 select-none">
          {!isLocked ? (
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 font-mono text-xs md:text-sm tracking-widest text-white/50 bg-black/40 px-6 py-3.5 rounded-full border border-white/5 backdrop-blur-md">
              <button 
                onClick={() => {
                  const target = document.getElementById("projects");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-primary transition-colors cursor-pointer text-[10px] md:text-xs uppercase font-extrabold tracking-wider border-r border-white/10 pr-4 md:pr-6 mr-1"
              >
                Skip Up ↑
              </button>
              
              <button 
                className="hover:text-primary transition-colors cursor-pointer font-bold text-base px-1 active:scale-95"
                onClick={() => {
                  const trigger = ScrollTrigger.getById("projects-pin");
                  if (trigger) {
                    const start = trigger.start;
                    const total = trigger.end - start;
                    const pauseTimes = [0.04, 0.33, 0.63, 0.94];
                    window.scrollTo({
                      top: start + pauseTimes[0] * total,
                      behavior: "smooth"
                    });
                  }
                }}
                aria-label="Previous Project"
              >
                ←
              </button>

              <span ref={counterRef} className="text-primary font-bold min-w-[20px] text-center">01</span>
              <div className="w-[80px] md:w-[150px] h-[2px] bg-white/10 relative rounded-full overflow-hidden">
                <div ref={progressBarRef} className="h-full bg-primary absolute top-0 left-0 w-0" />
              </div>
              <span>{String(PROJECTS_DATA.length).padStart(2, "0")}</span>

              <button 
                className="hover:text-primary transition-colors cursor-pointer font-bold text-base px-1 active:scale-95"
                onClick={() => {
                  const trigger = ScrollTrigger.getById("projects-pin");
                  if (trigger) {
                    const start = trigger.start;
                    const total = trigger.end - start;
                    const pauseTimes = [0.04, 0.33, 0.63, 0.94];
                    window.scrollTo({
                      top: start + pauseTimes[1] * total,
                      behavior: "smooth"
                    });
                  }
                }}
                aria-label="Next Project"
              >
                →
              </button>

              <button 
                onClick={() => {
                  const target = document.getElementById("galactic-archive");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-primary transition-colors cursor-pointer text-[10px] md:text-xs uppercase font-extrabold tracking-wider border-l border-white/10 pl-4 md:pl-6 ml-1"
              >
                Skip Down ↓
              </button>
            </div>
          ) : (
            // Premium glass panel invitation HUD shown when reverse scroll is locked
            <div className="w-full max-w-xl mx-auto px-6 py-4 rounded-2xl border border-primary/30 bg-[#0c0806]/95 backdrop-blur-md text-center shadow-[0_0_50px_rgba(233,177,93,0.2)] animate-[fadeIn_0.4s_ease-out] z-40">
              <h4 className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">Mission Archive Complete</h4>
              <p className="text-white/60 text-[10px] md:text-xs leading-relaxed mb-3">
                The completed mission has been archived. Unlock the archive if you&apos;d like to revisit previous projects.
              </p>
              <button 
                onClick={handleUnlock}
                className="px-6 py-2 rounded-full bg-primary hover:bg-white text-black font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-[0_0_15px_rgba(233,177,93,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] cursor-pointer"
              >
                Unlock Projects
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reused pop-up Modal details panel (retains exact identical styles and Framer Motion context) */}
      {selectedProject && (
        <ProjectDetailsPanel
          selectedProject={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Floating Skip-Up Button (visible only when scrolling up inside the projects gallery) */}
      <button 
        onClick={() => {
          const target = document.getElementById("tools");
          if (target) {
            const yOffset = -100; // scroll 100px above the tools heading
            const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }}
        className="skip-up-floating-btn fixed bottom-8 right-8 z-[9999] opacity-0 pointer-events-none translate-y-4 bg-[#0a0705]/95 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-black shadow-[0_0_20px_rgba(233,177,93,0.15)] hover:shadow-[0_0_30px_rgba(233,177,93,0.4)] px-5 py-3 rounded-full font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-300 transform select-none"
      >
        <span>Skip to Tools</span>
        <ArrowRight className="w-4 h-4 -rotate-90 transition-transform duration-300" />
      </button>

      {/* Styled animation CSS and overrides */}
      <style jsx global>{`
        /* Initial styling targets for cards when NOT locked (controlled by GSAP) */
        .project-card-0 {
          transform: translate3d(0, 0, 0) scale(1);
          opacity: 1;
          pointer-events: auto;
          z-index: 4;
          border-color: rgba(233, 177, 93, 0.55);
          box-shadow: 0 0 80px rgba(233, 177, 93, 0.25);
        }
        .project-card-1 {
          transform: translate3d(110vw, 0, 0) scale(0.92);
          opacity: 0;
          z-index: 3;
          pointer-events: none;
        }
        .project-card-2 {
          transform: translate3d(110vw, 0, 0) scale(0.92);
          opacity: 0;
          z-index: 2;
          pointer-events: none;
        }
        .project-card-3 {
          transform: translate3d(110vw, 0, 0) scale(0.92);
          opacity: 0;
          z-index: 1;
          pointer-events: none;
        }

        /* Declarative CSS styles overriding GSAP when scroll trigger is locked */
        .projects-container.is-locked .project-card-0 {
          transform: translate3d(-43vw, 0, 0) scale(0.32) !important;
          opacity: 1.0 !important; /* Keep 100% opaque */
          z-index: 1 !important;
          border-color: rgba(233, 177, 93, 0.4) !important;
          box-shadow: 0 0 10px rgba(233, 177, 93, 0.1) !important;
          pointer-events: none !important;
        }
        .projects-container.is-locked .project-card-1 {
          transform: translate3d(-43vw, -12px, 0) scale(0.32) !important;
          opacity: 1.0 !important; /* Keep 100% opaque */
          z-index: 2 !important;
          border-color: rgba(233, 177, 93, 0.4) !important;
          box-shadow: 0 0 10px rgba(233, 177, 93, 0.1) !important;
          pointer-events: none !important;
        }
        .projects-container.is-locked .project-card-2 {
          transform: translate3d(-43vw, -24px, 0) scale(0.32) !important;
          opacity: 1.0 !important; /* Keep 100% opaque */
          z-index: 3 !important;
          border-color: rgba(233, 177, 93, 0.4) !important;
          box-shadow: 0 0 10px rgba(233, 177, 93, 0.1) !important;
          pointer-events: none !important;
        }
        .projects-container.is-locked .project-card-3 {
          transform: translate3d(0, 0, 0) scale(1) !important;
          opacity: 1.0 !important;
          z-index: 4 !important;
          border-color: rgba(233, 177, 93, 0.55) !important;
          box-shadow: 0 0 80px rgba(233, 177, 93, 0.25) !important;
          pointer-events: auto !important;
        }

        /* Opacity visibility controls for layouts during lock states */
        .projects-container.is-locked .active-content-0,
        .projects-container.is-locked .active-content-1,
        .projects-container.is-locked .active-content-2 {
          opacity: 0 !important;
        }
        .projects-container.is-locked .active-content-3 {
          opacity: 1 !important;
        }
        .projects-container.is-locked .archive-content-0,
        .projects-container.is-locked .archive-content-1,
        .projects-container.is-locked .archive-content-2 {
          opacity: 1 !important;
        }
        .projects-container.is-locked .archive-content-3 {
          opacity: 0 !important;
        }

        @keyframes starsFloat {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100px, -200px, 0); }
        }
        @keyframes lightSweep {
          0% { transform: translate3d(-150%, 0, 0) rotate(30deg); }
          100% { transform: translate3d(250%, 0, 0) rotate(30deg); }
        }
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes colorCycle {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
