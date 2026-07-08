import React from "react";
import { useFrame } from "@react-three/fiber";
import ProjectMesh from "./ProjectMesh";

export default function OrbitController({
  repeatedProjects,
  angleRef,
  velocityRef,
  targetVelocityRef,
  dragVelocityRef,
  isDraggingRef,
  selectedProject,
  onSelect,
  R
}) {
  const N_total = repeatedProjects.length;

  useFrame((state, delta) => {
    // Compute frame delta-time relative to 60Hz baseline
    let dt = delta * 60;
    if (dt > 10) dt = 1;

    // Freeze coordinates updates when a card is selected/focused
    if (selectedProject) return;

    // Orbit Friction & Momentum damping loops
    if (!isDraggingRef.current) {
      const target = targetVelocityRef.current;
      velocityRef.current = target + (velocityRef.current - target) * Math.exp(-0.045 * dt);
      angleRef.current += velocityRef.current * dt;
    } else {
      velocityRef.current = dragVelocityRef.current;
      angleRef.current += velocityRef.current * dt;
      dragVelocityRef.current *= Math.exp(-0.08 * dt);
    }
  });

  return (
    <>
      {repeatedProjects.map((project, idx) => (
        <ProjectMesh
          key={project.uniqueId}
          project={project}
          idx={idx}
          N_total={N_total}
          angleRef={angleRef}
          R={R}
          selectedProject={selectedProject}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
