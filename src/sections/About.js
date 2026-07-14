"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { 
  User, GraduationCap, Briefcase, Globe, 
  MapPin, Quote
} from "lucide-react";

export default function About({ portraitImage = "/images/astronaut.png" }) {
  const portraitX = useMotionValue(0);
  const portraitY = useMotionValue(0);
  const springConfig = { stiffness: 120, damping: 20 };
  const smoothX = useSpring(portraitX, springConfig);
  const smoothY = useSpring(portraitY, springConfig);

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

  // Standardized Status Badge Component
  const StatusBadge = ({ text, icon: Icon }) => (
    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/[0.03] border border-primary/20 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-md select-none">
      {Icon && <Icon className="w-3 h-3 text-primary" />}
      {text}
    </span>
  );

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
    y: -6,
    scale: 1.02,
    borderColor: "rgba(233, 177, 93, 0.4)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.65), 0 0 22px rgba(233, 177, 93, 0.06)"
  };

  const transitionConfig = { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

  const outlineFocusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  return (
    <section id="about" className="relative w-full py-28 md:py-32 bg-transparent overflow-hidden">
      {/* Background spotlights & texture noise */}
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[radial-gradient(circle,rgba(233,177,93,0.05)_0%,transparent_70%)] blur-[95px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(255,221,168,0.035)_0%,transparent_75%)] blur-[90px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        
        {/* Section Heading standardizer */}
        <div className="flex flex-col gap-3 mb-16 max-w-2xl">
          <span className="text-[12px] font-bold tracking-[0.25em] text-primary uppercase select-none">
            ABOUT
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none">
            About Me
          </h2>
          <p className="text-white/60 text-xs md:text-sm lg:text-base font-light leading-relaxed mt-2">
            A quick overview of who I am and what I build.
          </p>
        </div>

        {/* 12-Column Responsive Bento Grid (mobile stack-reordered via CSS) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch animate-fade-in"
        >
          {/* 1. PORTRAIT CARD (focal point, spans 3 rows, taller height) */}
          <motion.div
            variants={cardVariants}
            onMouseMove={handlePortraitMouseMove}
            onMouseLeave={handlePortraitMouseLeave}
            tabIndex={0}
            aria-label="Yash Jain portrait card"
            className={`col-span-12 md:col-span-6 md:row-span-2 lg:col-span-3 lg:row-span-3 min-h-[460px] md:min-h-[510px] lg:min-h-[610px] glass-card relative overflow-hidden group flex flex-col justify-between shadow-lg border border-white/10 hover:border-primary/45 transition-colors duration-500 cursor-pointer order-1 ${outlineFocusClasses}`}
          >
            {/* Ambient gradients & warm spotlights */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#E9B15D]/5 via-[#2a1a10]/15 to-[#0b0705]/95 z-10 pointer-events-none" />
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full radial-glow-astronaut opacity-35 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(233,177,93,0.12)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

            {/* Glass reflection sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out z-30 pointer-events-none" />

            {/* Floating Portrait Wrapper (increased image sizing and internal padding space) */}
            <div className="absolute inset-0 z-20 p-3 md:p-3.5">
              <motion.div
                className="w-full h-full relative rounded-[22px] overflow-hidden animate-float-slow"
                style={{ x: smoothX, y: smoothY }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <Image
                  src={portraitImage}
                  alt="Yash Jain Portrait Image"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover rounded-[22px] shadow-2xl transition-all duration-500 filter brightness-95 group-hover:brightness-100 scale-105"
                />
              </motion.div>
            </div>

            {/* Status Badge overlays */}
            <span className="absolute bottom-6 left-6 z-30 px-4 py-1.5 rounded-full bg-[#120c08]/85 border border-[#E9B15D]/30 text-[9px] font-bold uppercase tracking-wider text-primary shadow-lg backdrop-blur-md">
              AI • WEB • DESIGN
            </span>
          </motion.div>

          {/* 2. ABOUT ME CARD */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="About Yash Jain summary details"
            className={`col-span-12 md:col-span-6 lg:col-span-5 p-8 glass-card flex flex-col justify-between min-h-[220px] order-2 ${outlineFocusClasses}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-white/40">ABOUT ME</span>
              <User className="w-5 h-5 text-primary/30" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 leading-none">Yash Jain</h3>
              <p className="text-[12px] font-bold text-primary mb-5 uppercase tracking-wide leading-relaxed">
                Full Stack Developer<br />
                AI Enthusiast<br />
                Graphic Designer
              </p>
              <p className="text-white/60 text-sm leading-relaxed font-light">
                I build modern web applications powered by AI, scalable engineering, and thoughtful design. I enjoy creating clean digital experiences that solve real-world problems.
              </p>
            </div>
          </motion.div>

          {/* 3. LOCATION CARD */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="Location detail card"
            className={`col-span-12 md:col-span-6 lg:col-span-2 p-8 glass-card flex flex-col justify-between min-h-[200px] order-5 ${outlineFocusClasses}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-white/40">Based In</span>
              <MapPin className="w-5 h-5 text-primary/30" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 leading-none">India</h3>
              <span className="text-white/50 text-sm font-light mt-2 block">IST (UTC +5:30)</span>
            </div>
          </motion.div>

          {/* 4. LANGUAGES CARD */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="Languages status"
            className={`col-span-12 md:col-span-6 lg:col-span-2 p-8 glass-card flex flex-col justify-between min-h-[200px] order-6 ${outlineFocusClasses}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-white/40">LANGUAGES</span>
              <Globe className="w-5 h-5 text-primary/30" />
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="font-semibold text-white">English</span>
                <span className="text-xs text-white/40 font-light">Professional</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Hindi</span>
                <span className="text-xs text-white/40 font-light">Native</span>
              </div>
            </div>
          </motion.div>

          {/* 5. EDUCATION CARD (identical height to Experience) */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="Education background"
            className={`col-span-12 md:col-span-6 lg:col-span-4 p-8 glass-card flex flex-col justify-between min-h-[240px] order-3 ${outlineFocusClasses}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-white/40">EDUCATION</span>
              <GraduationCap className="w-5 h-5 text-primary/30" />
            </div>
            <div>
              <div className="mb-5">
                <StatusBadge text="Currently Pursuing" />
              </div>
              <h4 className="text-base font-bold text-white mb-1 leading-snug">
                Bachelor's in Physical Science with Computer Science
              </h4>
              <p className="text-white/40 text-xs mb-5">Delhi University</p>
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                {["AI", "Machine Learning", "Software Development"].map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="text-[10px] bg-white/5 border border-white/5 px-2 py-1 rounded text-white/50 select-none">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 6. EXPERIENCE CARD (identical height to Education) */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="Experience background"
            className={`col-span-12 md:col-span-12 lg:col-span-5 p-8 glass-card flex flex-col justify-between min-h-[240px] order-4 ${outlineFocusClasses}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-white/40">EXPERIENCE</span>
              <Briefcase className="w-5 h-5 text-primary/30" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-5 leading-none">Experience</h4>
              <div className="flex flex-wrap gap-2">
                {["Freelance", "AI Projects", "Full Stack", "UI Design", "Open Source"].map((chip, idx) => (
                  <span 
                    key={`${chip}-${idx}`} 
                    className="inline-flex items-center h-7 px-3.5 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-semibold text-white/80 select-none cursor-default hover:border-primary/20 transition-all duration-300"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 7. PHILOSOPHY CARD */}
          <motion.div
            variants={cardVariants}
            whileHover={hoverConfig}
            transition={transitionConfig}
            tabIndex={0}
            aria-label="Philosophy quote"
            className={`col-span-12 md:col-span-12 lg:col-span-9 p-8 glass-card flex flex-col justify-between min-h-[200px] order-7 ${outlineFocusClasses}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-white/40">PHILOSOPHY</span>
              <Quote className="w-5 h-5 text-primary/30" />
            </div>
            <div className="relative pt-2">
              <span className="absolute -top-6 -left-2 text-primary/10 text-7xl font-serif select-none pointer-events-none">“</span>
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
