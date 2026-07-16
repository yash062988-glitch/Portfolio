"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS_DATA } from "@/constants/data";
import SectionHeading from "@/components/design-system/SectionHeading";
import ProjectDetailsPanel from "@/components/projects/ProjectDetailsPanel";
import { GithubIcon } from "@/components/Icons";
import { ArrowRight, ExternalLink } from "lucide-react";

// Register GSAP ScrollTrigger plugin safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProjectsSection() {
  const containerRef = useRef(null);
  const pinContainerRef = useRef(null);
  const sliderRef = useRef(null);
  const titlesRef = useRef(null);
  const progressBarRef = useRef(null);
  const counterRef = useRef(null);

  const [selectedProject, setSelectedProject] = useState(null);
  const [windowWidth, setWindowWidth] = useState(1200);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Calculate dynamic scroll metrics
    const totalSliderWidth = sliderRef.current.scrollWidth;
    const horizontalTravelDistance = totalSliderWidth - window.innerWidth;
    const sectionHeight = window.innerHeight + horizontalTravelDistance;

    // Apply the scroll height dynamically to the wrapper
    if (containerRef.current) {
      containerRef.current.style.height = `${sectionHeight}px`;
    }

    // 2. Initialize Master GSAP ScrollTrigger Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: pinContainerRef.current,
        scrub: 1.2, // inertia weight
        start: "top top",
        end: () => `+=${horizontalTravelDistance}`,
        invalidateOnRefresh: true,
      },
    });

    // Normalized timeline duration is 1.0
    // - First project pause: 0.0 to 0.08
    // - Horizontal travel: 0.08 to 0.92
    // - Last project pause: 0.92 to 1.0

    // Initial Pause & Card 0 text entrance
    tl.to({}, { duration: 0.08 });
    tl.fromTo(".slide-title-0", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.05, ease: "power2.out" }, 0.01);
    tl.fromTo(".slide-desc-0", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.05, ease: "power2.out" }, 0.03);
    tl.fromTo(".slide-btn-0", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.05, ease: "power2.out" }, 0.05);

    // Horizontal sliding motion of foreground track
    tl.to(sliderRef.current, {
      x: -horizontalTravelDistance,
      ease: "none",
      duration: 0.84,
    }, 0.08);

    // Background title parallax translation (moves slower at 40% speed)
    tl.to(titlesRef.current, {
      x: -horizontalTravelDistance * 0.4,
      ease: "none",
      duration: 0.84,
    }, 0.08);

    // Progress line indicator filling
    tl.to(progressBarRef.current, {
      width: "100%",
      ease: "none",
      duration: 1.0,
    }, 0.0);

    const N = PROJECTS_DATA.length;

    // Staggered active state, scale, blur, border glows, and text entrances per slide card
    PROJECTS_DATA.forEach((proj, idx) => {


      // Trigger timeline events as cards scroll past center
      const centerTime = 0.08 + (idx / (N - 1)) * 0.84;
      const transDuration = 0.12;

      // Update counter DOM text content dynamically on scroll scrubbing direction
      tl.call(() => {
        if (counterRef.current) {
          counterRef.current.textContent = String(idx + 1).padStart(2, "0");
        }
      }, null, Math.max(0.01, centerTime - 0.05));

      // Transition effects for active vs adjacent cards
      if (idx > 0) {
        const enterTime = centerTime - transDuration * 2.0;
        const exitTime = centerTime + transDuration * 1.0;

        // 1. Enter state (comes from right edge: fade in to adjacent opacity 0.45)
        tl.to(`.project-card-${idx}`, {
          opacity: 0.45,
          autoAlpha: 1,
          scale: 0.94,
          borderColor: "rgba(255, 255, 255, 0.12)",
          boxShadow: "none",
          duration: transDuration,
          ease: "power2.out"
        }, enterTime);

        // 2. Active state (reaches center: scale up to 1.0, opacity 1.0, gold glow)
        tl.to(`.project-card-${idx}`, {
          scale: 1.0,
          opacity: 1.0,
          borderColor: "rgba(233, 177, 93, 0.55)",
          boxShadow: "0 0 80px rgba(233, 177, 93, 0.25)",
          duration: transDuration,
          ease: "power2.out"
        }, centerTime - transDuration);

        // 3. Staggered text animations entering slide
        tl.fromTo(`.slide-title-${idx}`, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.08, ease: "power2.out" }, centerTime - transDuration + 0.01);
        tl.fromTo(`.slide-desc-${idx}`, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.08, ease: "power2.out" }, centerTime - transDuration + 0.03);
        tl.fromTo(`.slide-btn-${idx}`, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.08, ease: "power2.out" }, centerTime - transDuration + 0.05);

        // 4. Scale down previous card to adjacent state
        tl.to(`.project-card-${idx - 1}`, {
          scale: 0.94,
          opacity: 0.45,
          borderColor: "rgba(255, 255, 255, 0.12)",
          boxShadow: "none",
          duration: transDuration,
          ease: "power2.out"
        }, centerTime - transDuration);

        // 5. Exit state (leaves left edge: fade out completely to opacity 0, autoAlpha 0)
        tl.to(`.project-card-${idx - 1}`, {
          opacity: 0,
          autoAlpha: 0,
          duration: transDuration,
          ease: "power2.in"
        }, exitTime);
      }
    });

    // End Pause before unpinning
    tl.to({}, { duration: 0.08 });

    // 3. Cleanup on unmount
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [windowWidth]);

  // Card mouse-move parallax effect
  const handleMouseMove = (e, idx) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Max 3px parallax displacement
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
    const card = e.currentTarget;
    gsap.to(card, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-visible z-10 bg-black">
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
              backgroundImage: "radial-gradient(1px 1px at 40px 60px, #ffffff, transparent), radial-gradient(1.5px 1.5px at 120px 200px, #e9b15d, transparent), radial-gradient(2px 2px at 250px 350px, #ffffff, transparent)",
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

        {/* Layer 1: Giant Background Typography Parallax (40% Speed) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 flex items-center">
          <div 
            ref={titlesRef} 
            className="flex flex-row items-center gap-[50vw] pl-[25vw] select-none will-change-transform opacity-[0.08]"
          >
            {PROJECTS_DATA.map((proj, idx) => {
              const backdropTexts = ["PROJECTS", "CREATIONS", "MISSIONS", "GALLERY"];
              return (
                <div 
                  key={proj.id} 
                  className="text-[18vw] md:text-[22vw] font-black uppercase tracking-widest whitespace-nowrap leading-none text-white select-none"
                >
                  {backdropTexts[idx] || "PROJECTS"}
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer 2: Foreground Slides Card Track (Z-20) */}
        <div 
          ref={sliderRef} 
          className="flex flex-row items-center h-[55vh] md:h-[62vh] pl-[20vw] select-none will-change-transform z-20 overflow-visible"
        >
          {PROJECTS_DATA.map((project, idx) => {
            const isPlaceholder = project.isPlaceholder;
            const isFirst = idx === 0;

            return (
              <div 
                key={project.id}
                className="w-[95vw] md:w-[60vw] h-full flex-shrink-0 flex items-center justify-center overflow-visible pr-[8vw] md:pr-[12vw]"
              >
                {/* Hero Card Container */}
                <div
                  onMouseMove={(e) => handleMouseMove(e, idx)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    if (isPlaceholder) {
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                      return;
                    }
                    setSelectedProject(project);
                  }}
                  className={`project-card-${idx} relative w-full h-full rounded-[32px] border border-white/10 bg-[#0a0705] shadow-2xl flex flex-col justify-end overflow-hidden cursor-pointer select-none transition-all duration-300 will-change-transform`}
                  style={{
                    scale: isFirst ? 1.0 : 0.94,
                    opacity: isFirst ? 1.0 : 0,
                    visibility: isFirst ? "visible" : "hidden",
                    borderColor: isFirst ? "rgba(233, 177, 93, 0.55)" : "rgba(255, 255, 255, 0.12)",
                    boxShadow: isFirst ? "0 0 80px rgba(233, 177, 93, 0.25)" : "none"
                  }}
                >
                  {/* Subtle golden light sweep (ambient motion) */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-20 opacity-20"
                    style={{
                      background: "linear-gradient(110deg, transparent 40%, rgba(233,177,93,0.1) 45%, rgba(233,177,93,0.2) 50%, rgba(233,177,93,0.1) 55%, transparent 60%)",
                      backgroundSize: "200% 100%",
                      animation: "lightSweep 12s linear infinite"
                    }}
                  />

                  {/* Fixed Image Frame (Main visual) */}
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

                  {/* Text Overlay Details */}
                  <div className="relative z-30 p-6 md:p-12 flex flex-col items-start gap-2.5 md:gap-4 select-text">
                    <span className="text-[10px] font-mono tracking-widest text-primary/80 uppercase font-bold select-none">
                      {project.category}
                    </span>

                    <h3 className={`slide-title-${idx} text-2xl md:text-5xl font-extrabold text-white leading-none uppercase tracking-tight select-none`}>
                      {project.title}
                    </h3>

                    <p className={`slide-desc-${idx} text-xs md:text-sm text-white/70 max-w-[460px] leading-relaxed font-light mt-1 md:mt-2`}>
                      {project.shortDesc}
                    </p>

                    {/* Circular Gold arrow button */}
                    <div className={`slide-btn-${idx} mt-3 md:mt-5 flex-shrink-0 select-none`}>
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

                  {/* Top-Right HUD Slide Counter */}
                  <div className="absolute top-6 right-8 font-mono text-sm tracking-widest text-white/30 select-none">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HUD Progress Indicator HUD Bottom Centre */}
        <div className="w-full flex justify-center relative z-30 select-none">
          <div className="flex items-center gap-6 font-mono text-xs md:text-sm tracking-widest text-white/50">
            <span ref={counterRef} className="text-primary font-bold">01</span>
            <div className="w-[120px] md:w-[180px] h-[2px] bg-white/10 relative rounded-full overflow-hidden">
              <div ref={progressBarRef} className="h-full bg-primary absolute top-0 left-0 w-0" />
            </div>
            <span>{String(PROJECTS_DATA.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>

      {/* Reused pop-up Modal details panel (retains exact identical styles and Framer Motion context) */}
      {selectedProject && (
        <ProjectDetailsPanel
          selectedProject={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Styled animation Keyframes */}
      <style jsx global>{`
        @keyframes starsFloat {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100px, -200px, 0); }
        }
        @keyframes lightSweep {
          0% { transform: translate3d(-150%, 0, 0) rotate(30deg); }
          100% { transform: translate3d(250%, 0, 0) rotate(30deg); }
        }
      `}</style>
    </div>
  );
}
