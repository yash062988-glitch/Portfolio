"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { 
  User, GraduationCap, Briefcase, Globe, 
  MapPin, Quote
} from "lucide-react";
import MeshText from "@/components/design-system/MeshText";

const AboutSlideshow = ({ fallbackImage, parentX, parentY }) => {
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const activeTimerRef = useRef(null);
  const [isInView, setIsInView] = useState(true); // Default true so it starts playing immediately
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    fetch('/api/about-images')
      .then(res => res.json())
      .then(data => {
        console.log("About Page Slideshow Images:", data);
        if (Array.isArray(data) && data.length > 0) {
          setImages(data);
        }
      })
      .catch(err => {
        console.error("About Page Slideshow Fetch Error:", err);
      });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.05 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (images.length <= 1 || !isInView) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIdx + 1) % images.length;
      setNextIdx(nextIndex);
      console.log(`Transitioning: ${activeIdx} -> ${nextIndex} (${images[nextIndex]})`);
      
      if (prefersReducedMotion) {
        setActiveIdx(nextIndex);
      } else {
        setIsTransitioning(true);
        activeTimerRef.current = setTimeout(() => {
          setActiveIdx(nextIndex);
          setIsTransitioning(false);
        }, 800);
      }
    }, 2300); // 1.5s display + 0.8s transition

    return () => {
      clearInterval(interval);
      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
      }
    };
  }, [images, activeIdx, isInView, prefersReducedMotion]);

  if (images.length === 0) {
    return (
      <motion.div
        className="w-full h-full relative rounded-[22px] overflow-hidden"
        style={{ x: parentX, y: parentY }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <Image
          src={fallbackImage}
          alt="Yash Jain Portrait Fallback"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover rounded-[22px] filter brightness-[0.92] group-hover:brightness-[0.98]"
        />
      </motion.div>
    );
  }

  const currentImgSrc = `/api/about-images?name=${images[activeIdx]}`;
  const nextImgSrc = `/api/about-images?name=${images[nextIdx]}`;

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden rounded-[22px]">
      <motion.div
        className="w-full h-full relative rounded-[22px] overflow-hidden"
        style={{ x: parentX, y: parentY }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Layer 1 (Bottom image) */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={currentImgSrc}
            alt="Yash Jain Slideshow Base"
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover rounded-[22px] filter brightness-[0.92] group-hover:brightness-[0.98]"
          />
        </div>

        {/* Layer 2 (Top image, crossfades on top of Layer 1) */}
        <div 
          className="absolute inset-0 w-full h-full opacity-0"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transition: prefersReducedMotion ? 'none' : 'opacity 800ms cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          <Image
            src={nextImgSrc}
            alt="Yash Jain Slideshow Overlay"
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover rounded-[22px] filter brightness-[0.92] group-hover:brightness-[0.98]"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default function About({ portraitImage = "/images/about section image.png" }) {
  const portraitX = useMotionValue(0);
  const portraitY = useMotionValue(0);
  const springConfig = { stiffness: 120, damping: 20 };
  const smoothX = useSpring(portraitX, springConfig);
  const smoothY = useSpring(portraitY, springConfig);
  const [activeTab, setActiveTab] = useState(0);
  const [resetTimer, setResetTimer] = useState(0);
  const tabs = ["Education", "Interests", "Goals", "Mission"];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [resetTimer]);
  const handlePortraitMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    portraitX.set(x * 12); 
    portraitY.set(y * 12);
  };

  const handlePortraitMouseLeave = () => {
    portraitX.set(0);
    portraitY.set(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const hoverConfig = {
    y: -10,
    scale: 1.025,
    borderColor: "rgba(var(--accent-glow-raw), 0.65)",
    boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px rgba(var(--accent-glow-raw), 0.25)"
  };

  const transitionConfig = { duration: 0.35, ease: "easeOut" };

  const outlineFocusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  return (
    <section id="about" className="relative w-full pt-44 pb-28 md:pt-48 md:pb-32 bg-transparent overflow-hidden">
      {/* Background spotlights & texture noise */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[radial-gradient(circle,rgba(233, 177, 93, 0.05)_0%,transparent_70%)] blur-[95px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(255,221,168,0.035)_0%,transparent_75%)] blur-[90px] pointer-events-none z-0" />

      {/* Space Theme Background Integration Layer (Constellations & Orbitals) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 select-none">
        <svg className="absolute w-full h-full text-primary" fill="none">
          <defs>
            <filter id="orbitGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Constellation lines */}
          <g opacity="0.08">
            <line x1="15%" y1="20%" x2="35%" y2="40%" stroke="currentColor" strokeWidth="0.5" />
            <line x1="35%" y1="40%" x2="55%" y2="25%" stroke="currentColor" strokeWidth="0.5" />
            <line x1="55%" y1="25%" x2="75%" y2="45%" stroke="currentColor" strokeWidth="0.5" />
            <line x1="35%" y1="40%" x2="30%" y2="70%" stroke="currentColor" strokeWidth="0.5" />
          </g>

          {/* Smooth giant orbital curve */}
          <path 
            d="M -100 200 C 300 400, 800 -100, 1500 300" 
            stroke="currentColor" 
            strokeWidth="0.75" 
            opacity="0.12" 
            filter="url(#orbitGlow)" 
          />
          <path 
            d="M -100 200 C 300 400, 800 -100, 1500 300" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            opacity="0.06" 
          />
          
          {/* One bright star along the orbit */}
          <g transform="translate(600, 182)">
            <circle cx="0" cy="0" r="1.5" fill="#ffffff" filter="url(#orbitGlow)" />
            <path d="M-6 0 L6 0 M0 -6 L0 6" stroke="#E9B15D" strokeWidth="0.5" opacity="0.4" />
          </g>
        </svg>
        <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-[#E9B15D]/60 rounded-full animate-pulse blur-[0.5px]" />
        <div className="absolute top-[45%] left-[75%] w-1.5 h-1.5 bg-[#E9B15D]/40 rounded-full animate-pulse blur-[0.5px]" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[80%] left-[40%] w-1 h-1 bg-[#E9B15D]/50 rounded-full animate-pulse blur-[0.5px]" style={{ animationDelay: "3s" }} />
      </div>

      {/* Main Container holding both separate structures */}
      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-6 flex flex-col gap-14">
        
        {/* HeaderContainer (Sits cleanly above the CardsContainer grid) */}
        <div className="flex flex-col gap-5 max-w-3xl pl-0">
          <span className="text-[12px] font-bold tracking-[0.25em] text-primary uppercase select-none">
            GET TO KNOW ME
          </span>
          <MeshText
            text="About Me"
            className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-white tracking-[0.05em] leading-none"
            as="h2"
          />
          <p className="text-white/60 text-xs md:text-sm lg:text-base font-light leading-relaxed mt-3 max-w-3xl">
            I'm a passionate developer who loves building <span className="text-primary font-medium">intelligent</span>, user-centric digital experiences.
          </p>
        </div>

        {/* CardsContainer Grid (Utilizing a 24-column grid for pixel-perfect card widths) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-24 gap-8 items-stretch animate-fade-in"
        >
          {/* 1. LEFT COLUMN: VISUAL CARD WRAPPER (Occupies 3 rows) */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:row-span-3 flex flex-col relative order-1">
            {/* Decorative horizontal lines above the image card */}
            <div className="w-full flex flex-col gap-2 mb-6 pointer-events-none opacity-30 select-none">
              <div className="relative w-full h-[1px] bg-gradient-to-r from-primary/40 via-primary/10 to-transparent">
                <div className="absolute right-1/4 -top-[1.5px] w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(233,177,93,0.8)] animate-pulse" />
              </div>
              <div className="relative w-[75%] h-[1px] bg-gradient-to-r from-primary/25 via-primary/5 to-transparent">
                <div className="absolute right-[10%] -top-[1.5px] w-1 h-1 rounded-full bg-primary/70 shadow-[0_0_6px_rgba(233,177,93,0.6)] animate-pulse" style={{ animationDelay: "1.2s" }} />
              </div>
            </div>

            {/* The Image Card itself */}
            <motion.div
              variants={cardVariants}
              onMouseMove={handlePortraitMouseMove}
              onMouseLeave={handlePortraitMouseLeave}
              whileHover={{ 
                y: -10,
                scale: 1.025,
                boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px rgba(var(--accent-glow-raw), 0.25)",
                borderColor: "rgba(var(--accent-glow-raw), 0.65)"
              }}
              transition={transitionConfig}
              tabIndex={0}
              aria-label="Yash Jain portrait presentation card"
              className={`flex-grow min-h-[550px] lg:min-h-[640px] bg-[#120c08]/20 border border-[#E9B15D]/25 rounded-[30px] backdrop-blur-xl relative overflow-hidden group flex flex-col justify-between shadow-2xl transition-all duration-500 cursor-pointer ${outlineFocusClasses}`}
            >
              {/* Ambient gold spotlight behind image */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#E9B15D]/[0.03] via-[#2a1a10]/5 to-black/80 z-10 pointer-events-none" />
              <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(233,177,93,0.1)_0%,transparent_70%)] blur-2xl opacity-50 pointer-events-none z-0" />
              
              {/* Subtle glass shimmer hover swipe */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out z-30 pointer-events-none" />

              {/* Portrait Image Container (Slideshow) */}
              <div className="absolute inset-0 z-20 p-4">
                <AboutSlideshow 
                  fallbackImage={portraitImage}
                  parentX={smoothX}
                  parentY={smoothY}
                />
              </div>

              {/* Bottom floating badge */}
              <div className="absolute bottom-8 left-8 z-30">
                <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#120c08]/50 border border-[#E9B15D]/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-lg backdrop-blur-md transition-all duration-300 group-hover:border-[#E9B15D]/40 whitespace-nowrap">
                  Explorer • Builder • Learner
                </span>
              </div>
            </motion.div>
          </div>

          {/* 2. TOP CENTER: ABOUT ME CARD (Column 2 - Row 1) */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="About Yash Jain summary details"
            className={`col-span-12 lg:col-span-10 lg:col-start-8 lg:row-start-1 p-8 glass-card rounded-[30px] flex flex-col justify-between min-h-[260px] order-2 ${outlineFocusClasses}`}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40">ABOUT ME</span>
              <User className="w-4 h-4 text-primary/40" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-white mb-5 tracking-wide">Yash Jain</h3>
              <div className="flex flex-col gap-2.5 mb-6 text-[12px] uppercase tracking-wider font-semibold text-primary/95">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Full Stack Developer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>AI Enthusiast</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Creative Developer</span>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed font-light mt-6 pt-6 border-t border-white/5">
                I build <span className="text-primary font-medium">modern web applications</span> powered by <span className="text-primary font-medium">AI</span>, <span className="text-primary font-medium">scalable engineering</span>, and <span className="text-primary font-medium">thoughtful design</span>. I enjoy creating <span className="text-primary font-medium">clean digital experiences</span> that solve real-world problems.
              </p>
            </div>
          </motion.div>

          {/* 3. TOP RIGHT: DYNAMIC MULTI-TAB CARD (Column 3 - Row 1) */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="Education, Interests, Goals, and Mission details"
            className={`col-span-12 lg:col-span-7 lg:col-start-18 lg:row-start-1 p-8 glass-card rounded-[30px] flex flex-col justify-between min-h-[385px] order-3 ${outlineFocusClasses}`}
          >
            {/* Tab Navigation header */}
            <div className="flex items-center justify-between mb-6 gap-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full">
                {tabs.map((tab, idx) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(idx);
                      setResetTimer(prev => prev + 1);
                    }}
                    className={`text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded transition-all duration-300 ${
                      activeTab === idx
                        ? "border border-primary/30 text-primary bg-primary/10 shadow-[0_0_8px_rgba(233,177,93,0.1)]"
                        : "text-white/40 border border-transparent hover:text-white/60 hover:bg-white/[0.01]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <GraduationCap className="w-4 h-4 text-primary/45 flex-shrink-0 ml-2" />
            </div>

            {/* Dynamic Content Panel */}
            <div className="flex-grow flex flex-col justify-start">
              {activeTab === 0 && (
                <div className="flex flex-col gap-5">
                  {/* Item 1: Bachelors */}
                  <div className="relative pl-5 border-l border-primary/30 pb-1">
                    <div className="absolute left-[-5.5px] top-[5px] w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_rgba(233,177,93,0.8)] animate-pulse" />
                    <div className="flex flex-col mb-1">
                      <span className="text-[11px] font-bold text-white leading-tight uppercase tracking-wide">
                        Bachelors in Physical Science with Computer Science
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono text-white/45 uppercase tracking-wider">
                          2024 - 2027 // Delhi University
                        </span>
                        <span className="text-[8px] font-mono font-bold text-primary border border-primary/20 px-1.5 py-0.5 rounded bg-primary/5 uppercase select-none leading-none">
                          Current
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Item 2: Class 12 */}
                  <div className="relative pl-5 border-l border-white/10 pb-1">
                    <div className="absolute left-[-4.5px] top-[6px] w-2 h-2 rounded-full border border-primary/45 bg-[#120c08]" />
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-tight">
                        Class 12 (Higher Secondary)
                      </span>
                      <span className="text-[8px] font-mono text-white/35 flex-shrink-0">2024</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/45 uppercase tracking-wider block mb-2 leading-none">
                      Vivekanand International School
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {["Physics", "Chemistry", "Mathematics", "Computer Science"].map((tag) => (
                        <span key={tag} className="text-[7.5px] font-semibold bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded text-white/40">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Item 3: Class 10 */}
                  <div className="relative pl-5">
                    <div className="absolute left-[-4.5px] top-[6px] w-2 h-2 rounded-full border border-primary/45 bg-[#120c08]" />
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-tight">
                        Class 10 (Secondary)
                      </span>
                      <span className="text-[8px] font-mono text-white/35 flex-shrink-0">2022</span>
                    </div>
                    <span className="text-[9px] font-mono text-white/45 uppercase tracking-wider block mb-1.5 leading-none">
                      Vivekanand International School
                    </span>
                    <p className="text-[9px] text-white/35 font-light leading-relaxed">
                      Strong academic foundation in Mathematics and Science.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="flex flex-col gap-4">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-primary/85 block mb-1">
                    SKILL PATHWAYS & INTERESTS
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Generative AI", desc: "LLMs, RAG, Agents" },
                      { name: "Web Development", desc: "Next.js, Canvas, WebGL" },
                      { name: "Graphic Designing", desc: "UI/UX, 3D Assets" },
                      { name: "Data Analysis", desc: "Python, Visual Models" },
                      { name: "Interactive UI", desc: "Physics simulations" },
                      { name: "Space Cosmology", desc: "Astrophysics mapping" }
                    ].map((item) => (
                      <div key={item.name} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:border-primary/10 transition-colors duration-300">
                        <span className="text-[10px] font-bold text-white/80 block uppercase tracking-wide mb-0.5">{item.name}</span>
                        <span className="text-[8px] text-white/45 block font-light leading-none">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="flex flex-col gap-4">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-primary/85 block mb-1">
                    SHORT & LONG TERM GOALS
                  </span>
                  <ul className="flex flex-col gap-3">
                    {[
                      "Continuously learning and developing new technologies.",
                      "Architecting highly scalable AI-human hybrid software solutions.",
                      "Designing futuristic, interactive 3D web interfaces.",
                      "Mastering real-time rendering technologies and high-fidelity animations.",
                      "Contributing to open-source developer tooling and graphics engines."
                    ].map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-primary font-bold text-[10px] mt-0.5">→</span>
                        <p className="text-[10px] text-white/70 font-light leading-relaxed">{goal}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 3 && (
                <div className="flex flex-col gap-4 justify-center h-full pt-2">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-primary/85 block mb-1">
                    CORE MISSION STATEMENT
                  </span>
                  <div className="relative pl-6 py-2 border-l-2 border-primary/20">
                    <Quote className="absolute left-2 top-0 w-3 h-3 text-primary/30 transform -scale-x-100" />
                    <p className="text-[11px] text-white/80 font-light leading-relaxed italic mb-4">
                      "To bridge the gap between creative visual artistry and complex backend/AI architecture, crafting interactive digital universes that inspire curiosity."
                    </p>
                    <p className="text-[10px] text-white/60 font-light leading-relaxed">
                      Building applications that are not just functional, but visually spectacular and emotionally engaging.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 4. MIDDLE CENTER: EXPERIENCE CARD (Column 2 - Row 2 - Reduced Width) */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="Experience floating technology chips"
            className={`col-span-12 lg:col-span-9 lg:col-start-8 lg:row-start-2 p-8 glass-card rounded-[30px] flex flex-col justify-between min-h-[150px] order-4 ${outlineFocusClasses}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40">EXPERIENCE</span>
              <Briefcase className="w-4 h-4 text-primary/40" />
            </div>
            <div>
              <div className="flex flex-wrap gap-2.5">
                {["Freelance", "Full Stack", "AI Projects", "UI Engineering", "Open Source"].map((chip, idx) => (
                  <motion.span 
                    key={`${chip}-${idx}`} 
                    whileHover={{ y: -3, borderColor: "rgba(233, 177, 93, 0.4)", color: "#E9B15D" }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="inline-flex items-center h-8 px-4 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-bold uppercase tracking-wider text-white/80 select-none cursor-default transition-colors duration-300"
                  >
                    {chip}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 5. RIGHT MIDDLE COLUMN: LOCATION & LANGUAGES SIDE-BY-SIDE (Column 3 - Row 2 - Expanded Width) */}
          <div className="col-span-12 lg:col-span-8 lg:col-start-17 lg:row-start-2 grid grid-cols-2 gap-8 order-5">
            {/* LOCATION CARD (With glowing Earth wireframe hologram) */}
            <motion.div
              variants={cardVariants}
              whileHover={hoverConfig}
              transition={transitionConfig}
              tabIndex={0}
              aria-label="Location detail card"
              className={`p-6 glass-card rounded-[30px] flex flex-col justify-between min-h-[150px] relative overflow-hidden ${outlineFocusClasses}`}
            >
              <div className="flex items-center justify-between mb-3 z-10">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-white/40">Based In</span>
                <MapPin className="w-3.5 h-3.5 text-primary/40" />
              </div>
              <div className="z-10 mb-auto">
                <h3 className="text-[15px] font-bold text-white mb-0.5 leading-snug">Delhi, India</h3>
                <span className="text-white/40 text-[9px] font-mono tracking-wider">IST (UTC +5:30)</span>
              </div>

              {/* Glowing Wireframe Globe Hologram */}
              <div className="absolute bottom-[-15%] right-[-10%] w-32 h-32 opacity-75 pointer-events-none select-none z-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-primary" fill="none">
                  <defs>
                    <filter id="globeGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <mask id="sphereMask">
                      <circle cx="50" cy="50" r="40" fill="#ffffff" />
                    </mask>
                  </defs>

                  {/* Atmospheric haze outer glow */}
                  <circle cx="50" cy="50" r="41" stroke="#E9B15D" strokeWidth="0.5" opacity="0.15" filter="url(#globeGlow)" />
                  <circle cx="50" cy="50" r="40" stroke="#E9B15D" strokeWidth="1" opacity="0.4" filter="url(#globeGlow)" />

                  {/* Latitudes */}
                  <ellipse cx="50" cy="50" rx="40" ry="8" stroke="#E9B15D" strokeWidth="0.5" opacity="0.2" />
                  <ellipse cx="50" cy="50" rx="40" ry="20" stroke="#E9B15D" strokeWidth="0.5" opacity="0.2" />
                  <ellipse cx="50" cy="50" rx="40" ry="32" stroke="#E9B15D" strokeWidth="0.5" opacity="0.15" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="#E9B15D" strokeWidth="0.5" opacity="0.3" />

                  {/* Rotating Globe Content masked to a sphere */}
                  <g mask="url(#sphereMask)">
                    {/* Rotating Longitudes */}
                    <g opacity="0.35">
                      <path d="M 50 10 A 40 40 0 0 0 50 90" stroke="#E9B15D" strokeWidth="0.5">
                        <animate attributeName="d" 
                          values="M 50 10 A 0 40 0 0 0 50 90; M 50 10 A 15 40 0 0 0 50 90; M 50 10 A 30 40 0 0 0 50 90; M 50 10 A 40 40 0 0 0 50 90; M 50 10 A 30 40 0 0 1 50 90; M 50 10 A 15 40 0 0 1 50 90; M 50 10 A 0 40 0 0 0 50 90" 
                          dur="16s" repeatCount="indefinite" />
                      </path>
                      <path d="M 50 10 A 20 40 0 0 0 50 90" stroke="#E9B15D" strokeWidth="0.5">
                        <animate attributeName="d" 
                          values="M 50 10 A 20 40 0 0 0 50 90; M 50 10 A 30 40 0 0 0 50 90; M 50 10 A 40 40 0 0 0 50 90; M 50 10 A 30 40 0 0 1 50 90; M 50 10 A 15 40 0 0 1 50 90; M 50 10 A 0 40 0 0 0 50 90; M 50 10 A 20 40 0 0 0 50 90" 
                          dur="16s" repeatCount="indefinite" />
                      </path>
                      <path d="M 50 10 A 30 40 0 0 1 50 90" stroke="#E9B15D" strokeWidth="0.5">
                        <animate attributeName="d" 
                          values="M 50 10 A 30 40 0 0 1 50 90; M 50 10 A 15 40 0 0 1 50 90; M 50 10 A 0 40 0 0 0 50 90; M 50 10 A 15 40 0 0 0 50 90; M 50 10 A 30 40 0 0 0 50 90; M 50 10 A 40 40 0 0 0 50 90; M 50 10 A 30 40 0 0 1 50 90" 
                          dur="16s" repeatCount="indefinite" />
                      </path>
                    </g>

                    {/* Dotted Abstract Landmasses */}
                    <g fill="#E9B15D" opacity="0.25">
                      <g>
                        <circle cx="25" cy="40" r="3" />
                        <circle cx="28" cy="43" r="2" />
                        <circle cx="32" cy="38" r="4" />
                        <circle cx="36" cy="41" r="3" />
                        <circle cx="65" cy="55" r="5" />
                        <circle cx="70" cy="52" r="3" />
                        <circle cx="60" cy="58" r="2" />
                        <circle cx="48" cy="30" r="4" />
                        <circle cx="52" cy="32" r="3" />
                        <animateTransform 
                          attributeName="transform" 
                          type="translate" 
                          from="-50, 0" to="50, 0" 
                          dur="16s" repeatCount="indefinite" />
                      </g>
                      <g>
                        <circle cx="75" cy="40" r="3" />
                        <circle cx="78" cy="43" r="2" />
                        <circle cx="82" cy="38" r="4" />
                        <circle cx="86" cy="41" r="3" />
                        <circle cx="115" cy="55" r="5" />
                        <circle cx="120" cy="52" r="3" />
                        <circle cx="110" cy="58" r="2" />
                        <circle cx="98" cy="30" r="4" />
                        <circle cx="102" cy="32" r="3" />
                        <animateTransform 
                          attributeName="transform" 
                          type="translate" 
                          from="-50, 0" to="50, 0" 
                          dur="16s" repeatCount="indefinite" />
                      </g>
                    </g>
                  </g>

                  {/* Sparkly particle glitter */}
                  <g opacity="0.6">
                    <circle cx="35" cy="20" r="0.6" fill="#E9B15D" className="animate-pulse" />
                    <circle cx="72" cy="75" r="0.8" fill="#E9B15D" className="animate-pulse" style={{ animationDelay: "1s" }} />
                    <circle cx="20" cy="65" r="0.5" fill="#E9B15D" className="animate-pulse" style={{ animationDelay: "1.5s" }} />
                  </g>
                  
                  {/* Blinking Location Beacon over Delhi */}
                  <g>
                    <circle cx="62" cy="35" r="2" fill="#E9B15D" filter="url(#globeGlow)" />
                    <circle cx="62" cy="35" r="7" stroke="#E9B15D" strokeWidth="0.75">
                      <animate attributeName="r" values="2;10;2" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  </g>
                </svg>
              </div>
            </motion.div>

            {/* LANGUAGES CARD */}
            <motion.div
              variants={cardVariants}
              whileHover={hoverConfig}
              transition={transitionConfig}
              tabIndex={0}
              aria-label="Languages status card"
              className={`p-6 glass-card rounded-[30px] flex flex-col justify-between min-h-[150px] ${outlineFocusClasses}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-white/40">LANGUAGES</span>
                <Globe className="w-3.5 h-3.5 text-primary/40" />
              </div>
              <div className="flex flex-col gap-5 text-xs font-mono tracking-wide mt-2">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="font-semibold text-white/90">English</span>
                  <span className="text-primary font-medium text-[11px] text-right">Professional</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white/90">Hindi</span>
                  <span className="text-primary font-medium text-[11px] text-right">Native</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 6. BOTTOM COLUMN: PHILOSOPHY CARD (Column 2 & 3 - Row 3) */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="Philosophy quote card"
            className={`col-span-12 lg:col-span-17 lg:col-start-8 lg:row-start-3 p-8 glass-card rounded-[30px] flex flex-col justify-between min-h-[130px] relative overflow-hidden order-6 ${outlineFocusClasses}`}
          >

            
            {/* Background Artwork Masked */}
            <div className="absolute right-0 bottom-0 top-0 w-[40%] opacity-70 pointer-events-none select-none z-0">
              <div 
                className="w-full h-full bg-no-repeat bg-bottom bg-contain"
                style={{ 
                  backgroundImage: "url('/images/references/about/about philosophy section.png')",
                  maskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
                  WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)"
                }}
              />
            </div>

            <div className="flex items-center justify-between mb-4 z-10">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40">PHILOSOPHY</span>
              <Quote className="w-4 h-4 text-primary/40" />
            </div>
            
            <div className="relative pt-2 z-10 max-w-[55%] flex flex-col gap-4">
              {/* Thin decorative gold line */}
              <div className="w-12 h-[2px] bg-gradient-to-r from-primary to-transparent" />
              <p className="text-white/85 text-sm md:text-base leading-relaxed font-light italic pl-4 border-l border-primary/20">
                Great software is built where thoughtful design meets intelligent engineering.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
