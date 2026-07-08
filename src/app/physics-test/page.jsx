"use client";

import React, { useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { RoundedBox } from "@react-three/drei";
import DraggableRigidBody from "@/components/skills/playground/physics/DraggableRigidBody";

function Environment() {
  const { viewport } = useThree();
  const floorY = -2.4;
  const ceilingY = 2.4;
  const playWidth = viewport.width / 2;

  return (
    <>
      {/* Floor */}
      <RigidBody type="fixed" position={[0, floorY, 0]}>
        <CuboidCollider args={[viewport.width * 2, 0.1, 2]} />
      </RigidBody>
      {/* Ceiling */}
      <RigidBody type="fixed" position={[0, ceilingY, 0]}>
        <CuboidCollider args={[viewport.width * 2, 0.1, 2]} />
      </RigidBody>
      {/* Left Wall */}
      <RigidBody type="fixed" position={[-playWidth - 0.1, 0, 0]}>
        <CuboidCollider args={[0.1, 10, 2]} />
      </RigidBody>
      {/* Right Wall */}
      <RigidBody type="fixed" position={[playWidth + 0.1, 0, 0]}>
        <CuboidCollider args={[0.1, 10, 2]} />
      </RigidBody>
    </>
  );
}

function TestScene() {
  const { viewport } = useThree();
  const draggableRef = useRef(null);

  const cardWidth = 1.4;
  const cardHeight = 0.6;
  const cardDepth = 0.06;

  const playWidth = viewport.width / 2;
  const dragLimits = [
    [-playWidth + 0.7, playWidth - 0.7],
    [-2.2, 2.2],
    [-0.05, 0.05]
  ];

  return (
    <>
      <Environment />

      <DraggableRigidBody
        ref={draggableRef}
        boundingBox={dragLimits}
        enableSpringJoint={false}
        dragControlsProps={{
          preventOverlap: true,
          onDragStart: () => {
            console.log("[Test Debug] DragStart");
          },
          onDrag: () => {
            console.log("[Test Debug] Dragging");
          },
          onDragEnd: () => {
            console.log("[Test Debug] DragEnd");
            const body = draggableRef.current?.getRigidBody();
            if (body) {
              const impulse = { x: 0.5, y: 1.0, z: 0 };
              body.applyImpulse(impulse, true);
            }
          }
        }}
        rigidBodyProps={{
          colliders: "cuboid",
          position: [0, 1.0, 0],
          mass: 1.0,
          restitution: 0.05,
          friction: 0.8,
          linearDamping: 1.0,
          angularDamping: 1.0,
          enabledTranslations: [true, true, false],
          enabledRotations: [false, false, true]
        }}
        visibleMesh={
          <mesh>
            <RoundedBox
              args={[cardWidth, cardHeight, cardDepth]}
              radius={0.06}
              smoothness={3}
            >
              <meshPhysicalMaterial
                color="#0f0d0c"
                roughness={0.4}
                metalness={0.1}
                transparent
                opacity={0.8}
              />
            </RoundedBox>
          </mesh>
        }
      />
    </>
  );
}

export default function PhysicsTestPage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#080504",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#fff",
          fontFamily: "sans-serif",
          zIndex: 100
        }}
      >
        <h1>Physics Drag & Drop Test</h1>
        <p>Open Developer Console (F12) to inspect logs.</p>
      </div>

      <Canvas
        camera={{ position: [0, 0, 5.0], fov: 46 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 4, 3]} intensity={1.2} />

        <Physics gravity={[0, -9.81, 0]}>
          <TestScene />
        </Physics>
      </Canvas>
    </div>
  );
}
