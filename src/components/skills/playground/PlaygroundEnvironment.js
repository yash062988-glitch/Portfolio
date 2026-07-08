"use client";

import React from "react";
import { useThree } from "@react-three/fiber";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

export default function PlaygroundEnvironment({ playWidth, wallHeight }) {
  const { viewport } = useThree();

  const floorY = -2.1;
  const ceilingY = 2.1;
  
  // Calculate dynamic width covering 75% of the viewport width
  const stageWidth = viewport.width * 0.75;

  return (
    <>
      {/* Visual Back Wall (Dark transparent glass stage background) */}
      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[stageWidth, 4.1]} />
        <meshBasicMaterial
          color="#e9b15d"
          transparent
          opacity={0.015} // subtle gold stage highlight
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.16]}>
        <planeGeometry args={[stageWidth, 4.1]} />
        <meshPhysicalMaterial
          color="#0d0908"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Visual Reflective Floor Plane stage platform */}
      <mesh position={[0, floorY + 0.01, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[stageWidth, 2.0]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.4}
          roughness={0.2}
          ior={1.4}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Static Colliders aligned precisely with the stage width */}
      
      {/* Left Wall Collider */}
      <RigidBody type="fixed" position={[-playWidth - 0.1, 0, 0]}>
        <CuboidCollider args={[0.1, wallHeight, 4]} />
      </RigidBody>

      {/* Right Wall Collider */}
      <RigidBody type="fixed" position={[playWidth + 0.1, 0, 0]}>
        <CuboidCollider args={[0.1, wallHeight, 4]} />
      </RigidBody>

      {/* Floor Collider */}
      <RigidBody type="fixed" position={[0, floorY, 0]}>
        <CuboidCollider args={[viewport.width * 2, 0.05, 4]} />
      </RigidBody>

      {/* Ceiling Collider */}
      <RigidBody type="fixed" position={[0, ceilingY, 0]}>
        <CuboidCollider args={[viewport.width * 2, 0.05, 4]} />
      </RigidBody>
    </>
  );
}
