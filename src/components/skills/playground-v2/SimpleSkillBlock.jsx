"use client";

import React, { useRef } from "react";
import { useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export default function SimpleSkillBlock({ skill, startX, startY, startRot, playWidth }) {
  const rigidBodyRef = useRef(null);
  const isDragging = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const lastPosition = new THREE.Vector3();
  const lastTime = useRef(0);
  const velocity = useRef(new THREE.Vector3());

  const floorY = -2.1;
  const ceilingY = 2.1;

  const handlePointerDown = (e) => {
    e.stopPropagation();
    
    // Capture pointer to the mesh target
    e.target.setPointerCapture(e.pointerId);
    
    const body = rigidBodyRef.current;
    if (!body) return;

    // Wake up the body and make it Kinematic
    body.setBodyType(2, true); // KinematicPositionBased
    body.wakeUp();

    // Find the cursor intersection with the Z=0 plane
    const intersectionPoint = new THREE.Vector3();
    e.raycaster.ray.intersectPlane(dragPlane, intersectionPoint);

    // Compute coordinate offset relative to the block's current position
    const bodyPos = body.translation();
    const bodyVec = new THREE.Vector3(bodyPos.x, bodyPos.y, bodyPos.z);
    dragOffset.current.copy(intersectionPoint).sub(bodyVec);

    isDragging.current = true;
    lastPosition.copy(bodyVec);
    lastTime.current = performance.now();
    velocity.current.set(0, 0, 0);

    document.body.style.cursor = "grabbing";
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    e.stopPropagation();

    const body = rigidBodyRef.current;
    if (!body) return;

    // Project cursor ray onto Z=0 drag plane
    const intersectionPoint = new THREE.Vector3();
    e.raycaster.ray.intersectPlane(dragPlane, intersectionPoint);

    // Compute target position including offset
    const targetPos = new THREE.Vector3().copy(intersectionPoint).sub(dragOffset.current);

    // Clamp coordinates to stay inside the sandbox boundaries
    targetPos.x = Math.max(-playWidth + 0.65, Math.min(playWidth - 0.65, targetPos.x));
    targetPos.y = Math.max(floorY + 0.25, Math.min(ceilingY - 0.25, targetPos.y));
    targetPos.z = 0;

    body.setNextKinematicTranslation(targetPos);

    // Track instant velocity for realistic throws on release
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      const instantVelocity = new THREE.Vector3()
        .copy(targetPos)
        .sub(lastPosition)
        .multiplyScalar(1000 / dt);
      
      // Smooth out jittery velocity frames
      velocity.current.lerp(instantVelocity, 0.4);
    }
    lastPosition.copy(targetPos);
    lastTime.current = now;
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    e.stopPropagation();

    // Release pointer capture
    e.target.releasePointerCapture(e.pointerId);

    isDragging.current = false;

    const body = rigidBodyRef.current;
    if (body) {
      body.setBodyType(0, true); // Dynamic

      // Apply proportional throw impulse
      const throwVel = new THREE.Vector3().copy(velocity.current);
      throwVel.clampLength(0, 15); // limit velocity magnitude
      body.setLinvel({ x: throwVel.x * 0.15, y: throwVel.y * 0.15, z: 0 }, true);
    }

    document.body.style.cursor = "grab";
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    if (!isDragging.current) {
      document.body.style.cursor = "grab";
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    if (!isDragging.current) {
      document.body.style.cursor = "auto";
    }
  };

  const mass = 1.0 * (0.85 + Math.random() * 0.3);

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      colliders="cuboid"
      position={[startX, startY, 0]}
      rotation={[0, 0, startRot]}
      mass={mass}
      restitution={0.05}
      friction={0.8}
      linearDamping={1.0}
      angularDamping={1.0}
      enabledTranslations={[true, true, false]}
      enabledRotations={[false, false, true]}
      canSleep={true}
    >
      <mesh
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1.3, 0.5, 0.1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
}
