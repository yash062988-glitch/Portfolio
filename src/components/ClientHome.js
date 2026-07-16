"use client";

import { useState } from "react";
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

export default function ClientHome({ portraitImage }) {
  const [loading, setLoading] = useState(true);
  const [isPortalActive, setIsPortalActive] = useState(false);

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

              <div id="projects-section-container">
                <Projects />
              </div>

              <GalacticArchive setIsPortalActive={setIsPortalActive} />

              <Certifications />
            </main>

            <ContactFooterWrapper>
              <Contact />

              <Footer />
            </ContactFooterWrapper>

            <AskAISidebar />

            <FluidTrail />

            <CursorGlow />

            {/* {mountCompanion && <CharizardCompanion />} */}
          </div>
        </>
      )}

    </ChatProvider>
  );
}