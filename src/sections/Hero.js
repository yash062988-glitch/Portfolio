"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail, ChevronDown, MapPin, GraduationCap, Heart, Clock } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";
import MeshText from "@/components/design-system/MeshText";
import { useAccentColors } from "@/hooks/useAccentColors";

export default function Hero() {
  const { primary } = useAccentColors();
  
  // Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for parallax
  const springConfig = { damping: 30, stiffness: 100 };
  const astronautX = useSpring(mouseX, springConfig);
  const astronautY = useSpring(mouseY, springConfig);

  // Background parallax (subtler than astronaut)
  const bgX = useTransform(astronautX, (val) => val * -0.3);
  const bgY = useTransform(astronautY, (val) => val * -0.3);

  // Text parallax (even subtler)
  const textX = useTransform(astronautX, (val) => val * 0.2);
  const textY = useTransform(astronautY, (val) => val * 0.2);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate offset from center (-1 to 1)
      const x = (clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (clientY - innerHeight / 2) / (innerHeight / 2);
      
      // Set target pixel offset (max 10px travel for premium subtlety)
      mouseX.set(x * 10);
      mouseY.set(y * 10);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const downloadResume = () => {
    alert("Downloading Yash Jain's Resume...");
  };

  return (
    <section
      id="home"
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between pt-24 md:pt-28 pb-12"
    >
      {/* Background Image Container */}
      <motion.div 
        style={{ x: bgX, y: bgY, scale: 1.05 }}
        className="absolute inset-0 z-0 bg-layer-artwork-behind"
      >
        <Image
          src="/images/hero-bg.png"
          alt="Cinematic Sunset Background"
          fill
          priority
          quality={100}
          className="object-cover object-center pointer-events-none"
        />
      </motion.div>

      {/* Cinematic Dark Overlay */}
      {/* <div 
        className="absolute inset-0 z-10 pointer-events-none bg-layer-overlay"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(20, 15, 10, 0.35) 0%, rgba(11, 7, 5, 0.85) 80%)"
        }}
      /> */}
      {/* <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0b0705] via-transparent to-transparent pointer-events-none bg-layer-overlay" /> */}

      {/* Main Hero Grid Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex-grow flex flex-col justify-center gap-12 lg:gap-0 lg:grid lg:grid-cols-12 lg:items-center bg-layer-content">
        
        {/* Left Side: Typography & Intro */}
        <div className="lg:col-span-6 flex flex-col items-start text-left mt-8 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ x: textX, y: textY }}
            className="flex flex-col gap-6"
          >
            {/* Small Greeting */}
            <span className="text-sm font-semibold tracking-[0.25em] text-primary uppercase">
              HI, I'M
            </span>

            {/* Large Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] font-sans flex flex-wrap gap-x-4">
              <MeshText text="Yash" className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] font-sans" as="span" />
              <MeshText text="Jain" className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary leading-[1.05] font-sans" color={primary} as="span" />
            </h1>

            {/* Subtitle */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-white/80 font-medium text-lg md:text-xl">
              <span>Developer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span>AI Enthusiast</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <span>Problem Solver</span>
            </div>

            {/* Description */}
            <p className="text-white/72 text-base md:text-lg leading-relaxed max-w-xl font-light">
              I build intelligent digital experiences by combining Web Development, Artificial Intelligence, Machine Learning, Data Analytics and Creative Design.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button
                onClick={() => scrollToSection("projects")}
                className="px-8 py-3.5 rounded-full bg-primary text-[#120c08] font-semibold text-sm hover:bg-secondary hover:shadow-[0_0_25px_rgba(233,177,93,0.35)] transition-all duration-300 cursor-pointer"
              >
                Explore My Work
              </button>
              <button
                onClick={downloadResume}
                className="px-8 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-medium text-sm hover:bg-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                Download Resume
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-5 mt-4 text-white/60">
              <a
                href="https://github.com/yash062988-glitch"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors duration-300"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/yash-jain-40581736a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors duration-300"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a
                href="mailto:yash062988@gmail.com"
                className="hover:text-primary transition-colors duration-300"
                aria-label="Email Me"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Space Spacer for Center Column */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* Right Space */}
        <div className="lg:col-span-5 hidden lg:block" />

      </div>

      {/* Astronaut Container (Absolute Centered Layer) */}
      <div className="absolute inset-0 z-20 pointer-events-none flex justify-center items-end select-none">
        <motion.div
          style={{ x: astronautX, y: astronautY }}
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px] lg:w-[600px] lg:h-[600px] pointer-events-auto flex items-end justify-center mb-[-50px] md:mb-[-100px] lg:mb-[-120px] group"
        >
          {/* Radial Glow behind Astronaut */}
          <div className="absolute top-[45%] left-1/2 w-[65%] h-[65%] rounded-full radial-glow-astronaut transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-glow" />

          {/* Astronaut Image with Floating Animation, shadows, and hover scale */}
          <motion.div
            className="relative w-full h-full animate-float flex items-end justify-center"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
          >
            <Image
              src="/images/astronaut.png"
              alt="Floating Astronaut"
              width={600}
              height={600}
              priority
              quality={100}
              className="object-contain pointer-events-none drop-shadow-[0_15px_30px_rgba(20,15,10,0.5)] drop-shadow-[0_30px_60px_rgba(233,177,93,0.15)] group-hover:drop-shadow-[0_40px_80px_rgba(233,177,93,0.25)] transition-all duration-500"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Cards & Scroll Indicator (Positioned absolute for layout control) */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 mt-12 lg:mt-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        
        {/* Bottom Left: Glass info card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="w-full md:w-[320px] p-5 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg flex flex-col gap-3.5 hover:bg-white/8 hover:border-primary/20 transition-all duration-300"
        >
          <div className="flex items-center gap-2 text-primary font-medium text-xs tracking-wider uppercase">
            <Clock className="w-3.5 h-3.5" />
            Quick Overview
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <span className="text-white/50 block text-[11px] uppercase tracking-wider">Age</span>
              <span className="text-white font-medium">19 Years</span>
            </div>
            <div>
              <span className="text-white/50 block text-[11px] uppercase tracking-wider">Education</span>
              <span className="text-white font-medium flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-primary/70" />
                BSC in CS
              </span>
            </div>
            <div>
              <span className="text-white/50 block text-[11px] uppercase tracking-wider">Location</span>
              <span className="text-white font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary/70" />
                India
              </span>
            </div>
            <div>
              <span className="text-white/50 block text-[11px] uppercase tracking-wider">Interests</span>
              <span className="text-white font-medium flex items-center gap-1">
                <Heart className="w-3 h-3 text-primary/70" />
                AI & Design
              </span>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="hidden lg:flex flex-col items-center gap-2 cursor-pointer pb-2 group" onClick={() => scrollToSection("about")}>
          <span className="text-xs uppercase tracking-[0.25em] text-white/40 group-hover:text-primary transition-colors duration-300">
            Scroll down
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="p-1 rounded-full border border-white/15 text-white/50 group-hover:text-primary group-hover:border-primary/40 transition-colors duration-300"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Bottom Right: Statistics and motivational phrase */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="w-full md:w-[320px] p-5 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg flex flex-col gap-4 hover:bg-white/8 hover:border-primary/20 transition-all duration-300"
        >
          <div>
            <span className="text-primary font-bold text-xs tracking-wider uppercase block">Focus</span>
            <p className="text-white font-light text-sm italic mt-1 leading-normal">
              "Always Learning. Always Building."
            </p>
          </div>
          <div className="h-px bg-white/10" />
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="block text-lg font-bold text-secondary">20+</span>
              <span className="text-white/40 block text-[9px] uppercase tracking-wider">Projects</span>
            </div>
            <div>
              <span className="block text-lg font-bold text-secondary">5+</span>
              <span className="text-white/40 block text-[9px] uppercase tracking-wider">Certs</span>
            </div>
            <div>
              <span className="block text-lg font-bold text-secondary">2+</span>
              <span className="text-white/40 block text-[9px] uppercase tracking-wider">Years Lrn</span>
            </div>
            <div>
              <span className="block text-lg font-bold text-secondary">100%</span>
              <span className="text-white/40 block text-[9px] uppercase tracking-wider">Curious</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
