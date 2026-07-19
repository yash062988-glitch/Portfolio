"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";
import { useAccentColors } from "@/hooks/useAccentColors";
import { gsap } from "gsap";
import SmokyMeshText from "@/components/design-system/SmokyMeshText";

export default function Hero() {
  const { primary } = useAccentColors();
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const activeVideoRef = useRef(1); // Keeps track of active video (1 or 2)

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    // Initial setup
    v1.style.opacity = "1";
    v2.style.opacity = "0";
    v1.play().catch(() => {});
    v2.pause();

    let cancelled = false;
    let crossfading = false;
    let fadeStartTime = 0;

    // The video is 8.0 seconds long.
    // Let's start the crossfade at 6.0 seconds, giving a 1.6 second crossfade.
    // The loop wraps at 7.6 seconds (avoiding the last 0.4 seconds of ending sequence loop jump).
    const LOOP_END = 6.2;
    const FADE_DURATION = 1.4;

    const check = () => {
      if (cancelled) return;

      const currentVideo = activeVideoRef.current === 1 ? v1 : v2;
      const otherVideo = activeVideoRef.current === 1 ? v2 : v1;

      if (currentVideo && !crossfading) {
        const curTime = currentVideo.currentTime;
        if (curTime >= LOOP_END) {
          crossfading = true;
          fadeStartTime = performance.now();
          
          otherVideo.currentTime = 0.2; // Skip first 0.2s of decode delay
          otherVideo.play().then(() => {
            // Other video started playing
          }).catch(() => {});
        }
      }

      if (crossfading) {
        const now = performance.now();
        const elapsed = (now - fadeStartTime) / 1000;
        const progress = Math.min(1, elapsed / FADE_DURATION);

        if (activeVideoRef.current === 1) {
          v1.style.opacity = String(1 - progress);
          v2.style.opacity = String(progress);
        } else {
          v2.style.opacity = String(1 - progress);
          v1.style.opacity = String(progress);
        }

        if (progress >= 1) {
          if (activeVideoRef.current === 1) {
            v1.style.opacity = "0";
            v2.style.opacity = "1";
            v1.pause();
            activeVideoRef.current = 2;
          } else {
            v2.style.opacity = "0";
            v1.style.opacity = "1";
            v2.pause();
            activeVideoRef.current = 1;
          }
          crossfading = false;
        }
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Gravity Simulation Refs
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const headingRef = useRef(null);
  const arrowRef = useRef(null);
  const aiTextRef = useRef(null);
  const skillsRefs = useRef([]);
  
  // Scientific Labels Value Refs
  const label1ValRef = useRef(null);
  const label2ValRef = useRef(null);
  const label3ValRef = useRef(null);
  const label4ValRef = useRef(null);

  // Breathing Gravity Offset for the Astronaut
  const breathingOffset = useMotionValue(0);
  const astronautYCombined = useTransform(
    [astronautY, breathingOffset],
    ([yVal, breathVal]) => yVal + breathVal
  );

  const activePacketRef = useRef(null);
  const particlesRef = useRef([]);
  const lightPulsesRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const x = (clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (clientY - innerHeight / 2) / (innerHeight / 2);

      mouseX.set(x * 10);
      mouseY.set(y * 10);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const triggerGlowHighlight = (el) => {
    if (!el) return;
    el.style.transition = "none";
    el.style.textShadow = "0 0 25px var(--accent-primary), 0 0 50px var(--accent-primary)";
    el.style.color = "var(--accent-primary)";
    
    setTimeout(() => {
      el.style.transition = "text-shadow 0.9s ease, color 0.9s ease";
      el.style.textShadow = "";
      el.style.color = "";
    }, 100);
  };

  // Canvas Physics Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const getBHCenter = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w >= 768) {
        return { x: w * 0.61, y: h * 0.5 };
      } else {
        return { x: w * 0.5, y: h * 0.5 };
      }
    };

    const spawnTrailParticle = (x, y) => {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 1.5 + Math.random() * 1.5,
          opacity: 0.8 + Math.random() * 0.2,
          decay: 0.025 + Math.random() * 0.02
        });
      }
    };

    let animId;

    const tick = () => {
      const now = Date.now() * 0.001;
      const gravityCycle = Math.sin((now * Math.PI * 2) / 9.0);
      const gravityMultiplier = 1.0 + gravityCycle * 0.22;
      
      breathingOffset.set(gravityCycle * 5.5);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: bhX, y: bhY } = getBHCenter();

      // Handle Active Packet
      const packet = activePacketRef.current;
      if (packet) {
        const dx = bhX - packet.x;
        const dy = bhY - packet.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        packet.time += 1;

        if (packet.state === "drifting") {
          const pullForce = 0.065 * gravityMultiplier;
          packet.vx += (dx / d) * pullForce;
          packet.vy += (dy / d) * pullForce;
          
          packet.vx *= 0.985;
          packet.vy *= 0.985;
          
          packet.x += packet.vx;
          packet.y += packet.vy;

          if (packet.time % 2 === 0) {
            spawnTrailParticle(packet.x, packet.y);
          }

          if (d < 180) {
            packet.state = "orbiting";
            packet.radius = d;
            packet.angle = Math.atan2(-dy, -dx);
          }
        } 
        else if (packet.state === "orbiting") {
          packet.radius -= 0.65 * gravityMultiplier;
          packet.angle += packet.orbitSpeed * gravityMultiplier;

          packet.x = bhX + Math.cos(packet.angle) * packet.radius;
          packet.y = bhY + Math.sin(packet.angle) * packet.radius;

          if (packet.time % 2 === 0) {
            spawnTrailParticle(packet.x, packet.y);
          }

          if (packet.radius < 55) {
            packet.state = "capturing";
            packet.timeInCapture = 0;
          }
        } 
        else if (packet.state === "capturing") {
          packet.timeInCapture += 1;
          let dt = 1.0;
          if (packet.timeInCapture < 25) {
            dt = Math.max(0.2, 1.0 - (packet.timeInCapture / 25) * 0.8);
          } else {
            dt = 1.0 + (packet.timeInCapture - 25) * 0.25;
          }

          packet.radius -= 1.8 * dt * gravityMultiplier;
          packet.angle += packet.orbitSpeed * 1.5 * dt * gravityMultiplier;

          packet.x = bhX + Math.cos(packet.angle) * packet.radius;
          packet.y = bhY + Math.sin(packet.angle) * packet.radius;

          packet.stretch = 1.0 + (55 - packet.radius) * 0.08;
          packet.scale = Math.max(0.1, 0.9 - (55 - packet.radius) * 0.025);
          packet.opacity = Math.max(0, 1.0 - (55 - packet.radius) * 0.03);
          packet.blur = Math.min(6, (55 - packet.radius) * 0.15);

          if (packet.time % 2 === 0) {
            spawnTrailParticle(packet.x, packet.y);
          }

          if (packet.radius <= 8 || packet.opacity <= 0) {
            lightPulsesRef.current.push({
              x: bhX,
              y: bhY,
              radius: 10,
              opacity: 1.0,
              maxRadius: 80
            });

            packet.state = "returning";
            packet.x = bhX;
            packet.y = bhY;
            packet.opacity = 1.0;
            packet.scale = 1.0;
            packet.returnSpeed = 0.0;
          }
        } 
        else if (packet.state === "returning") {
          const targetX = packet.startX;
          const targetY = packet.startY;
          const rdx = targetX - packet.x;
          const rdy = targetY - packet.y;
          const rd = Math.sqrt(rdx * rdx + rdy * rdy);

          packet.returnSpeed += 0.45;
          const speed = Math.min(13, packet.returnSpeed);
          
          const angleToTarget = Math.atan2(rdy, rdx);
          const spiralAngle = angleToTarget + Math.sin(rd * 0.05) * 0.25;

          packet.x += Math.cos(spiralAngle) * speed;
          packet.y += Math.sin(spiralAngle) * speed;

          ctx.save();
          ctx.beginPath();
          ctx.arc(packet.x, packet.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = primary;
          ctx.shadowBlur = 10;
          ctx.shadowColor = primary;
          ctx.fill();
          ctx.restore();

          if (rd <= 12) {
            if (packet.originalEl) {
              triggerGlowHighlight(packet.originalEl);
            }
            activePacketRef.current = null;
          }
        }

        // Draw Packet
        if (packet.state !== "returning") {
          ctx.save();
          ctx.translate(packet.x, packet.y);
          if (packet.state === "orbiting" || packet.state === "capturing") {
            ctx.rotate(packet.angle + Math.PI / 2);
          }
          ctx.scale(packet.scale * packet.stretch, packet.scale);
          if (packet.blur > 1) {
            ctx.filter = `blur(${packet.blur}px)`;
          }
          ctx.fillStyle = primary;
          ctx.font = `600 ${window.innerWidth >= 768 ? "12.5px" : "11px"} monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = packet.opacity;
          ctx.shadowBlur = 12;
          ctx.shadowColor = primary;
          ctx.fillText(packet.text, 0, 0);
          ctx.restore();
        }
      }

      // Trail Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const pdx = bhX - p.x;
        const pdy = bhY - p.y;
        const pd = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pd > 5) {
          p.vx += (pdx / pd) * 0.055;
          p.vy += (pdy / pd) * 0.055;
        }
        
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= p.decay;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = primary;
        ctx.shadowBlur = 4;
        ctx.shadowColor = primary;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
      }

      // Light Pulses
      const pulses = lightPulsesRef.current;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.radius += 2.5;
        pulse.opacity = 1.0 - (pulse.radius / pulse.maxRadius);

        if (pulse.opacity <= 0) {
          pulses.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = primary;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = pulse.opacity;
        ctx.shadowBlur = 10;
        ctx.shadowColor = primary;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    // Trigger dynamic data packet emissions
    const triggerEmission = () => {
      if (activePacketRef.current) return;

      const words = [
        "AI", "React", "Next.js", "Three.js", "Node.js", "Python",
        "GSAP", "Machine Learning", "Creative Design", "Web Development",
        "Database", "Cloud", "API"
      ];
      const word = words[Math.floor(Math.random() * words.length)];

      let startX = 140;
      let startY = window.innerHeight * 0.5;
      let originalEl = null;

      if (word === "AI" && aiTextRef.current) {
        originalEl = aiTextRef.current;
      } else {
        const skillIndex = [
          "Web Development",
          "Artificial Intelligence",
          "Machine Learning",
          "Creative Design"
        ].indexOf(word);
        if (skillIndex !== -1 && skillsRefs.current[skillIndex]) {
          originalEl = skillsRefs.current[skillIndex];
        }
      }

      if (originalEl) {
        const rect = originalEl.getBoundingClientRect();
        const heroRect = heroRef.current.getBoundingClientRect();
        startX = rect.left - heroRect.left + rect.width / 2;
        startY = rect.top - heroRect.top + rect.height / 2;
      } else {
        startX = 160 + Math.random() * 80;
        startY = window.innerHeight * 0.45 + Math.random() * 80;
      }

      activePacketRef.current = {
        text: word,
        x: startX,
        y: startY,
        startX: startX,
        startY: startY,
        vx: 0,
        vy: 0,
        state: "drifting",
        angle: 0,
        radius: 0,
        orbitSpeed: 0.02 + Math.random() * 0.015,
        opacity: 1,
        scale: 1,
        blur: 0,
        stretch: 1,
        time: 0,
        originalEl: originalEl
      };
    };

    const emissionInterval = setInterval(triggerEmission, 5000);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
      clearInterval(emissionInterval);
    };
  }, [primary]);

  // GSAP Tweens and HUD Label Value Decays
  useEffect(() => {
    const headingTween = gsap.timeline({ repeat: -1, repeatDelay: 11 })
      .to(headingRef.current, {
        x: 3.5,
        skewX: 1.5,
        scaleX: 1.008,
        duration: 1.5,
        ease: "power1.inOut"
      })
      .to(headingRef.current, {
        x: 0,
        skewX: 0,
        scaleX: 1,
        duration: 1.2,
        ease: "power1.inOut"
      });

    const arrowTween = gsap.timeline({ repeat: -1, repeatDelay: 6 })
      .to(arrowRef.current, {
        x: 9,
        scaleX: 2.0,
        skewX: -20,
        duration: 1.1,
        ease: "power2.in"
      })
      .to(arrowRef.current, {
        x: 0,
        scaleX: 1,
        skewX: 0,
        duration: 0.9,
        ease: "elastic.out(1.2, 0.4)"
      });

    const decayText = (elRef, originalText) => {
      const chars = originalText.split("");
      let count = 0;
      const interval = setInterval(() => {
        if (count >= 5) {
          clearInterval(interval);
          setTimeout(() => {
            if (elRef.current) elRef.current.innerText = originalText;
          }, 1500);
          return;
        }
        
        const length = chars.length - count - 1;
        if (length > 0 && elRef.current) {
          elRef.current.innerText = chars.slice(0, length).join("") + "_";
        }
        count++;
      }, 150);
    };

    const valueDecayInterval = setInterval(() => {
      const labels = [
        { ref: label1ValRef, text: "R_S = 2GM / C²" },
        { ref: label2ValRef, text: "L_IS = 1.5 R_S" },
        { ref: label3ValRef, text: "ACTIVE DETECTOR" },
        { ref: label4ValRef, text: "T_REL = 1.088" }
      ];
      const selected = labels[Math.floor(Math.random() * labels.length)];
      if (selected.ref.current) {
        decayText(selected.ref, selected.text);
      }
    }, 8500);

    return () => {
      headingTween.kill();
      arrowTween.kill();
      clearInterval(valueDecayInterval);
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const downloadResume = () => {
    alert("Downloading Yash Jain's Resume...");
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative w-full min-h-screen overflow-hidden flex items-center bg-black"
    >
      {/* Canvas Layer for Gravity Data Simulation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20 pointer-events-none w-full h-full"
      />

      {/* Background Video Container */}
      <motion.div
        style={{ x: bgX, y: bgY, scale: 1.05 }}
        className="absolute inset-0 z-0 bg-layer-artwork-behind overflow-hidden"
      >
        {/* Video 1 (Main/Initial Player) */}
        <video
          ref={video1Ref}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          style={{ opacity: 1, filter: "contrast(1.25) brightness(1.2) saturate(1.4)" }}
        >
          <source src="/hero-page-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video 2 (Background Double Buffer) */}
        <video
          ref={video2Ref}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          style={{ opacity: 0, filter: "contrast(1.25) brightness(1.2) saturate(1.4)" }}
        >
          <source src="/hero-page-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>

      {/* Content Container (Absolute Left Aligned) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ x: textX, y: textY }}
        className="absolute left-6 sm:left-12 lg:left-[140px] top-1/2 -translate-y-1/2 w-full max-w-[480px] z-20 pointer-events-auto flex flex-col text-left"
      >
        {/* Eyebrow Heading */}
        <div className="flex items-center gap-4 w-full select-none">
          <span className="text-[11px] sm:text-[12px] font-mono tracking-[0.4em] text-white/50 uppercase whitespace-nowrap">
            Entering Yash's Creative Universe
          </span>
          <div 
            className="h-[1px] flex-grow transition-all duration-500" 
            style={{ background: "linear-gradient(to right, var(--accent-primary), transparent)", opacity: 0.25 }} 
          />
        </div>

        {/* Large Typography Heading (Eyebrow -> Heading: 20px) */}
        <h1 ref={headingRef} className="text-[44px] sm:text-[64px] lg:text-[84px] font-bold tracking-tight leading-none font-space-grotesk flex flex-wrap items-baseline gap-x-3 uppercase select-none mt-[36px]">
          <SmokyMeshText text="YASH" className="text-[44px] sm:text-[64px] lg:text-[84px] font-bold text-white tracking-tight leading-none font-space-grotesk" as="span" />
          <SmokyMeshText text="JAIN" className="text-[44px] sm:text-[64px] lg:text-[84px] font-bold text-primary tracking-tight leading-none font-space-grotesk" color="var(--accent-primary)" as="span" />
        </h1>

        {/* Subtitle / Role Line (Heading -> Roles: 24px) */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-white/90 text-[11.5px] sm:text-[13px] tracking-[0.18em] uppercase font-mono font-medium mt-[38px]">
          <span>Full Stack Developer</span>
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ backgroundColor: "var(--accent-primary)" }} />
          <span>AI Engineer</span>
          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ backgroundColor: "var(--accent-primary)" }} />
          <span>Creative Technologist</span>
        </div>

        {/* Description (Roles -> Description: 32px) */}
        <p className="text-white/85 text-sm sm:text-[15px] leading-[1.75] max-w-[420px] font-light mt-[32px] select-none">
          I build immersive digital experiences where engineering, <span ref={aiTextRef} className="inline-block transition-all duration-300">AI</span> and cinematic design converge.
        </p>

        {/* CTA Buttons (Description -> Buttons: 36px) */}
        <div className="flex items-center gap-6 sm:gap-7 mt-[36px]">
          <button
            onClick={() => scrollToSection("projects")}
            className="group flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.2em] uppercase text-[#120c08] bg-primary px-6 py-3.5 rounded-full hover:bg-secondary hover:shadow-[0_0_30px_rgba(var(--accent-glow-raw),0.4)] transition-all duration-300 cursor-pointer shrink-0 font-space-grotesk"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            <span>Explore Universe</span>
            <span ref={arrowRef} className="inline-block transition-transform duration-300">→</span>
          </button>
          <button
            onClick={downloadResume}
            className="text-[10.5px] font-semibold tracking-[0.2em] uppercase text-primary border border-primary/30 px-6 py-3.5 rounded-full cursor-pointer bg-primary/[0.03] hover:bg-primary/[0.08] hover:border-primary/60 hover:shadow-[0_0_20px_rgba(var(--accent-glow-raw),0.2)] transition-all duration-300 font-space-grotesk"
            style={{ color: "var(--accent-primary)", borderColor: "rgba(var(--accent-glow-raw), 0.3)" }}
          >
            Resume
          </button>
        </div>

        {/* Left Minimal Information Stack (Buttons -> Skills: 40px) */}
        <div className="flex flex-col gap-2.5 mt-[40px] select-none">
          {[
            "Web Development",
            "Artificial Intelligence",
            "Machine Learning",
            "Creative Design"
          ].map((item, index) => (
            <div key={item} className="flex items-center gap-3 text-white/80 text-[11.5px] sm:text-[13px] tracking-[0.2em] uppercase font-semibold hover:text-white transition-colors duration-300">
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--accent-primary)" }} />
              <span ref={(el) => (skillsRefs.current[index] = el)} className="inline-block transition-all duration-300">{item}</span>
            </div>
          ))}
        </div>

        {/* Social Icons (Skills -> Social Icons: 28px) */}
        <div className="flex items-center gap-[22px] mt-[28px] text-white/60">
          <a
            href="https://github.com/yash062988-glitch"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:scale-110 transition-all duration-300"
            aria-label="GitHub Profile"
          >
            <GithubIcon className="w-[22px] h-[22px]" />
          </a>
          <a
            href="https://www.linkedin.com/in/yash-jain-40581736a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:scale-110 transition-all duration-300"
            aria-label="LinkedIn Profile"
          >
            <LinkedinIcon className="w-[22px] h-[22px]" />
          </a>
          <a
            href="mailto:yash062988@gmail.com"
            className="hover:text-primary hover:scale-110 transition-all duration-300"
            aria-label="Email Me"
          >
            <Mail className="w-[22px] h-[22px]" />
          </a>
        </div>

      </motion.div>

      {/* Black Hole Scientific Labels (NASA overlay inspiration - positioned on the right side to avoid text overlap) */}
      <div className="absolute inset-0 z-10 pointer-events-none hidden md:block select-none overflow-hidden">
        {/* Label 1: Event Horizon (Right Middle-Top) */}
        <div className="absolute right-[34%] top-[28%] flex flex-col items-end opacity-85 hover:opacity-100 transition-opacity duration-300">
          <span className="text-[9.5px] font-mono tracking-[0.25em] text-primary uppercase animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" style={{ color: "var(--accent-primary)" }}>EVENT HORIZON</span>
          <span ref={label1ValRef} className="text-[8px] font-mono tracking-[0.15em] text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">R_S = 2GM / C²</span>
          <svg width="40" height="16" className="mt-1 overflow-visible">
            <line x1="40" y1="0" x2="0" y2="16" stroke="var(--accent-primary)" strokeWidth="0.75" strokeOpacity="0.7" />
          </svg>
        </div>

        {/* Label 2: Photon Ring (Right Far-Top) */}
        <div className="absolute right-[22%] top-[18%] flex flex-col items-end opacity-85 hover:opacity-100 transition-opacity duration-300">
          <span className="text-[9.5px] font-mono tracking-[0.25em] text-primary uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" style={{ color: "var(--accent-primary)" }}>PHOTON RING</span>
          <span ref={label2ValRef} className="text-[8px] font-mono tracking-[0.15em] text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">L_IS = 1.5 R_S</span>
          <svg width="40" height="16" className="mt-1 overflow-visible">
            <line x1="40" y1="0" x2="0" y2="16" stroke="var(--accent-primary)" strokeWidth="0.75" strokeOpacity="0.7" />
          </svg>
        </div>

        {/* Label 3: Gravity Well (Right Middle-Bottom) */}
        <div className="absolute right-[32%] bottom-[27%] flex flex-col items-end opacity-85 hover:opacity-100 transition-opacity duration-300">
          <span className="text-[9.5px] font-mono tracking-[0.25em] text-primary uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" style={{ color: "var(--accent-primary)" }}>GRAVITY WELL</span>
          <span ref={label3ValRef} className="text-[8px] font-mono tracking-[0.15em] text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">ACTIVE DETECTOR</span>
          <svg width="40" height="16" className="mt-1 overflow-visible">
            <line x1="40" y1="16" x2="0" y2="0" stroke="var(--accent-primary)" strokeWidth="0.75" strokeOpacity="0.7" />
          </svg>
        </div>

        {/* Label 4: Spacetime Curvature (Right Far-Bottom) */}
        <div className="absolute right-[20%] bottom-[18%] flex flex-col items-end opacity-85 hover:opacity-100 transition-opacity duration-300">
          <span className="text-[9.5px] font-mono tracking-[0.25em] text-primary uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" style={{ color: "var(--accent-primary)" }}>SPACETIME DILATION</span>
          <span ref={label4ValRef} className="text-[8px] font-mono tracking-[0.15em] text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">T_REL = 1.088</span>
          <svg width="40" height="16" className="mt-1 overflow-visible">
            <line x1="40" y1="16" x2="0" y2="0" stroke="var(--accent-primary)" strokeWidth="0.75" strokeOpacity="0.7" />
          </svg>
        </div>
      </div>

      {/* Astronaut Container (Absolute Lower-Right Corner) */}
      <div className="absolute inset-0 z-20 pointer-events-none flex justify-end items-end select-none overflow-hidden">
        <motion.div
          style={{ 
            x: astronautX, 
            y: astronautYCombined,
            rotate: -8
          }}
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] lg:w-[540px] lg:h-[540px] pointer-events-auto flex items-end justify-center mb-[-70px] md:mb-[-120px] lg:mb-[-165px] mr-[-120px] md:mr-[-160px] lg:mr-[-220px] group"
        >
          {/* Radial Glow behind Astronaut */}
          <div 
            className="absolute top-[45%] left-1/2 w-[70%] h-[70%] rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-glow"
            style={{
              background: "radial-gradient(circle, rgba(var(--accent-glow-raw), 0.15) 0%, transparent 70%)"
            }}
          />

          {/* Astronaut Image with subtle float, facing black hole */}
          <motion.div
            className="relative w-full h-full animate-float flex items-end justify-center"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 120, damping: 25 }}
          >
            <Image
              src="/images/hero-page-new.png"
              alt="Floating Astronaut"
              width={540}
              height={540}
              priority
              quality={100}
              className="object-contain pointer-events-none drop-shadow-[0_15px_30px_rgba(20,15,10,0.5)] drop-shadow-[0_25px_50px_rgba(var(--accent-glow-raw),0.12)] transition-all duration-500"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5 cursor-pointer group"
        onClick={() => scrollToSection("about")}
      >
        {/* Mouse Icon */}
        <div className="w-4 h-7 rounded-full border flex justify-center p-1 transition-colors duration-300" style={{ borderColor: "color-mix(in srgb, var(--accent-primary) 35%, transparent)" }}>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-primary"
            style={{ backgroundColor: "var(--accent-primary)" }}
          />
        </div>
        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 group-hover:text-primary transition-colors duration-300">
          SCROLL TO EXPLORE
        </span>
        <motion.span
          animate={{ y: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/40 group-hover:text-primary transition-colors duration-300 text-xs font-light"
          style={{ color: "var(--accent-primary)" }}
        >
          ↓
        </motion.span>
      </div>
    </section>
  );
}
