import React from "react";
import { useAccentColors } from "@/hooks/useAccentColors";

export default function ProjectLights() {
  const accent = useAccentColors();

  return (
    <>
      {/* Soft ambient environment lighting */}
      <ambientLight intensity={0.65} />

      {/* Soft key light from top-front-right */}
      <directionalLight 
        position={[4, 6, 8]} 
        intensity={0.9} 
        color="#ffffff"
      />

      {/* Golden rim light from behind-left to trace glass bevels */}
      <directionalLight 
        position={[-6, 4, -6]} 
        intensity={0.4} 
        color={accent.primary} 
      />

      {/* Gentle fill light from bottom-left to soften shadows */}
      <directionalLight 
        position={[-4, -4, 4]} 
        intensity={0.5} 
        color="#8ab4f8" 
      />

      {/* Subtle front point light to create specular lens reflections */}
      <pointLight 
        position={[0, 0, 3.5]} 
        intensity={0.4} 
        decay={1.8}
      />
    </>
  );
}
