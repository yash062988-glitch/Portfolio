"use client";

import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import DraggableRigidBody from "./physics/DraggableRigidBody";

export default function SkillBlock({
  skill,
  index,
  startX,
  startY,
  startRot,
  isMobile,
  draggedBlockRef,
  onSpawn,
  onCollision,
  onDragStart,
  onThrow,
  onRest
}) {
  const draggableRef = useRef(null);
  const { viewport } = useThree();

  const physicsConfig = useRef({
    mass: (skill.weight || 1.0) * (0.85 + Math.random() * 0.3),
    restitution: 0.05,
    friction: 0.8,
    linearDamping: 1.0,
    angularDamping: 1.0
  });

  useEffect(() => {
    console.log(`[Physics Debug] Simple SkillBlock created for block: ${skill.name}`);
    if (onSpawn) onSpawn();
  }, [skill.name]);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    console.log("[Physics Debug] PointerOver simple mesh:", skill.name);
    document.body.style.cursor = "grab";
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
    console.log("[Physics Debug] PointerOut simple mesh:", skill.name);
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    console.log("[Test Debug] Simple SkillBlock pointer down:", skill.name);
    const body = draggableRef.current?.getRigidBody();
    if (body) {
      body.wakeUp();
    }
  };

  const playWidth = (viewport.width * 0.75) / 2;
  const floorY = -2.1;
  const ceilingY = 2.1;
  
  const dragLimits = [
    [-playWidth + 0.65, playWidth - 0.65],
    [floorY + 0.25, ceilingY - 0.25],
    [-0.1, 0.1]
  ];

  return (
    <DraggableRigidBody
      ref={draggableRef}
      boundingBox={dragLimits}
      enableSpringJoint={false}
      dragControlsProps={{
        preventOverlap: true,
        onDragStart: () => {
          console.log("[Physics Debug] DragStart simple mesh:", skill.name);
          const body = draggableRef.current?.getRigidBody();
          if (body) {
            body.wakeUp();
          }
          if (onDragStart) onDragStart();
        },
        onDrag: () => {
          const body = draggableRef.current?.getRigidBody();
          if (body && draggedBlockRef) {
            const pos = body.translation();
            draggedBlockRef.current = {
              id: skill.name,
              pos: { x: pos.x, y: pos.y }
            };
          }
        },
        onDragEnd: () => {
          console.log("[Physics Debug] DragEnd simple mesh:", skill.name);
          if (draggedBlockRef) {
            draggedBlockRef.current = null;
          }
          const body = draggableRef.current?.getRigidBody();
          if (body) {
            const vel = body.linvel();
            body.applyImpulse({ x: vel.x * 0.15, y: vel.y * 0.15, z: 0 }, true);
          }
          if (onThrow) onThrow();
        }
      }}
      rigidBodyProps={{
        colliders: "cuboid",
        position: [startX, startY, 0],
        rotation: [0, 0, startRot],
        mass: physicsConfig.current.mass,
        restitution: physicsConfig.current.restitution,
        friction: physicsConfig.current.friction,
        linearDamping: physicsConfig.current.linearDamping,
        angularDamping: physicsConfig.current.angularDamping,
        enabledTranslations: [true, true, false],
        enabledRotations: [false, false, true],
        canSleep: true
      }}
      visibleMesh={
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onPointerDown={handlePointerDown}
          onClick={() => console.log("BLOCK CLICKED")}
        >
          <boxGeometry args={[1.3, 0.5, 0.1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      }
    />
  );
}