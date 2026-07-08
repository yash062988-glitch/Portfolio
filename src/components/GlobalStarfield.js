"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import * as THREE from "three";
import GlobalParticles from "./GlobalParticles"; // Fallback component

// Developer-only debugging flag
const DEBUG_STARFIELD = process.env.NODE_ENV === "development" && false;

// Centralized configuration driven by final engineering refinements
const STARFIELD_CONFIG = {
  quality: {
    // Dynamic star & dust count definitions per device type
    desktop: { stars: 7500, dust: 1500 },
    tablet: { stars: 4000, dust: 900 },
    mobile: { stars: 2000, dust: 400 }
  },
  stars: {
    // Curated color palette matching portfolio colors
    colorPalette: [
      [1.0, 1.0, 1.0],       // Pure white
      [0.86, 0.90, 1.0],      // Blue-white
      [0.66, 0.94, 1.0],      // Soft cyan
      [0.88, 0.66, 1.0],      // Soft purple
      [0.91, 0.69, 0.36]       // Warm gold
    ],
    // Star layer sizes (Far, Mid-Far, Mid-Near, Near)
    sizes: { far: 0.018, midFar: 0.03, midNear: 0.048, near: 0.07 }
  },
  dust: {
    size: 0.008,
    opacity: 0.04,
    radius: 22
  },
  nebula: {
    opacity: 0.025,
    color1: "#a855f7", // Soft purple
    color2: "#06b6d4", // Soft cyan
    scale: 32
  },
  shootingStars: {
    minInterval: 20, // Min seconds between triggers
    maxInterval: 60, // Max seconds between triggers
    duration: 0.7,   // Speed of shooting star (seconds)
    maxOpacity: 0.85,
    color: "#ffffff"
  },
  motion: {
    // Layer-specific organic drift cycles (drift velocity amplitudes)
    driftSpeed: { far: 0.003, midFar: 0.005, midNear: 0.010, near: 0.001 },
    parallaxStrength: 0.008, // Maximum mouse parallax tilt (~0.45 degrees)
    dampening: 0.04
  },
  performance: {
    targetFps: 60,
    lowFpsThreshold: 45,
    highFpsThreshold: 55,
    calibrationDuration: 3.0, // Initial calibration phase (seconds)
    lowDurationLimit: 2.5,     // Downgrade quality if below 45 FPS for 2.5s
    highDurationLimit: 5.0     // Upgrade quality if above 55 FPS for 5.0s
  },
  debug: {
    enabled: DEBUG_STARFIELD
  }
};

// Shader Material for the simplified procedural radial Nebula cloud
const NebulaShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(STARFIELD_CONFIG.nebula.color1) },
    uColor2: { value: new THREE.Color(STARFIELD_CONFIG.nebula.color2) },
    uOpacity: { value: STARFIELD_CONFIG.nebula.opacity }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uOpacity;

    void main() {
      // Coordinate mapping from -1.0 to 1.0
      vec2 uv = vUv * 2.0 - 1.0;
      float dist = length(uv);
      
      // Radial cloud fade mask
      float mask = smoothstep(1.0, 0.0, dist);
      if (mask <= 0.0) discard;
      
      // Lightweight single-pass drifting noise
      float n1 = sin(uv.x * 2.5 + uTime * 0.08) * cos(uv.y * 2.5 + uTime * 0.12);
      float n2 = cos(uv.x * 1.8 - uTime * 0.06) * sin(uv.y * 1.8 + uTime * 0.10);
      float n = (n1 + n2) * 0.5 + 0.5;
      
      vec3 color = mix(uColor1, uColor2, n);
      float alpha = mask * n * uOpacity;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
};

