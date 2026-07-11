"use client";

import React, { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, useSpringJoint } from "@react-three/rapier";
import * as THREE from "three";

function SpringJointConnection({ body1, body2 }) {
  useSpringJoint(body1, body2, [
    [0, 0, 0], // local anchor on body 1
    [0, 0, 0], // local anchor on body 2
    0.0,       // rest length
    500,       // stiffness
    15         // damping
  ]);
  return null;
}

export default function SpringSkillBlock({ skill, startX, startY, startRot, playWidth }) {
  const anchorRef = useRef(null);
  const cardRef = useRef(null);
  const [jointActive, setJointActive] = useState(false);
  const isDragging = useRef(false);

  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const lastPosition = new THREE.Vector3();
  const lastTime = useRef(0);
  const velocity = useRef(new THREE.Vector3());

  const floorY = -2.1;
  const ceilingY = 2.1;

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);

    const anchor = anchorRef.current;
    const card = cardRef.current;
    if (!anchor || !card) return;

    // Position the kinematic anchor immediately at the pointer down coordinate
    const intersectionPoint = new THREE.Vector3();
    e.raycaster.ray.intersectPlane(dragPlane, intersectionPoint);

    // Clamp pointer target coordinates
    intersectionPoint.x = Math.max(-playWidth + 0.65, Math.min(playWidth - 0.65, intersectionPoint.x));
    intersectionPoint.y = Math.max(floorY + 0.25, Math.min(ceilingY - 0.25, intersectionPoint.y));
    intersectionPoint.z = 0;

    anchor.setNextKinematicTranslation(intersectionPoint);
    anchor.wakeUp();
    card.wakeUp();

    setJointActive(true);
    isDragging.current = true;
    lastPosition.copy(intersectionPoint);
    lastTime.current = performance.now();
    velocity.current.set(0, 0, 0);

    document.body.style.cursor = "grabbing";
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    e.stopPropagation();

    const anchor = anchorRef.current;
    if (!anchor) return;

    // Project coordinates onto the drag plane
    const intersectionPoint = new THREE.Vector3();
    e.raycaster.ray.intersectPlane(dragPlane, intersectionPoint);

    // Clamp bounds
    intersectionPoint.x = Math.max(-playWidth + 0.65, Math.min(playWidth - 0.65, intersectionPoint.x));
    intersectionPoint.y = Math.max(floorY + 0.25, Math.min(ceilingY - 0.25, intersectionPoint.y));
    intersectionPoint.z = 0;

    anchor.setNextKinematicTranslation(intersectionPoint);

    // Track cursor velocity
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      const instantVelocity = new THREE.Vector3()
        .copy(intersectionPoint)
        .sub(lastPosition)
        .multiplyScalar(1000 / dt);
      
      velocity.current.lerp(instantVelocity, 0.4);
    }
    lastPosition.copy(intersectionPoint);
    lastTime.current = now;
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    e.stopPropagation();

    e.target.releasePointerCapture(e.pointerId);
    isDragging.current = false;
    setJointActive(false);

    const card = cardRef.current;
    if (card) {
      // Apply linear velocity throw impulse to dynamic card mesh
      const throwVel = new THREE.Vector3().copy(velocity.current);
      throwVel.clampLength(0, 15);
      card.setLinvel({ x: throwVel.x * 0.15, y: throwVel.y * 0.15, z: 0 }, true);
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
    <group>
      {/* Kinematic cursor anchor body */}
      <RigidBody
        ref={anchorRef}
        type="kinematicPosition"
        colliders={false}
        position={[startX, startY, 0]}
      >
        <mesh>
          <boxGeometry args={[0.01, 0.01, 0.01]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Dynamic card body */}
      <RigidBody
        ref={cardRef}
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

      {/* Spring Joint linking anchor to card */}
      {jointActive && (
        <SpringJointConnection body1={anchorRef} body2={cardRef} />
      )}
    </group>
  );
}
