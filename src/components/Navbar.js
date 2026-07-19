"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X, ArrowUpRight, MessageSquare } from "lucide-react";
import { useChat } from "@/context/ChatContext";

// Local Sub-component for performance optimization & isolated magnetic/hover states
function NavItem({
  item,
  activeSection,
  hoveredId,
  setHoveredId,
  handleNavClick,
  clickRipple,
  setClickRipple
}) {
  const ref = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate mouse pointer distance from the center of the nav link
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Apply extremely subtle magnetic pull (max 2.5px offset)
    const magneticX = (distanceX / (rect.width / 2)) * 2.5;
    const magneticY = (distanceY / (rect.height / 2)) * 2.5;

    setCoords({ x: magneticX, y: magneticY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setHoveredId(item.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
    setHoveredId(null);
  };

  const handleClick = (e) => {
    handleNavClick(e, item.href);
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // Get mouse pointer click coordinates relative to the button boundaries
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    setClickRipple({ id: item.id, x: clickX, y: clickY, key: Date.now() });
  };

  const isActive = activeSection === item.id;
  // Shared layout determines if bubble should show on this item
  const showBubble = hoveredId === item.id || (hoveredId === null && isActive);

  return (
    <motion.a
      ref={ref}
      href={item.href}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      className={`relative px-4 py-2 text-xs font-medium font-space-grotesk tracking-wide transition-colors duration-300 block select-none cursor-pointer ${
        isActive ? "text-white" : "text-white/70 hover:text-white"
      }`}
    >
      {/* Label Text - Translates up by 2px on hover + subtle magnetic deflection */}
      <motion.span
        className="relative z-10 block"
        animate={{
          x: coords.x,
          y: isHovered ? coords.y - 2 : coords.y
        }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
      >
        {item.label}
      </motion.span>

      {/* Floating Glass Bubble Indicator (Shared layoutId transition) */}
      {showBubble && (
        <motion.span
          layoutId="navBubble"
          className="absolute inset-0 rounded-full z-0 pointer-events-none transition-all duration-300"
          style={{
            borderColor: isActive
              ? "var(--accent-primary)"
              : isHovered
                ? "rgba(var(--accent-glow-raw), 0.5)"
                : "rgba(255, 255, 255, 0.1)",
            backgroundColor: isActive
              ? isHovered
                ? "rgba(var(--accent-glow-raw), 0.2)"
                : "rgba(var(--accent-glow-raw), 0.1)"
              : "rgba(255, 255, 255, 0.02)",
            borderWidth: "1px",
            borderStyle: "solid",
            boxShadow: isActive
              ? isHovered
                ? "0 4px 20px var(--accent-glow), 0 0 15px var(--accent-glow)"
                : "0 4px 15px var(--accent-glow)"
              : isHovered
                ? "0 2px 10px var(--accent-glow)"
                : "none",
            backdropFilter: isActive ? "blur(8px)" : "blur(4px)"
          }}
          animate={{
            x: coords.x * 0.5, // Parallax depth: bubble moves 50% slower than text
            y: coords.y * 0.5
          }}
          transition={{
            layout: {
              type: "spring",
              stiffness: 280,
              damping: 28,
              mass: 0.8
            },
            x: { type: "spring", stiffness: 380, damping: 26 },
            y: { type: "spring", stiffness: 380, damping: 26 }
          }}
        >
          {/* Click Ripple Indicator */}
          <AnimatePresence>
            {clickRipple && clickRipple.id === item.id && (
              <motion.span
                key={clickRipple.key}
                className="absolute rounded-full bg-primary/20 pointer-events-none"
                style={{
                  left: clickRipple.x,
                  top: clickRipple.y,
                  transform: "translate(-50%, -50%)"
                }}
                initial={{ width: 0, height: 0, opacity: 0.6 }}
                animate={{ width: 120, height: 120, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </motion.span>
      )}
    </motion.a>
  );
}

export default function Navbar({ isPortalActive, onOpenResume }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [hoveredId, setHoveredId] = useState(null);
  const [clickRipple, setClickRipple] = useState(null);
  const { openSidebar } = useChat();

  // Theme Toggler state
  const [theme, setTheme] = useState("dark");

  // Scroll Progress Bar configurations
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Track scrolling to darken navbar and observe active sections
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial theme check
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    // High performance IntersectionObserver for section highlighting (avoiding layout thrashing)
    const sections = ["home", "about", "skills", "projects", "certifications", "contact"];

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px", // focus target on central viewport region
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);



  const navItems = [
    { label: "Home", href: "#home", id: "home" },
    { label: "About Me", href: "#about", id: "about" },
    { label: "Skills", href: "#skills", id: "skills" },
    { label: "Projects", href: "#projects", id: "projects" },
    { label: "Certifications", href: "#certifications", id: "certifications" },
    { label: "Contact", href: "#contact", id: "contact" }
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const downloadResume = () => {
    onOpenResume();
    setMobileMenuOpen(false);
  };

  const scrollToChat = () => {
    openSidebar();
    setMobileMenuOpen(false);
  };



  return (
    <>
      {/* 2px gold scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-secondary origin-left z-[100]"
        style={{ scaleX }}
      />
      <header className={`fixed top-0 left-0 right-0 z-[90] flex justify-center p-4 md:p-6 transition-all duration-300 ${isPortalActive ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full max-w-7xl flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-500 ${
            isScrolled
              ? "bg-black/85 border-white/15 backdrop-blur-2xl"
              : "bg-white/5 border-white/8 backdrop-blur-lg shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          }`}
          style={{
            boxShadow: isScrolled
              ? "0 16px 48px -12px rgba(0,0,0,0.85), 0 0 24px var(--accent-glow)"
              : "0 4px 24px rgba(0,0,0,0.2)"
          }}
        >
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="flex items-center gap-2 group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-[#120c08] font-semibold text-sm tracking-wider font-space-grotesk">
              YJ
            </span>
            <span className="font-semibold text-base tracking-wide text-white group-hover:text-primary transition-colors duration-300 font-space-grotesk">
              Yash Jain
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                activeSection={activeSection}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
                handleNavClick={handleNavClick}
                clickRipple={clickRipple}
                setClickRipple={setClickRipple}
              />
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">


            <button
              onClick={downloadResume}
              className="h-10 flex items-center gap-1 px-4 rounded-full border border-white/10 bg-white/[0.03] text-xs font-semibold text-white/90 hover:bg-white/10 hover:border-primary/45 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer font-space-grotesk"
            >
              My Resume
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollToChat}
              className="h-10 flex items-center gap-1.5 px-4 rounded-full bg-gradient-to-r from-primary to-secondary text-[#120c08] text-xs font-semibold hover:shadow-[0_0_15px_var(--accent-glow)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer font-space-grotesk"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask Yash AI
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-2">


            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-20 left-4 right-4 z-40 p-6 rounded-3xl border border-white/10 bg-[#140f0a]/95 backdrop-blur-2xl shadow-2xl lg:hidden flex flex-col gap-5"
            >
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`px-4 py-2 text-base font-medium font-space-grotesk rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary border-l-2 border-primary pl-3"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="h-px bg-white/10 w-full" />

              <div className="flex flex-col gap-3">
                <button
                  onClick={downloadResume}
                  className="w-full flex items-center justify-center gap-1 py-3 rounded-full border border-white/15 bg-white/5 text-sm font-semibold font-space-grotesk text-white hover:bg-white/10"
                >
                  My Resume
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollToChat}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-[#120c08] text-sm font-semibold font-space-grotesk hover:bg-secondary"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask Yash AI
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