// Internal WebGL scene rendering R3F Canvas components
function StarfieldScene({ isPausedRef, reducedMotion, debugEnabled, setDebugStats }) {
  const groupRef = useRef();
  const farRef = useRef();
  const midFarRef = useRef();
  const midNearRef = useRef();
  const nearRef = useRef();
  const dustRef = useRef();
  const shootingStarRef = useRef();

  // Mouse coords mapped from -1 to 1
  const mouseRef = useRef({ x: 0, y: 0 });

  // 1. Density Setup & Allocation
  const [maxStars, maxDust] = useMemo(() => {
    // Allocate full desktop capacity so we never need to allocate memory during runtime
    return [STARFIELD_CONFIG.quality.desktop.stars, STARFIELD_CONFIG.quality.desktop.dust];
  }, []);

  // 2. Generate point positions & color attributes
  const [starPositions, starColors, dustPositions] = useMemo(() => {
    const starsPos = random.inSphere(new Float32Array(maxStars * 3), { radius: 18 });
    const dustPos = random.inSphere(new Float32Array(maxDust * 3), { radius: STARFIELD_CONFIG.dust.radius });

    const starsCol = new Float32Array(maxStars * 3);
    const palette = STARFIELD_CONFIG.stars.colorPalette;
    for (let i = 0; i < maxStars; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      starsCol[i * 3] = color[0];
      starsCol[i * 3 + 1] = color[1];
      starsCol[i * 3 + 2] = color[2];
    }

    return [starsPos, starsCol, dustPos];
  }, [maxStars, maxDust]);

  // Divide indices for 4 layers (Far: 50%, Mid-Far: 30%, Mid-Near: 15%, Near: 5%)
  const layerRanges = useMemo(() => {
    const farCount = Math.floor(maxStars * 0.50);
    const midFarCount = Math.floor(maxStars * 0.30);
    const midNearCount = Math.floor(maxStars * 0.15);
    const nearCount = maxStars - farCount - midFarCount - midNearCount;

    return {
      far: { start: 0, count: farCount },
      midFar: { start: farCount, count: midFarCount },
      midNear: { start: farCount + midFarCount, count: midNearCount },
      near: { start: farCount + midFarCount + midNearCount, count: nearCount }
    };
  }, [maxStars]);

  // 3. Nebula Shader Material setup
  const nebulaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(STARFIELD_CONFIG.nebula.color1) },
        uColor2: { value: new THREE.Color(STARFIELD_CONFIG.nebula.color2) },
        uOpacity: { value: STARFIELD_CONFIG.nebula.opacity }
      },
      vertexShader: NebulaShaderMaterial.vertexShader,
      fragmentShader: NebulaShaderMaterial.fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending
    });
  }, []);

  // 4. Shooting Star State Management
  const shootingStarState = useRef({
    active: false,
    progress: 0,
    duration: STARFIELD_CONFIG.shootingStars.duration,
    start: new THREE.Vector3(),
    end: new THREE.Vector3(),
    nextTriggerTime: 10 // Start trigger in 10s
  });

  // Track performance scaling variables
  const perfRef = useRef({
    initialized: false,
    frameCount: 0,
    elapsedTime: 0,
    avgFps: 60,
    runningFps: 60,
    qualityLevel: 0, // 0 = High, 1 = Med, 2 = Low
    lowFpsTimer: 0,
    highFpsTimer: 0
  });

  // Add mouse listener for parallax target coords
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 5. Frameloop updates: drift, parallax, calibration, adaptive scaling, twinkling
  useFrame((state, delta) => {
    // Guard against tab hidden Page Visibility state
    if (isPausedRef.current) return;

    const time = state.clock.getElapsedTime();
    const tFps = 1 / Math.max(delta, 0.005);
    const p = perfRef.current;

    // 5a. Performance monitoring & Calibration
    p.frameCount++;
    p.elapsedTime += delta;

    if (!p.initialized) {
      // First 3 seconds: Startup calibration
      if (p.elapsedTime >= STARFIELD_CONFIG.performance.calibrationDuration) {
        p.avgFps = p.frameCount / p.elapsedTime;
        p.runningFps = p.avgFps;

        // Set initial tier based on calibration
        if (p.avgFps >= 58) p.qualityLevel = 0;
        else if (p.avgFps >= 48) p.qualityLevel = 1;
        else p.qualityLevel = 2;

        p.initialized = true;
        p.lowFpsTimer = 0;
        p.highFpsTimer = 0;
      }
    } else {
      // Ongoing adaptive quality check: exponential decay average filter
      p.runningFps = p.runningFps * 0.95 + tFps * 0.05;

      // Handle quality level transitions with debounced thresholds
      if (p.runningFps < STARFIELD_CONFIG.performance.lowFpsThreshold) {
        p.lowFpsTimer += delta;
        p.highFpsTimer = 0;
        if (p.lowFpsTimer >= STARFIELD_CONFIG.performance.lowDurationLimit && p.qualityLevel < 2) {
          p.qualityLevel++;
          p.lowFpsTimer = 0;
        }
      } else if (p.runningFps > STARFIELD_CONFIG.performance.highFpsThreshold) {
        p.highFpsTimer += delta;
        p.lowFpsTimer = 0;
        if (p.highFpsTimer >= STARFIELD_CONFIG.performance.highDurationLimit && p.qualityLevel > 0) {
          p.qualityLevel--;
          p.highFpsTimer = 0;
        }
      } else {
        p.lowFpsTimer = 0;
        p.highFpsTimer = 0;
      }
    }

    // Determine current active scale limits based on quality
    const targetScale = p.qualityLevel === 0 ? 1.0 : p.qualityLevel === 1 ? 0.6 : 0.3;
    const deviceType = window.innerWidth >= 1024 ? "desktop" : window.innerWidth >= 768 ? "tablet" : "mobile";
    const baseStars = STARFIELD_CONFIG.quality[deviceType].stars;
    const baseDust = STARFIELD_CONFIG.quality[deviceType].dust;

    const activeStars = Math.floor(baseStars * targetScale);
    const activeDust = Math.floor(baseDust * targetScale);

    // Apply draw range limits on BufferGeometries dynamically (no buffer allocations)
    if (farRef.current) farRef.current.geometry.setDrawRange(0, Math.floor(layerRanges.far.count * targetScale));
    if (midFarRef.current) midFarRef.current.geometry.setDrawRange(0, Math.floor(layerRanges.midFar.count * targetScale));
    if (midNearRef.current) midNearRef.current.geometry.setDrawRange(0, Math.floor(layerRanges.midNear.count * targetScale));
    if (nearRef.current) nearRef.current.geometry.setDrawRange(0, Math.floor(layerRanges.near.count * targetScale));
    if (dustRef.current) dustRef.current.geometry.setDrawRange(0, activeDust);

    // 5b. Update Debug logs
    if (debugEnabled && setDebugStats) {
      setDebugStats({
        fps: Math.round(p.initialized ? p.runningFps : tFps),
        quality: p.qualityLevel === 0 ? "High" : p.qualityLevel === 1 ? "Medium" : "Low",
        stars: activeStars,
        dust: activeDust,
        calibrating: !p.initialized,
        dpr: state.viewport.dpr.toFixed(1),
        reducedMotion
      });
    }

    // Update Nebula time uniform
    if (nebulaMaterial) {
      nebulaMaterial.uniforms.uTime.value = time;
    }

    // 5c. Layer rotation & Organic drifts (disabled or minimized under prefers-reduced-motion)
    const driftMult = reducedMotion ? 0.05 : 1.0;
    const timeScale = time * driftMult;

    // Sinusoidal velocity profiles allow layers to drift, slow down, pause, and slightly reverse
    if (farRef.current) {
      farRef.current.rotation.y += Math.sin(timeScale * 0.04) * STARFIELD_CONFIG.motion.driftSpeed.far * delta;
    }
    if (midFarRef.current) {
      midFarRef.current.rotation.y -= Math.cos(timeScale * 0.05) * STARFIELD_CONFIG.motion.driftSpeed.midFar * delta;
    }
    if (midNearRef.current) {
      // Vertical sinusoidal translation drift
      midNearRef.current.position.y = Math.sin(timeScale * 0.08) * 0.08;
      midNearRef.current.rotation.y += Math.sin(timeScale * 0.03) * STARFIELD_CONFIG.motion.driftSpeed.midNear * delta;
    }
    if (nearRef.current) {
      nearRef.current.rotation.y += Math.cos(timeScale * 0.06) * STARFIELD_CONFIG.motion.driftSpeed.near * delta;
    }

    // 5d. Twinkle intensity animation
    const farTwinkle = 0.8 + Math.sin(time * STARFIELD_CONFIG.performance.targetFps * 0.02) * (reducedMotion ? 0.02 : 0.2);
    const medTwinkle = 0.8 + Math.sin(time * STARFIELD_CONFIG.performance.targetFps * 0.03 + 1) * (reducedMotion ? 0.02 : 0.2);
    const nearTwinkle = 0.85 + Math.cos(time * STARFIELD_CONFIG.performance.targetFps * 0.04 + 2) * (reducedMotion ? 0.01 : 0.15);

    if (farRef.current) farRef.current.material.opacity = farTwinkle;
    if (midFarRef.current) midFarRef.current.material.opacity = medTwinkle;
    if (midNearRef.current) midNearRef.current.material.opacity = medTwinkle;
    if (nearRef.current) nearRef.current.material.opacity = nearTwinkle;

    // 5e. Mouse Parallax (limited to 0.5-1 degrees, completely disabled if prefers-reduced-motion)
    if (groupRef.current) {
      const pStrength = reducedMotion ? 0 : STARFIELD_CONFIG.motion.parallaxStrength;
      const targetRotX = -mouseRef.current.y * pStrength;
      const targetRotY = mouseRef.current.x * pStrength;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, STARFIELD_CONFIG.motion.dampening);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, STARFIELD_CONFIG.motion.dampening);
    }

    // 5f. Shooting Star Simulation (disabled during low performance or prefers-reduced-motion)
    const ss = shootingStarState.current;
    if (reducedMotion || p.qualityLevel === 2) {
      ss.active = false;
      if (shootingStarRef.current) shootingStarRef.current.visible = false;
    } else {
      if (ss.active) {
        ss.progress += delta / ss.duration;
        if (ss.progress >= 1.0) {
          ss.active = false;
          if (shootingStarRef.current) shootingStarRef.current.visible = false;
          
          // Schedule next shooting star
          const nextWait = STARFIELD_CONFIG.shootingStars.minInterval + 
            Math.random() * (STARFIELD_CONFIG.shootingStars.maxInterval - STARFIELD_CONFIG.shootingStars.minInterval);
          ss.nextTriggerTime = time + nextWait;
        } else {
          // Update shooting star coordinates
          if (shootingStarRef.current) {
            shootingStarRef.current.visible = true;
            const currentPos = new THREE.Vector3().lerpVectors(ss.start, ss.end, ss.progress);
            shootingStarRef.current.position.copy(currentPos);
            
            // Fading trail opacity
            const opacity = Math.sin(ss.progress * Math.PI) * STARFIELD_CONFIG.shootingStars.maxOpacity;
            shootingStarRef.current.material.opacity = opacity;
          }
        }
      } else {
        // Trigger shooting star check
        if (time >= ss.nextTriggerTime) {
          ss.active = true;
          ss.progress = 0;
          
          // Pick randomized start and end paths in camera coordinates
          const randomSideY = (Math.random() * 2 - 1) * 3;
          const randomSideX = (Math.random() * 2 - 1) * 4;
          
          ss.start.set(randomSideX - 3.5, randomSideY + 1.5, -8);
          ss.end.set(randomSideX + 3.5, randomSideY - 1.5, -8);
          
          ss.nextTriggerTime = time + 99999; // Prevent multiple fires
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Procedural Shader-based Nebula Cloud Plane */}
      <mesh position={[0, 0, -25]} scale={[STARFIELD_CONFIG.nebula.scale, STARFIELD_CONFIG.nebula.scale, 1]}>
        <planeGeometry args={[1, 1]} />
        <primitive object={nebulaMaterial} attach="material" />
      </mesh>

      {/* Layer 2: Global Star layers */}
      {/* 1. Far Stars */}
      <Points
        ref={farRef}
        positions={starPositions.subarray(layerRanges.far.start * 3, (layerRanges.far.start + layerRanges.far.count) * 3)}
        colors={starColors.subarray(layerRanges.far.start * 3, (layerRanges.far.start + layerRanges.far.count) * 3)}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={STARFIELD_CONFIG.stars.sizes.far}
          sizeAttenuation={true}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* 2. Mid Far Stars */}
      <Points
        ref={midFarRef}
        positions={starPositions.subarray(layerRanges.midFar.start * 3, (layerRanges.midFar.start + layerRanges.midFar.count) * 3)}
        colors={starColors.subarray(layerRanges.midFar.start * 3, (layerRanges.midFar.start + layerRanges.midFar.count) * 3)}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={STARFIELD_CONFIG.stars.sizes.midFar}
          sizeAttenuation={true}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* 3. Mid Near Stars */}
      <Points
        ref={midNearRef}
        positions={starPositions.subarray(layerRanges.midNear.start * 3, (layerRanges.midNear.start + layerRanges.midNear.count) * 3)}
        colors={starColors.subarray(layerRanges.midNear.start * 3, (layerRanges.midNear.start + layerRanges.midNear.count) * 3)}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={STARFIELD_CONFIG.stars.sizes.midNear}
          sizeAttenuation={true}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* 4. Near Stars */}
      <Points
        ref={nearRef}
        positions={starPositions.subarray(layerRanges.near.start * 3, (layerRanges.near.start + layerRanges.near.count) * 3)}
        colors={starColors.subarray(layerRanges.near.start * 3, (layerRanges.near.start + layerRanges.near.count) * 3)}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          vertexColors
          size={STARFIELD_CONFIG.stars.sizes.near}
          sizeAttenuation={true}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* 5. Galaxy Dust Layer (Between nebula and far stars) */}
      <Points
        ref={dustRef}
        positions={dustPositions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color="#a8f0ff"
          opacity={STARFIELD_CONFIG.dust.opacity}
          size={STARFIELD_CONFIG.dust.size}
          sizeAttenuation={true}
          depthWrite={false}
          depthTest={true}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* 6. Active Shooting Star mesh */}
      <mesh ref={shootingStarRef} visible={false}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial
          color={STARFIELD_CONFIG.shootingStars.color}
          transparent
          depthWrite={false}
          depthTest={true}
        />
      </mesh>
    </group>
  );
}

