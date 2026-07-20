"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const glowScale = useMotionValue(1);
  const glowOpacity = useMotionValue(0.04); // Default spotlight intensity reduced
  const [mounted, setMounted] = useState(false);

  const springConfig = { damping: 50, stiffness: 220, mass: 0.8 };
  const glowX = useSpring(mouseX, springConfig);
  const glowY = useSpring(mouseY, springConfig);
  const smoothScale = useSpring(glowScale, { stiffness: 150, damping: 25 });
  const smoothOpacity = useSpring(glowOpacity, { stiffness: 150, damping: 25 });

  useEffect(() => {
    setMounted(true);
    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    if (isMobile) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Perform hover target elements checking
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const isInteractive = element?.closest("a, button, [role='button'], .glass-card, input, textarea, select, label");
      if (isInteractive) {
        glowScale.set(1.25);
        glowOpacity.set(0.065); // Gently intensify on interaction hover
      } else {
        glowScale.set(1.0);
        glowOpacity.set(0.04);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, glowScale, glowOpacity]);

  if (!mounted) return null;

  return (
    <motion.div
      style={{
        x: glowX,
        y: glowY,
        translateX: "-50%",
        translateY: "-50%",
        scale: smoothScale,
        opacity: smoothOpacity,
        background: "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)"
      }}
      className="fixed top-0 left-0 pointer-events-none z-[80] hidden lg:block w-[600px] h-[600px] rounded-full blur-[80px]"
    />
  );
}
