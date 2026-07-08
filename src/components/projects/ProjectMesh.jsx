import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture, Html } from "@react-three/drei";
import ProjectMaterial from "./ProjectMaterial";
import useProjectSelection, { springStep } from "./useProjectSelection";
import useCardHover from "./useCardHover";

export default function ProjectMesh({
  project,
  idx,
  N_total,
  angleRef,
  R,
  selectedProject,
  onSelect
}) {
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const glassMaterialRef = useRef(null);
  const htmlContainerRef = useRef(null);

  // Load project texture safely (using suspends internally)
  const texture = useTexture(project.image);

  // Load custom hooks
  const {
    transitionProgressRef,
    transitionVelocityRef,
    interpolatePosition,
    interpolateRotation
  } = useProjectSelection();

  const {
    isHovered,
    hoverProgressRef,
    onPointerOver,
    onPointerOut,
    updateHoverProgress
  } = useCardHover();

  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const opacityRef = useRef(1.0);

  // Drag validation click detector
  const handlePointerDown = (e) => {
    if (selectedProject) return;
    e.stopPropagation();
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    if (selectedProject) return;
    e.stopPropagation();

    const diffX = e.clientX - pointerDownPosRef.current.x;
    const diffY = e.clientY - pointerDownPosRef.current.y;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

    // If pointer displacement is less than 8px, it is a click!
    if (dist <= 8) {
      onSelect(project);
    }
  };

  useFrame((state, delta) => {
    const dt = delta * 60;

    // 1. Mathematically wrapped infinite belt calculations
    const S = 2.20; // Spacing between card centers (eliminates intersections, leaves comfortable gaps)
    const L = N_total * S; // Total belt loop length

    // Convert continuous rotation angle (in degrees) to linear scroll offset (in Three.js units)
    const scrollOffset = angleRef.current * (L / 360);
    const xRaw = idx * S + scrollOffset;

    // Wrap position modulo L into the symmetric range [-L/2, L/2]
    const xWrapped = ((xRaw + L / 2) % L + L) % L - L / 2;

    // Visible window: render up to 4.80 units (allows 5-6 cards visible near margins)
    const isRendered = Math.abs(xWrapped) <= 4.80;

    // Recede gently in depth (Z) as cards travel to the left/right margins
    const orbitX = xWrapped;
    const orbitY = 0;
    const orbitZ = -Math.abs(xWrapped) * 0.15; // Subtle receding depth curve

    // Rear card (center, x=0) is smallest; neighbouring cards gradually become larger towards the sides (hero cards)
    const baseScale = 0.90 + Math.abs(xWrapped) * 0.12; 

    // 2. Subtle organic floating movements (X, Y, Z, and rotational tilts)
    const time = state.clock.getElapsedTime();
    const phase = idx * 0.6; // individual offsets
    const idleY = 0.025 * Math.sin(time * 1.4 + phase);
    const idleRotX = 0.012 * Math.sin(time * 0.8 + phase); // ~0.7 deg
    const idleRotZ = 0.007 * Math.cos(time * 1.0 + phase); // ~0.4 deg
    
    // Curved alignment Y rotation to slightly follow the receding curve depth
    const orbitRotY = -xWrapped * 0.08; 

    // 3. Update lightweight hover states
    const hoverVal = selectedProject ? 0 : updateHoverProgress(dt);
    const hoverScale = 1.0 + hoverVal * 0.06; // up to 1.06x
    const hoverZShift = hoverVal * 0.22; // lift toward camera

    // 4. Update project selection transition
    const isSelected = selectedProject?.id === project.id;
    const targetProgress = isSelected ? 1 : 0;
    
    transitionProgressRef.current = springStep(
      transitionProgressRef.current,
      targetProgress,
      transitionVelocityRef,
      delta
    );

    const progress = transitionProgressRef.current;

    // Linear interpolate position from slot/idle to focused coordinate (0, 0, 2.2)
    const focusPos = [0, 0, 2.2];
    const currentPos = interpolatePosition(
      [orbitX, orbitY + idleY, orbitZ + hoverZShift],
      focusPos,
      progress
    );

    // Linear interpolate rotation from orbit curve to flat facing camera
    const orbitRot = [idleRotX, orbitRotY, idleRotZ];
    const focusRot = [0, 0, 0];
    const currentRot = interpolateRotation(orbitRot, focusRot, progress);

    // Linear interpolate scales
    const finalOrbitScale = baseScale * hoverScale;
    const focusScale = 1.15; // Centered scale factor
    const finalScale = finalOrbitScale + (focusScale - finalOrbitScale) * progress;

    if (groupRef.current) {
      groupRef.current.position.set(currentPos[0], currentPos[1], currentPos[2]);
      groupRef.current.rotation.set(currentRot[0], currentRot[1], currentRot[2]);
      groupRef.current.scale.setScalar(finalScale);
    }

    // 5. Opacity transitions: dim non-selected cards to 30% when focused
    const targetOpacity = (selectedProject && !isSelected) ? 0.30 : 1.0;
    opacityRef.current += (targetOpacity - opacityRef.current) * (1 - Math.exp(-0.15 * dt));

    if (glassMaterialRef.current) {
      glassMaterialRef.current.opacity = opacityRef.current;
      glassMaterialRef.current.transparent = true;
    }

    // Update HTML overlay opacity and visibility directly in DOM (60 FPS bypass)
    const isCardVisible = isSelected || isRendered;
    if (htmlContainerRef.current) {
      htmlContainerRef.current.style.opacity = opacityRef.current;
      htmlContainerRef.current.style.visibility = isCardVisible ? "visible" : "hidden";
    }

    // Control mesh visibility (only display within the render window viewport)
    if (meshRef.current) {
      meshRef.current.visible = isSelected || isRendered;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        {/* Volumetric Glass Card body: Width 1.30, Height 1.85 (extended for bottom breathing space), Thickness 0.18, beveled glass border */}
        <RoundedBox 
          args={[1.30, 1.85, 0.18]} 
          radius={0.10} 
          smoothness={4}
          bevelSegments={3}
          creaseAngle={0.4}
        >
          <ProjectMaterial 
            ref={glassMaterialRef} 
            isHovered={isHovered && !selectedProject} 
          />
        </RoundedBox>

        {/* HTML Card Face: Transparent overlay, exactly matching the RoundedBox 1.30 x 1.85 aspect ratio (390px x 555px) */}
        <Html
          transform
          center // Center the HTML panel directly over the front WebGL mesh coordinates
          pointerEvents="none" // Allow R3F pointer events to pass through wrapper to WebGL mesh
          distanceFactor={1.33} // scales the HTML panel to fit the 1.30 x 1.85 3D card face exactly
          position={[0, 0, 0.09 - 0.003]} // offset slightly behind front face for premium glass inset look
          className="pointer-events-none select-none"
          style={{
            width: "390px",
            height: "555px"
          }}
        >
          <div 
            ref={htmlContainerRef}
            className="w-full h-full bg-transparent p-5 flex flex-col justify-between select-none border-0 shadow-none overflow-hidden transition-opacity duration-300"
          >
            {/* Project Image: Fixed 260px height (keeps size and position identical, respecting 20px padding) */}
            <div className="w-full h-[260px] relative overflow-hidden rounded-[12px] bg-black/10 border border-white/20 shadow-md shadow-black/20 shrink-0">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover pointer-events-none"
                draggable="false"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Content Details Layout with generous empty space at the bottom (pb-4) */}
            <div className="flex-grow flex flex-col justify-between pt-4 pb-4 overflow-hidden"> 
              <div className="flex flex-col gap-1 w-full overflow-hidden">
                <span className="text-[10px] font-mono tracking-widest text-[#e9b15d] uppercase block leading-none">
                  {project.category}
                </span>
                
                <h4 className="text-sm font-extrabold text-white tracking-tight uppercase leading-tight mt-1 truncate">
                  {project.title}
                </h4>
                
                <p className={`text-[11px] font-light leading-relaxed mt-1.5 line-clamp-2 transition-colors duration-300 ${
                  isHovered && !selectedProject ? "text-white/85" : "text-white/72"
                }`}>
                  {project.shortDesc}
                </p>
              </div>

              {/* Technologies Used Tags: Glass Pills, wrapped cleanly, never exceeding card width */}
              <div className="flex flex-wrap gap-1.5 mt-2 w-full overflow-hidden shrink-0"> 
                {project.tech.slice(0, 3).map((t, tIdx) => (
                  <span
                    key={`${project.id}-${t}-${tIdx}`}
                    className={`px-2.5 py-0.5 rounded-full border text-[9px] font-mono font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] truncate transition-all duration-300 ${
                      isHovered && !selectedProject
                        ? "bg-white/[0.14] border-white/20 text-white/80"
                        : "bg-white/[0.08] border-white/10 text-white/60"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Html>
      </mesh>
    </group>
  );
}
