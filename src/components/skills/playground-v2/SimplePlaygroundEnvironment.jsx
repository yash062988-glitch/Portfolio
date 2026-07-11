"use client";

import React from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

export default function SimplePlaygroundEnvironment({ playWidth, wallHeight }) {
  const floorY = -2.1;
  const ceilingY = 2.1;
  const stageWidth = playWidth * 2;

  return (
    <>
      {/* Visual Back Stage (Matches visual aesthetic of the original environment) */}
      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[stageWidth, 4.1]} />
        <meshBasicMaterial
          color="#e9b15d"
          transparent
          opacity={0.015}
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

      {/* Visual Reflective Floor Platform */}
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

      {/* Static Colliders */}
      {/* Left Wall Collider */}
      <RigidBody type="fixed" position={[-playWidth - 0.1, 0, 0]}>
        <CuboidCollider args={[0.1, wallHeight, 2]} />
      </RigidBody>

      {/* Right Wall Collider */}
      <RigidBody type="fixed" position={[playWidth + 0.1, 0, 0]}>
        <CuboidCollider args={[0.1, wallHeight, 2]} />
      </RigidBody>

      {/* Floor Collider */}
      <RigidBody type="fixed" position={[0, floorY - 0.05, 0]}>
        <CuboidCollider args={[stageWidth * 2, 0.05, 2]} />
      </RigidBody>

      {/* Ceiling Collider */}
      <RigidBody type="fixed" position={[0, ceilingY + 0.05, 0]}>
        <CuboidCollider args={[stageWidth * 2, 0.05, 2]} />
      </RigidBody>
    </>
  );
}
