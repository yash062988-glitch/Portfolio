import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import ProjectLights from "./ProjectLights";
import OrbitController from "./OrbitController";

export default function ProjectScene({
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
  return (
    <div className="w-full h-full relative z-20 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        className="w-full h-full"
      >
        {/* Lights rig */}
        <ProjectLights />

        {/* Load texture planes asynchronously using React Suspense */}
        <Suspense fallback={null}>
          <OrbitController
            repeatedProjects={repeatedProjects}
            angleRef={angleRef}
            velocityRef={velocityRef}
            targetVelocityRef={targetVelocityRef}
            dragVelocityRef={dragVelocityRef}
            isDraggingRef={isDraggingRef}
            selectedProject={selectedProject}
            onSelect={onSelect}
            R={R}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
