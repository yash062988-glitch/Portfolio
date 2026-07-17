import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture, Html } from "@react-three/drei";
import { ExternalLink, ArrowRight } from "lucide-react";
import { GithubIcon } from "@/components/Icons";
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
  const htmlContainerRef = useRef(null);
  const lastZIndexRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Layout single source of truth constants
  const HTML_WIDTH_PX = 700;
  const HTML_HEIGHT_PX = 460;
  const ASPECT_RATIO = HTML_WIDTH_PX / HTML_HEIGHT_PX; // ~1.5217

  const boxWidth = N_total > 0 && typeof window !== "undefined" && window.innerWidth < 768 ? 1.7 : 2.8;
  const boxHeight = boxWidth / ASPECT_RATIO; // dynamic aspect ratio match
  const boxThickness = 0.12;

  // Named constant to visually align the HTML overlay relative to the RoundedBox face across browsers
  const HTML_VERTICAL_OFFSET = 0;

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
    const VISUAL_GAP = 1.35; // gap separating adjacent landscape cards
    const S = boxWidth + VISUAL_GAP; // spacing is dynamically derived from card width + visual gap
    const L = N_total * S; // Total belt loop length

    // Convert continuous rotation angle (in degrees) to linear scroll offset (in Three.js units)
    // Scaled by (3.60 / S) to ensure the linear travel speed is identical to the original design speed
    const scrollOffset = angleRef.current * (L / 360) * (3.60 / S);
    const xRaw = idx * S + scrollOffset;

    // Wrap position modulo L into the symmetric range [-L/2, L/2]
    const xWrapped = ((xRaw + L / 2) % L + L) % L - L / 2;

    // Visible window: render limits scale dynamically using a named multiplier
    const VISIBLE_RANGE_MULTIPLIER = 2.11;
    const maxRange = S * VISIBLE_RANGE_MULTIPLIER;
    const isRendered = Math.abs(xWrapped) <= maxRange;

    // Recede gently in depth (Z) as cards travel to the left/right margins
    const orbitX = xWrapped;
    const orbitY = 0;
    const orbitZ = -Math.abs(xWrapped) * 0.22; // Deeper receding curve for wider spacing

    // Rear card (center, x=0) is smallest; neighbouring cards gradually become larger towards the sides (hero cards)
    const isMobile = N_total > 0 && typeof window !== "undefined" && window.innerWidth < 768;
    const baseScaleVal = isMobile ? 0.95 : 1.20;
    const baseScale = baseScaleVal + Math.abs(xWrapped) * 0.08; 

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
    const focusScale = isMobile ? 1.25 : 1.55; // Centered scale factor
    const finalScale = finalOrbitScale + (focusScale - finalOrbitScale) * progress;

    if (groupRef.current) {
      groupRef.current.position.set(currentPos[0], currentPos[1], currentPos[2]);
      groupRef.current.rotation.set(currentRot[0], currentRot[1], currentRot[2]);
      groupRef.current.scale.setScalar(finalScale);
    }

    // 5. Opacity transitions: dim non-selected cards to 30% when focused, and apply early edge fadeout
    const baseCardOpacity = Math.max(0, 1 - Math.pow(Math.abs(xWrapped) / maxRange, 2.5));
    const targetOpacity = (selectedProject && !isSelected) ? 0.30 : 1.0;
    opacityRef.current += (targetOpacity - opacityRef.current) * (1 - Math.exp(-0.15 * dt));
    const currentOpacity = opacityRef.current * baseCardOpacity;

    // Update HTML overlay opacity, visibility, and dynamic DOM depth stacking directly in DOM (60 FPS bypass)
    const isCardVisible = isSelected || isRendered;
    if (htmlContainerRef.current) {
      htmlContainerRef.current.style.opacity = currentOpacity;
      htmlContainerRef.current.style.visibility = isCardVisible ? "visible" : "hidden";
      htmlContainerRef.current.style.transform = `scale(${finalScale})`;
      htmlContainerRef.current.style.transformOrigin = "center";
      
      const zIndex = Math.round((1 - Math.abs(xWrapped) / maxRange) * 100);
      if (lastZIndexRef.current !== zIndex) {
        lastZIndexRef.current = zIndex;
        const rootElement = htmlContainerRef.current.parentElement || htmlContainerRef.current;
        if (rootElement) {
          rootElement.style.zIndex = zIndex;
        }
      }
    }

    // Control mesh visibility (only display within the render window viewport)
    if (meshRef.current) {
      meshRef.current.visible = isSelected || isRendered;
    }
  });

  const accentColor = "var(--accent-glow)";
  const hoverBorderColor = "var(--accent-primary)";

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        {/* Volumetric Glass Card body: Width and height derived from layout constants */}
        <RoundedBox 
          args={[boxWidth, boxHeight, boxThickness]} 
          radius={0.08} 
          smoothness={4}
          bevelSegments={3}
          creaseAngle={0.4}
        >
          <meshBasicMaterial 
            transparent 
            opacity={0} 
            depthWrite={false} 
          />
        </RoundedBox>

        {/* HTML Card Face: Dimensions derived from single source of truth layout constants */}
        <Html
          transform
          center
          pointerEvents="none"
          distanceFactor={1.35}
          position={[0, HTML_VERTICAL_OFFSET, boxThickness / 2 - 0.003]}
          className="pointer-events-none select-none"
          style={{
            width: `${HTML_WIDTH_PX}px`,
            height: `${HTML_HEIGHT_PX}px`
          }}
        >
          <div 
            ref={htmlContainerRef}
            className="bg-transparent flex flex-col overflow-hidden select-none border-0 shadow-none group"
            style={{
              boxSizing: "border-box",
              width: "100%",
              height: "100%",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              minHeight: 0
            }}
          >
            {/* Wrapper for smooth card lift, tilt, and drop shadow hovers */}
            <div 
              className="project-card-wrapper flex flex-col relative rounded-[22px] min-w-0 min-h-0"
              style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                width: "100%",
                minWidth: 0,
                minHeight: 0,
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)"
              }}
            >
              {/* Default Border Overlay: GPU optimized */}
              <div className="absolute inset-0 rounded-[22px] border border-white/10 bg-transparent z-0 pointer-events-none" />

              {/* Hover Glow Overlay: GPU blend via opacity */}
              <div 
                className="absolute inset-0 rounded-[22px] border bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"
                style={{
                  borderColor: "var(--accent-primary)",
                  boxShadow: "0 20px 50px var(--accent-glow)",
                  transition: "opacity 280ms cubic-bezier(.22,.61,.36,1)"
                }}
              />

              {/* Upper Section split: 42% Image left, 58% Details right */}
              <div 
                className="grid gap-6 items-stretch min-h-0 min-w-0 z-10"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(260px, 42%) 1fr",
                  alignItems: "stretch",
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0
                }}
              >
                
                {/* Left side: Premium image media container */}
                <div 
                  className="relative rounded-[22px] bg-black/20 overflow-hidden shadow-lg border border-white/10 min-w-0 min-h-0"
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    maxWidth: "100%",
                    maxHeight: "100%"
                  }}
                >
                  {project.isPlaceholder ? (
                    <div className="w-full h-full bg-gradient-to-br from-black/40 to-[#1c120c]/60 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border border-dashed border-white/20 flex items-center justify-center bg-white/[0.02]">
                        <span className="text-2xl font-light text-white/30 font-mono">+</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Loading Shimmer Skeleton */}
                      {!imgLoaded && (
                        <div className="absolute inset-0 bg-white/[0.03] animate-pulse flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                        </div>
                      )}
                      
                      <img
                        src={project.image}
                        alt={project.title}
                        onLoad={() => setImgLoaded(true)}
                        loading="lazy"
                        className={`project-card-image w-full h-full object-contain object-center transition-opacity duration-300 ${
                          imgLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          maxWidth: "100%",
                          maxHeight: "100%"
                        }}
                        draggable="false"
                      />
                      
                      {/* Cinematic Vignette */}
                      <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                      
                      {/* Glass Sweep reflection overlay */}
                      <div className="reflection-sweep absolute inset-0 pointer-events-none" />
                    </>
                  )}
                  {/* Subtle Gold/Theme Edge Highlight */}
                  <div 
                    className="absolute inset-0 border rounded-[22px] pointer-events-none transition-all duration-280"
                    style={{
                      borderColor: isHovered ? hoverBorderColor : "rgba(255,255,255,0.1)"
                    }}
                  />
                </div>

                {/* Right side: Information Details */}
                <div 
                  className="flex flex-col pr-1 select-text overflow-hidden"
                  style={{
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minWidth: 0,
                    minHeight: 0
                  }}
                >
                  <span className="text-[9px] font-mono tracking-widest uppercase block font-bold leading-none mb-1 select-none overflow-wrap-anywhere word-break-break-word" style={{ color: "var(--accent-primary)" }}>
                    Featured Project
                  </span>
                  
                  <h4 
                    className="text-[28px] font-extrabold text-white leading-tight uppercase select-all"
                    style={{
                      overflowWrap: "anywhere",
                      wordBreak: "break-word"
                    }}
                  >
                    {project.title}
                  </h4>
                  
                  {/* Metadata Row: Category & Tech quick tags */}
                  <div 
                    className="flex flex-wrap items-center gap-1.5 mt-3 text-white/50 text-[12px] font-mono select-none min-w-0 min-h-0 overflow-hidden"
                    style={{
                      overflowWrap: "anywhere",
                      wordBreak: "break-word"
                    }}
                  >
                    <span className="font-bold uppercase" style={{ color: "var(--accent-primary)" }}>{project.category}</span>
                    {project.tech && project.tech.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="truncate">{project.tech.slice(0, 3).join(" • ")}</span>
                      </>
                    )}
                  </div>

                  {/* Flexible Description Area: Clamped to 4 lines, no scrollbars */}
                  <div 
                    className="flex items-start mt-4 overflow-hidden"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      minHeight: 0
                    }}
                  >
                    <p 
                      className="text-[16px] text-white/72 leading-[1.65] font-light line-clamp-4 select-text"
                      style={{
                        overflowWrap: "anywhere",
                        wordBreak: "break-word"
                      }}
                    >
                      {project.shortDesc}
                    </p>
                  </div>
                </div>

              </div>

              {/* Tech Stack Chips: Small Premium Rounded Pills (Height 34px, padded, centered) */}
              <div 
                className="flex flex-wrap gap-2 pt-4 flex-shrink-0 min-w-0 min-h-0 z-10"
                style={{
                  alignContent: "flex-start"
                }}
              >
                {!project.isPlaceholder && project.tech.slice(0, 4).map((t, idx) => (
                  <span
                    key={`${project.id}-${t}-${idx}`}
                    className="h-[34px] px-[14px] flex items-center rounded-full border border-white/10 bg-white/[0.04] text-[13px] font-medium font-mono text-white/60 transition-all duration-250 select-none flex-shrink-0 min-w-0"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Action Buttons Row (always bottom aligned, min 44px touch height) */}
              <div className="w-full pt-4 flex-shrink-0 min-w-0 min-h-0 z-10">
                {project.isPlaceholder ? (
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="pointer-events-auto flex items-center justify-center gap-2 h-[44px] rounded-full bg-primary hover:bg-[#FAF5EF] text-[15px] font-extrabold uppercase tracking-wider text-[#120c08] transition-all duration-300 w-full text-center select-none cursor-pointer min-w-0"
                    style={{ boxShadow: "0 4px 20px var(--accent-glow)" }}
                  >
                    Let's Build Yours
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                ) : (
                  <div 
                    className="grid gap-3 w-full min-w-0 min-h-0"
                    style={{
                      gridTemplateColumns: "1fr 1fr"
                    }}
                  >
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="pointer-events-auto flex items-center justify-center gap-2 h-[44px] rounded-full border border-white/10 hover:border-primary bg-black/30 hover:bg-black/60 text-[15px] font-extrabold uppercase tracking-wider text-white transition-all duration-300 w-full text-center select-none min-w-0"
                    >
                      <GithubIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">GitHub</span>
                    </a>
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="pointer-events-auto flex items-center justify-center gap-2 h-[44px] rounded-full bg-primary hover:bg-[#FAF5EF] text-[15px] font-extrabold uppercase tracking-wider text-[#120c08] transition-all duration-300 w-full text-center select-none min-w-0"
                      style={{ boxShadow: "0 4px 20px var(--accent-glow)" }}
                    >
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      <span className="truncate">Live Demo</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Html>
      </mesh>
    </group>
  );
}
