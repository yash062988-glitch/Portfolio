"use client";

import React from "react";
import SkillsScene from "@/components/skills/SkillsScene";
import SkillsPlayground from "@/components/skills/playground/SkillsPlayground";
import PlaygroundV2 from "@/components/skills/playground-v2/PlaygroundV2";

const USE_NEW_PLAYGROUND = true;

export default function Skills() {
  return (
    <section id="skills" className="w-full bg-black overflow-hidden bg-root-container">
      <SkillsScene />
      {USE_NEW_PLAYGROUND ? <PlaygroundV2 /> : <SkillsPlayground />}
    </section>
  );
}


