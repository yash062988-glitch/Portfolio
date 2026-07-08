"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import SpaceStation from "./SpaceStation";

// Custom post-processing bloom effect component
function Bloom() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef();

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    // Configure bloom pass with strength: 0.10, radius: 0.20, threshold: 0.95
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.10,
      0.20,
      0.95
    );
    composer.addPass(bloomPass);

    composerRef.current = composer;

    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height);
    }
  }, [size]);

  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, 1);

  return null;
}

// Target screen occupancy: approximately 70-75% screen height, with a 10% safety margin
const CAMERA_FRAME_MARGIN = 0.72;

const STATUS_MESSAGES = [
  { text: "SCANNING CREATIVE ARCHIVE...", minProgress: 0, maxProgress: 15 },
  { text: "LOADING FEATURED PROJECTS...", minProgress: 15, maxProgress: 30 },
  { text: "SYNCHRONIZING INTERACTIVE EXPERIENCE...", minProgress: 30, maxProgress: 45 },
  { text: "PREPARING DESIGN SYSTEMS...", minProgress: 45, maxProgress: 60 },
  { text: "CALIBRATING 3D ENVIRONMENT...", minProgress: 60, maxProgress: 75 },
  { text: "ACTIVATING MOTION ENGINE...", minProgress: 75, maxProgress: 90 },
  { text: "COMPILING CREATIVE PORTFOLIO...", minProgress: 90, maxProgress: 95 },
  { text: "YOUR JOURNEY BEGINS NOW...", minProgress: 95, maxProgress: 100 }
];

const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

