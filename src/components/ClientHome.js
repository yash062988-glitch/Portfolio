"use client";

import { useState, useEffect } from "react";
import { ChatProvider } from "@/context/ChatContext";
import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import IdentityStrip from "@/sections/IdentityStrip";
import About from "@/sections/About";
import Skills from "@/sections/Skills";
import Projects from "@/sections/Projects";
import GalacticArchive from "@/sections/GalacticArchive";
import Certifications from "@/sections/Certifications";
import Contact from "@/sections/Contact";
import Footer from "@/components/Footer";
import AskAISidebar from "@/components/AskAISidebar";
import CursorGlow from "@/components/CursorGlow";
import ScrollRestoration from "@/components/ScrollRestoration";
import LoadingScreen from "@/components/LoadingScreen";
import GlobalStarfield from "@/components/GlobalStarfield";

import ContactFooterWrapper from "@/components/ContactFooterWrapper";
import FluidTrail from "@/components/FluidTrail";
import ResumeModal from "@/components/ResumeModal";

export default function ClientHome({ portraitImage }) {
  const [loading, setLoading] = useState(true);
  const [isPortalActive, setIsPortalActive] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const preloadAssets = () => {
      // Pre-decode essential images into GPU memory while loading screen plays
      const sources = [
        "/images/astronaut.png",
        "/images/contact-astronaut.png",
        "/favicon.png",
        portraitImage
      ].filter(Boolean);

      sources.forEach((src) => {
        const img = new window.Image();
        img.src = src;
        if (img.decode) {
          img.decode().catch(() => {});
        }
      });

      // Warm up video decoders
      const v1 = document.createElement("video");
      v1.src = "/hero-page-video.mp4";
      v1.preload = "auto";

      const v2 = document.createElement("video");
      v2.src = "/videos/real-footer-video.webm";
      v2.preload = "auto";
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preloadAssets);
    } else {
      setTimeout(preloadAssets, 100);
    }
  }, [portraitImage]);

  return (
    <ChatProvider>

      {/* Loading Screen - Overlay at z-[9999] covering the screen */}
      {loading && (
        <LoadingScreen
          onComplete={() => setLoading(false)}
        />
      )}

      {/* Mount background starfield */}
      <GlobalStarfield />

      {/* 
        Home page interface rendered at opacity 1 underneath LoadingScreen from initial mount.
        This ensures all components, Three.js canvases, fonts, and section layouts compile & paint
        into memory while LoadingScreen is visible. When user enters, the page is revealed INSTANTLY.
      */}
      <div 
        className={`relative min-h-screen bg-black overflow-x-hidden ${
          loading ? "pointer-events-none" : "pointer-events-auto"
        }`}
        style={{
          opacity: 1,
          willChange: "contents"
        }}
      >

        <ScrollRestoration />

        <Navbar isPortalActive={isPortalActive} onOpenResume={() => setIsResumeOpen(true)} />

        <main className="w-full">
          <Hero onOpenResume={() => setIsResumeOpen(true)} />

          <IdentityStrip />

          <About portraitImage={portraitImage} />

          <Skills />

          <div id="projects-section-container">
            <Projects />
          </div>

          <GalacticArchive setIsPortalActive={setIsPortalActive} />

          <Certifications />
        </main>

        <ContactFooterWrapper>
          <Contact />

          <Footer onOpenResume={() => setIsResumeOpen(true)} />
        </ContactFooterWrapper>

        <AskAISidebar />

        <FluidTrail />

        <CursorGlow />

        <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
      </div>

    </ChatProvider>
  );
}