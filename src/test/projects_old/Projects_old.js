"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECTS_DATA } from "@/constants/data";
import SectionHeading from "@/components/design-system/SectionHeading";
import ProjectScene from "@/components/projects/ProjectScene";
import ProjectDetailsPanel from "@/components/projects/ProjectDetailsPanel";
import useOrbitPhysics from "@/components/projects/useOrbitPhysics";

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [selectedProject, setSelectedProject] = useState(null);

  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.05 });
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Filters categories list
  const categories = ["All", "AI", "Web", "Machine Learning", "Data Analysis", "UI Design"];

  // Filter projects dynamically based on query and active filter
  const filteredProjects = PROJECTS_DATA.filter((project) => {
    const matchesCategory =
      activeCategory === "All" ||
      project.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const N = filteredProjects.length;

  // Repeat projects list dynamically to hit a minimum target count of 10 items (keeps duplicates completely off-screen)
  const minCards = 10;
  const repeatCount = N > 0 ? Math.max(1, Math.ceil(minCards / N)) : 0;
  const repeatedProjects = [];
  for (let i = 0; i < repeatCount; i++) {
    filteredProjects.forEach((proj, idx) => {
      repeatedProjects.push({
        ...proj,
        uniqueId: `${proj.id}-rep-${i}-${idx}` // Unique key guarantee
      });
    });
  }

  // Caching DOM references and physics states
  const containerRef = useRef(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0.12); // slow rotation velocity (deg/frame)
  const targetVelocityRef = useRef(0.12);
  const dragVelocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startAngleRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasDraggedRef = useRef(false); // Threshold tracker to separate click from drag
  const isPausedRef = useRef(false);

  // Recalculate dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 600
        });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set up orbit physics hook for dragging gestures
  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  } = useOrbitPhysics({
    angleRef,
    velocityRef,
    targetVelocityRef,
    dragVelocityRef,
    isDraggingRef,
    startXRef,
    startYRef,
    startAngleRef,
    lastXRef,
    lastTimeRef,
    hasDraggedRef,
    dimensions,
    selectedProject
  });

  // Radius R in Three.js units (expanded to occupy 90-95% of screen width)
  const R = dimensions.width < 768 ? 1.35 : 1.90;

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative w-full h-[900px] lg:h-[950px] bg-transparent overflow-hidden flex flex-col justify-start py-12 md:py-16 select-none border-b border-white/5"
    >
      {/* Volumetric Spotlight */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[75%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(233,177,93,0.035)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute inset-0 bg-noise opacity-[0.015]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-start gap-8">

        {/* Section Heading */}
        <div className="relative z-30">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <SectionHeading
              label="Missions"
              title="Featured Projects"
              description="Explore a curated selection of my work spanning frontend platforms, machine learning pipelines, and semantic AI tools."
              className="!mb-0 flex-grow"
            />

            {/* Search bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <input
                type="text"
                placeholder="Search missions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 rounded-full border border-white/10 bg-[#0c0806]/60 text-xs text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 backdrop-blur-md shadow-lg"
              />
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/30" />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer select-none ${activeCategory === category
                    ? "bg-primary text-[#120c08] shadow-[0_0_15px_rgba(233,177,93,0.25)]"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport container with R3F canvas Scene */}
        <div 
          ref={sectionRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex-grow w-full flex items-center justify-center relative overflow-hidden pointer-events-auto"
        >
          {N === 0 ? (
            <div className="text-center text-white/40 text-sm">No missions found matching query criteria.</div>
          ) : inView ? (
            <ProjectScene
              repeatedProjects={repeatedProjects}
              angleRef={angleRef}
              velocityRef={velocityRef}
              targetVelocityRef={targetVelocityRef}
              dragVelocityRef={dragVelocityRef}
              isDraggingRef={isDraggingRef}
              selectedProject={selectedProject}
              onSelect={(proj) => {
                if (proj.isPlaceholder) {
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  return;
                }
                isPausedRef.current = true;
                setSelectedProject(proj);
              }}
              R={R}
            />
          ) : (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center text-white/20 text-xs">
              Loading interactive orbit...
            </div>
          )}
        </div>

      </div>

      {/* HTML Details Modal Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailsPanel
            selectedProject={selectedProject}
            onClose={() => {
              setSelectedProject(null);
              isPausedRef.current = false;
              lastTimeRef.current = performance.now();
            }}
          />
        )}
      </AnimatePresence>

    </section>
  );
}