// Custom Error Boundary for loading safety
class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error("WebGL load error caught:", error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// Optimized Cosmic Dust points wrapper
function CosmicDust({ count = 120 }) {
  const pointsRef = useRef();

  const [positions, speeds] = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 4.5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      spd[i * 3] = (Math.random() - 0.5) * 0.015;
      spd[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    return [pos, spd];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      array[i * 3] += speeds[i * 3] * delta;
      array[i * 3 + 1] += speeds[i * 3 + 1] * delta;
      array[i * 3 + 2] += speeds[i * 3 + 2] * delta;

      const dist = Math.sqrt(array[i * 3] ** 2 + array[i * 3 + 1] ** 2 + array[i * 3 + 2] ** 2);
      if (dist > 7) {
        array[i * 3] = (Math.random() - 0.5) * 4;
        array[i * 3 + 1] = (Math.random() - 0.5) * 4;
        array[i * 3 + 2] = (Math.random() - 0.5) * 4;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffecc2"
        size={0.018}
        sizeAttenuation={true}
        transparent
        opacity={0.25}
        depthWrite={false}
      />
    </points>
  );
}

// Scene component managing lights, camera locks, and diagonal composition offsets
function Scene({ exitTriggered, onFirstRender, isLoaded, children }) {
  const floatingGroupRef = useRef();
  const currentScaleRef = useRef(1.0);

  useFrame((state) => {
    if (!isLoaded) return;

    // Detect first successful render pass
    if (onFirstRender) {
      onFirstRender();
    }

    const t = state.clock.getElapsedTime();

    // --- LOCKED CINEMATIC CAMERA WITH SUBTLE DRIFT ---
    const driftX = Math.sin(t * 0.15) * 0.02;     // X drift ±0.02
    const driftY = Math.cos(t * 0.12) * 0.015;    // Y drift ±0.015
    const driftZ = Math.sin(t * 0.09) * 0.02;     // Z drift ±0.02

    state.camera.position.set(
      -5.201 + driftX,
      2.448 + driftY,
      -4.269 + driftZ
    );

    // Freeze camera rotation exactly to the finalized manual angles
    state.camera.rotation.set(-2.62, -0.81, -2.75);
    state.camera.fov = 43;
    state.camera.updateProjectionMatrix();
    // Floating/levitation animations on the group wrapper
    if (floatingGroupRef.current) {
      floatingGroupRef.current.rotation.y = t * 0.005;
      floatingGroupRef.current.position.x = Math.sin(t * 0.07) * 0.02;
      floatingGroupRef.current.position.y = Math.sin(t * 0.11) * 0.015;
      floatingGroupRef.current.position.z = Math.cos(t * 0.09) * 0.02;

      floatingGroupRef.current.rotation.x = Math.sin(t * 0.05) * 0.004;
      floatingGroupRef.current.rotation.z = Math.cos(t * 0.08) * 0.004;

      // Exit zoom scaling
      const scaleTarget = exitTriggered ? 1.08 : 1.0;
      currentScaleRef.current = THREE.MathUtils.lerp(currentScaleRef.current, scaleTarget, 0.06);

      const breathingScale = 1.0 + Math.sin(t * 0.3) * 0.0015;
      const artisticScaleMultiplier = 1.30;
      floatingGroupRef.current.scale.setScalar(currentScaleRef.current * breathingScale * artisticScaleMultiplier);
    }
  });

  return (
    <group ref={floatingGroupRef}>
      {/* Deep black soft ambient light */}
      <ambientLight intensity={0.25} color="#090d16" />
      {/* Warm key light from upper-left / front */}
      <directionalLight position={[-12, 10, -8]} intensity={4.5} color="#ffdca8" />
      {/* Cool rim light from upper-right, slightly behind */}
      <directionalLight position={[-6, 8, 12]} intensity={2.2} color="#a0c5ff" />
      {/* Soft fill light to lift darkest shadows */}
      <directionalLight position={[10, -5, -6]} intensity={1.0} color="#85a3d4" />

      {/* Cinematic Diagonal Composition & Upper-Left Offset translation Wrapper */}
      <group position={[1.30, 1.24, -1.16]} rotation={[-0.03, 1.66, 0.21]}>
        {children}
      </group>
    </group>
  );
}

export default function LoadingScreen({ onComplete }) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [firstRenderCompleted, setFirstRenderCompleted] = useState(false);
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState("INITIALIZING...");
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [exitTriggered, setExitTriggered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const percentRef = useRef(0);
  const skipTriggered = useRef(false);
  const isCollapsing = useRef(false);

  const readyToProgress = modelLoaded && firstRenderCompleted;

  const requestRef = useRef();
  const lastTimeRef = useRef(0);
  const elapsedTimeRef = useRef(0);
  const skipStartTime = useRef(0);
  const skipStartPercent = useRef(0);

  const updateLoadingProgress = (delta) => {
    if (isCollapsing.current) return;

    let targetPercent = 0;

    if (skipTriggered.current) {
      // Accelerated Skip progression (interpolate to 100% over 500ms)
      const timeSinceSkip = elapsedTimeRef.current - skipStartTime.current;
      const t = Math.min(timeSinceSkip / 0.5, 1.0);
      targetPercent = Math.floor(lerp(skipStartPercent.current, 100, easeInOutQuad(t)));

      if (t >= 1.0) {
        targetPercent = 100;
        isCollapsing.current = true;
        setExitTriggered(true);
      }
    } else {
      // Normal loading progression (incrementally over 5 seconds)
      const progressTime = 5.0;
      const t = Math.min(elapsedTimeRef.current / progressTime, 1.0);
      targetPercent = Math.floor(lerp(0, 100, easeInOutQuad(t)));

      if (t >= 1.0) {
        targetPercent = 100;
        isCollapsing.current = true;
        setExitTriggered(true);
      }
    }

    percentRef.current = targetPercent;
    setPercent(targetPercent);

    const match = STATUS_MESSAGES.find(
      (m) => targetPercent >= m.minProgress && targetPercent <= m.maxProgress
    );
    if (match) setStatus(match.text);

    if (targetPercent >= 20 && !skipTriggered.current) {
      setShowSkipHint(true);
    }
  };

  const updateLoop = (timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const cappedDelta = Math.min(deltaTime, 0.1);

    if (readyToProgress || skipTriggered.current) {
      elapsedTimeRef.current += cappedDelta;
      updateLoadingProgress(cappedDelta);
    }

    if (percentRef.current < 100 || !isCollapsing.current) {
      requestRef.current = requestAnimationFrame(updateLoop);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 600);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [readyToProgress]);

  // Hook keyboard/mouse listeners for skipping loading screen
  useEffect(() => {
    const handleSkip = (e) => {
      if (skipTriggered.current) return;
      if (isCollapsing.current) return;

      if (e.type === "keydown") {
        if (e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey) return;
      }

      skipTriggered.current = true;
      setShowSkipHint(false);
      skipStartTime.current = elapsedTimeRef.current;
      skipStartPercent.current = percentRef.current;
    };

    window.addEventListener("click", handleSkip, { passive: true });
    window.addEventListener("touchstart", handleSkip, { passive: true });
    window.addEventListener("keydown", handleSkip);

    return () => {
      window.removeEventListener("click", handleSkip);
      window.removeEventListener("touchstart", handleSkip);
      window.removeEventListener("keydown", handleSkip);
    };
  }, [readyToProgress]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (onComplete) onComplete();
          }}
          className="fixed inset-0 z-[9999] select-none overflow-hidden bg-[#0b0705]"
        >
          {/* Faint gold center glow in background */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[#E9B15D]/3 blur-[100px] pointer-events-none top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 z-0 animate-[pulseGlow_8s_ease-in-out_infinite]" />

          {/* Full-screen 3D Canvas Frame */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            <CanvasErrorBoundary>
              <Canvas
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.90 }}
                camera={{ position: [-5.201, 2.448, -4.269], fov: 43 }}
                onCreated={({ camera }) => {
                  camera.position.set(-5.201, 2.448, -4.269);
                  camera.rotation.set(-2.62, -0.81, -2.75);
                  camera.updateProjectionMatrix();
                }}
                style={{ width: "100%", height: "100%" }}
                className="pointer-events-none"
              >
                <Suspense fallback={null}>
                  <Scene exitTriggered={exitTriggered} onFirstRender={() => setFirstRenderCompleted(true)} isLoaded={modelLoaded}>
                    <SpaceStation onLoad={() => setModelLoaded(true)} />
                  </Scene>
                </Suspense>
                <CosmicDust />
                <Bloom />
              </Canvas>
            </CanvasErrorBoundary>
          </div>

          {/* Loading UI - Lower-Right Quadrant */}
          <div className="absolute bottom-[8vh] right-[8vw] z-10 flex flex-col items-end text-right gap-4 pointer-events-none select-none">
            {/* Primary Cinematic Heading */}
            <div className="font-sans text-[10px] md:text-[11px] font-light tracking-[0.35em] uppercase text-white/40 mb-1">
              ENTERING YASH'S CREATIVE UNIVERSE
            </div>

            {/* Large loading percentage with gold styling */}
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-6xl md:text-7xl font-light tracking-tighter text-white">
                {percent}
              </span>
              <span className="text-[#E9B15D] text-3xl font-light">%</span>
            </div>

            {/* Thin premium progress line */}
            <div className="w-[200px] md:w-[240px] h-[1px] bg-white/10 relative overflow-hidden">
              <div
                className="h-full bg-[#E9B15D]"
                style={{ width: `${percent}%`, transition: "width 0.1s ease-out" }}
              />
            </div>

            {/* Progress Stages */}
            <div className="flex gap-2.5 text-[8px] md:text-[9px] font-bold tracking-[0.18em] uppercase">
              <span className={percent < 25 ? "text-[#E9B15D] transition-colors duration-300" : "text-white/20 transition-colors duration-300"}>CONNECT</span>
              <span className="text-white/10">•</span>
              <span className={percent >= 25 && percent < 50 ? "text-[#E9B15D] transition-colors duration-300" : "text-white/20 transition-colors duration-300"}>EXPLORE</span>
              <span className="text-white/10">•</span>
              <span className={percent >= 50 && percent < 75 ? "text-[#E9B15D] transition-colors duration-300" : "text-white/20 transition-colors duration-300"}>CREATE</span>
              <span className="text-white/10">•</span>
              <span className={percent >= 75 ? "text-[#E9B15D] transition-colors duration-300" : "text-white/20 transition-colors duration-300"}>EXPERIENCE</span>
            </div>

            {/* Small uppercase status text */}
            <div className="h-4 overflow-hidden flex items-center justify-end">
              <AnimatePresence mode="wait">
                <motion.span
                  key={status}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="font-sans text-[9px] md:text-[10px] font-bold tracking-[0.35em] uppercase text-white/50 block"
                >
                  {status}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Minimal Skip hint aligned to the right */}
            <div className="h-4 overflow-hidden flex items-center justify-end mt-2">
              <AnimatePresence>
                {showSkipHint && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.3, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ enter: { duration: 0.5 }, exit: { duration: 0.1 } }}
                    className="font-sans text-[9px] font-semibold tracking-[0.25em] text-white uppercase block"
                  >
                    [ CLICK ANYWHERE TO SKIP ]
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
