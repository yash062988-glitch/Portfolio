"use client";

import React from "react";
import SkillsScene from "@/components/skills/SkillsScene";
import SkillsPlayground from "@/components/skills/playground/SkillsPlayground";

export default function Skills() {
  return (
    <section id="skills" className="w-full bg-[#0b0705] overflow-hidden bg-root-container">
      <SkillsScene />
      <SkillsPlayground />
    </section>
  );
}