// Main background component that checks capabilities, monitors Page Visibility, and exports default
export default function GlobalStarfield() {
  const [webglAvailable, setWebGLAvailable] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Stats hook state for development debug overlay
  const [debugStats, setDebugStats] = useState(null);
  const isDev = process.env.NODE_ENV !== "production";

  // Check WebGL availability and prefers-reduced-motion media query
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch (e) {
        return false;
      }
    };

    setWebGLAvailable(checkWebGL());

    // Reduced motion query
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e) => {
      setReducedMotion(e.matches);
    };
    motionQuery.addEventListener("change", handleMotionChange);

    // Page Visibility API listeners
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
      isPausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // WebGL Graceful Fallback
  if (!webglAvailable) {
    return <GlobalParticles />;
  }

  return (
    <>
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none z-[2] select-none"
        style={{ background: "transparent" }}
      >
        <Canvas
          dpr={[1, 1.5]} // Performance limit device pixel ratio (saves GPU fill-rate)
          gl={{
            antialias: false,
            alpha: true,
            stencil: false,
            depth: true // Keep depth buffer enabled for depth sorting
          }}
          camera={{ position: [0, 0, 1], fov: 60 }}
          style={{ width: "100%", height: "100%" }}
        >
          <StarfieldScene 
            isPausedRef={isPausedRef} 
            reducedMotion={reducedMotion} 
            debugEnabled={DEBUG_STARFIELD}
            setDebugStats={setDebugStats}
          />
        </Canvas>
      </div>

      {/* Development Debug Overlay (Excluded in production builds) */}
      {DEBUG_STARFIELD && debugStats && (
        <div 
          className="fixed top-20 left-4 z-[99] bg-[#0b0705]/95 border border-primary/20 p-4 rounded-[16px] font-mono text-[10px] text-primary/80 leading-normal flex flex-col gap-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] pointer-events-none select-none max-w-[240px]"
        >
          <div className="font-bold text-white border-b border-primary/10 pb-1 mb-1 text-[11px] tracking-wide">
            STARFIELD STATUS
          </div>
          <div>FPS: <span className="text-white">{debugStats.fps}</span> {debugStats.calibrating && <span className="text-emerald-400 font-bold">(calibrating)</span>}</div>
          <div>Quality Tier: <span className="text-white font-semibold">{debugStats.quality}</span></div>
          <div>Stars: <span className="text-white">{debugStats.stars}</span></div>
          <div>Dust Count: <span className="text-white">{debugStats.dust}</span></div>
          <div>DPR: <span className="text-white">{debugStats.dpr}</span></div>
          <div>WebGL context: <span className="text-white">Active</span></div>
          <div>Reduced Motion: <span className={debugStats.reducedMotion ? "text-amber-400 font-bold" : "text-white"}>{debugStats.reducedMotion ? "ON" : "OFF"}</span></div>
        </div>
      )}
    </>
  );
}
