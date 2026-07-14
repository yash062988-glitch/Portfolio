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
import dynamic from "next/dynamic";

const CharizardCompanion = dynamic(
  () => import("@/components/charizard/components/Viewer").then((mod) => mod.Viewer),
  { ssr: false }
);

export default function ClientHome({ portraitImage }) {
  const [loading, setLoading] = useState(true);
  const [isPortalActive, setIsPortalActive] = useState(false);
  const [mountCompanion, setMountCompanion] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setMountCompanion(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <ChatProvider>

      {/* Loading Screen - Only active Canvas during startup */}
      {loading && (
        <LoadingScreen
          onComplete={() => setLoading(false)}
        />
      )}

      {!loading && (
        <>
          {/* Mount the background only after the loader finishes */}
          <GlobalStarfield />

          <div className="relative min-h-screen bg-black overflow-x-hidden">

            <ScrollRestoration />

            <Navbar isPortalActive={isPortalActive} />

            <main className="w-full">
              <Hero />

              <IdentityStrip />

              <About portraitImage={portraitImage} />

              <Skills />

              <Projects />

              <GalacticArchive setIsPortalActive={setIsPortalActive} />

              <Certifications />
            </main>

            <ContactFooterWrapper>
              <Contact />

              <Footer />
            </ContactFooterWrapper>

            <AskAISidebar />

            <CursorGlow />

            {mountCompanion && <CharizardCompanion />}
          </div>
        </>
      )}

    </ChatProvider>
  );
}