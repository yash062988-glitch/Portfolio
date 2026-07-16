import React from "react";

export default function ProjectMaterial({ isHovered }) {
  return (
    <meshPhysicalMaterial
      color="#ffffff"
      transmission={0.0}
      ior={1.5}
      thickness={0.0}
      roughness={0.02}
      metalness={0.0}
      clearcoat={1.0}
      clearcoatRoughness={0.0}
      reflectivity={1.0}
      envMapIntensity={2.5}
      transparent
      opacity={0.04}
      emissive={isHovered ? "#ffffff" : "#000000"}
      emissiveIntensity={isHovered ? 0.08 : 0.0}
    />
  );
}
