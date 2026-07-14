"use client";

import React from "react";
import PlaygroundSection from "./PlaygroundSection";
import { PLAYGROUND_SECTIONS } from "./data";

export default function SkillsPlayground() {
  return (
    <div className="w-full bg-black py-8 md:py-12 flex flex-col gap-0 relative z-10">
      {PLAYGROUND_SECTIONS.map((sec) => (
        <PlaygroundSection
          key={sec.id}
          sectionId={sec.id}
          title={sec.title}
          skills={sec.skills}
        />
      ))}
    </div>
  );
}
