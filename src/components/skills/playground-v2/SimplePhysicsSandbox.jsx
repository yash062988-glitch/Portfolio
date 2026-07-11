"use client";

import React, { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import SimplePlaygroundEnvironment from "./SimplePlaygroundEnvironment";
import SimpleSkillBlock from "./SimpleSkillBlock";

function SandboxContent({ sectionId, skills, isMobile }) {
  const { viewport } = useThree();
  const [blocks, setBlocks] = useState([]);

  const playWidth = (viewport.width * 0.75) / 2;
  const wallHeight = 10.0;

  useEffect(() => {
    const generated = [];
    const floorY = -2.1;
    const N = skills.length;
    const widthSpan = playWidth * 2 * 0.78;
    const step = N > 1 ? widthSpan / (N - 1) : 0;
    const startLeft = -widthSpan / 2;

    skills.forEach((skill, idx) => {
      const scatterX = (Math.random() - 0.5) * 0.1;
      const startX = startLeft + idx * step + scatterX;

      const isEven = idx % 2 === 0;
      const startY = floorY + 0.27 + (isEven ? 0.0 : 0.45) + (Math.random() - 0.5) * 0.04;
      const startRot = (Math.random() - 0.5) * 0.08;

      generated.push({
        id: `${sectionId}-${skill.name}`,
        skill,
        startX,
        startY,
        startRot
      });
    });
    setBlocks(generated);
  }, [skills, sectionId, playWidth]);

  return (
    <group>
      <SimplePlaygroundEnvironment playWidth={playWidth} wallHeight={wallHeight} />
      {blocks.map((block) => (
        <SimpleSkillBlock
          key={block.id}
          skill={block.skill}
          startX={block.startX}
          startY={block.startY}
          startRot={block.startRot}
          isMobile={isMobile}
          playWidth={playWidth}
        />
      ))}
    </group>
  );
}

export default function SimplePhysicsSandbox({ sectionId, skills }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 7.8], fov: 46 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{
        background: "transparent",
        width: "100%",
        height: "100%",
        pointerEvents: "auto"
      }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[1, 5, 6]} intensity={1.4} castShadow />
      <pointLight position={[-3, -3, 3]} intensity={0.5} />

      <Physics
        gravity={[0, isMobile ? -8.0 : -11.0, 0]}
        substeps={isMobile ? 1 : 2}
        paused={false}
      >
        <SandboxContent
          sectionId={sectionId}
          skills={skills}
          isMobile={isMobile}
        />
      </Physics>
    </Canvas>
  );
}
