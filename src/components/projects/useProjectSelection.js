import { useRef } from "react";

// Standard spring physics step function running inside the useFrame loop
export function springStep(current, target, velocityRef, dt, stiffness = 180, damping = 22) {
  // Clamp delta time to avoid explosions on focus loss
  const clampedDt = Math.min(dt, 0.1);
  const force = (target - current) * stiffness;
  velocityRef.current += (force - velocityRef.current * damping) * clampedDt;
  return current + velocityRef.current * clampedDt;
}

export default function useProjectSelection() {
  const transitionProgressRef = useRef(0); // 0: orbit, 1: focused at camera
  const transitionVelocityRef = useRef(0);

  const interpolatePosition = (orbitPos, targetPos, progress) => {
    return [
      orbitPos[0] + (targetPos[0] - orbitPos[0]) * progress,
      orbitPos[1] + (targetPos[1] - orbitPos[1]) * progress,
      orbitPos[2] + (targetPos[2] - orbitPos[2]) * progress
    ];
  };

  const interpolateRotation = (orbitRot, targetRot, progress) => {
    return [
      orbitRot[0] + (targetRot[0] - orbitRot[0]) * progress,
      orbitRot[1] + (targetRot[1] - orbitRot[1]) * progress,
      orbitRot[2] + (targetRot[2] - orbitRot[2]) * progress
    ];
  };

  return {
    transitionProgressRef,
    transitionVelocityRef,
    interpolatePosition,
    interpolateRotation
  };
}
