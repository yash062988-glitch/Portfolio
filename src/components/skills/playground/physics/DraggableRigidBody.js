import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { RigidBody, useSpringJoint } from '@react-three/rapier';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { CustomDragControls } from './CustomDragControls';

export const DEFAULT_SPRING_JOINT_CONFIG = {
  restLength: 0,
  stiffness: 500,
  damping: 0,
  collisionGroups: 2
}

const DraggableRigidBody = forwardRef(
  (props, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const { scene } = useThree();

    const rigidBodyRef = useRef(null);
    const jointRigidBodyRef = useRef(null);

    const meshRef = useRef(null);
    const invisibleDragControlsMeshRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getInvisibleMesh: () => invisibleDragControlsMeshRef.current,
      getVisibleMesh: () => meshRef.current,
      getRigidBody: () => rigidBodyRef.current,
    }));

    useSpringJoint(
      jointRigidBodyRef,
      rigidBodyRef,
      [
        [0, 0, 0],
        [0, 0, 0],
        props.jointConfig?.restLength ?? DEFAULT_SPRING_JOINT_CONFIG.restLength,
        props.jointConfig?.stiffness ?? DEFAULT_SPRING_JOINT_CONFIG.stiffness,
        props.jointConfig?.damping ?? DEFAULT_SPRING_JOINT_CONFIG.damping,
      ]
    );

    useFrame(() => {
      if (
        jointRigidBodyRef.current &&
        !jointRigidBodyRef.current.isSleeping() &&
        !isDragging
      ) {
        jointRigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, false);
        jointRigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, false);
      }

      if (
        !invisibleDragControlsMeshRef.current || !meshRef.current ||
        isDragging ||
        rigidBodyRef.current?.bodyType() === 2 ||
        rigidBodyRef.current?.isSleeping()
      ) return;

      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();

      meshRef.current.getWorldPosition(worldPos);
      meshRef.current.getWorldQuaternion(worldQuat);

      if (invisibleDragControlsMeshRef.current.parent) {
        invisibleDragControlsMeshRef.current.parent.worldToLocal(worldPos);
        invisibleDragControlsMeshRef.current.position.copy(worldPos);
        invisibleDragControlsMeshRef.current.quaternion.copy(worldQuat);
      }
    });

    const getBoxedPosition = (position) => {
      if (!props.boundingBox) return position;

      const box = props.boundingBox;

      if (box[0]) {
        position.setX(Math.min(Math.max(box[0][0], position.x), box[0][1]));
      }

      if (box[1]) {
        position.setY(Math.min(Math.max(box[1][0], position.y), box[1][1]));
      }

      if (box[2]) {
        position.setZ(Math.min(Math.max(box[2][0], position.z), box[2][1]));
      }

      return position;
    };

    const startDragging = (point) => {
      setIsDragging(true);
      console.log("[Physics Debug] Dragging started for block");

      if (jointRigidBodyRef.current) {
        jointRigidBodyRef.current.setBodyType(2, true);
        jointRigidBodyRef.current.wakeUp();
      } else if (rigidBodyRef.current) {
        rigidBodyRef.current.setBodyType(2, true);
        rigidBodyRef.current.wakeUp();
      }

      if (props.dragControlsProps?.onDragStart) {
        props.dragControlsProps.onDragStart(point);
      }
    };

    const onDrag = (localMatrix, deltaLocalMatrix, worldMatrix, deltaWorldMatrix) => {
      if (!isDragging || !rigidBodyRef.current || !invisibleDragControlsMeshRef.current) return;

      if (!props.enableSpringJoint && rigidBodyRef.current.bodyType() !== 2) return;
      if (props.enableSpringJoint && jointRigidBodyRef.current && jointRigidBodyRef.current.bodyType() !== 2) return;

      const position = new THREE.Vector3();
      invisibleDragControlsMeshRef.current.getWorldPosition(position);

      if (jointRigidBodyRef.current) {
        jointRigidBodyRef.current.setNextKinematicTranslation(position);
      } else {
        rigidBodyRef.current.setNextKinematicTranslation(getBoxedPosition(position));
      }

      if (props.dragControlsProps?.onDrag) {
        props.dragControlsProps.onDrag(localMatrix, deltaLocalMatrix, worldMatrix, deltaWorldMatrix);
      }
    };

    const stopDragging = () => {
      console.log("[Physics Debug] Dragging ended for block");
      if (jointRigidBodyRef.current) {
        jointRigidBodyRef.current.setBodyType(0, true);
        setIsDragging(false);
      } else if (rigidBodyRef.current) {
        rigidBodyRef.current.setBodyType(0, true);
        setIsDragging(false);
      }

      if (props.dragControlsProps?.onDragEnd) {
        props.dragControlsProps.onDragEnd();
      }
    };

    const cardWidth = 1.34;
    const cardHeight = 0.52;
    const cardDepth = 0.11;

    return (
      <group {...props.groupProps}>
        {
          props.enableSpringJoint &&
          (
            <RigidBody
              type={'dynamic'}
              ref={jointRigidBodyRef}
              collisionGroups={props.jointConfig?.springJointCollisionGroups ?? DEFAULT_SPRING_JOINT_CONFIG.collisionGroups}
            >
              <mesh>
                <boxGeometry args={[.01, .01, .01]} />
                <meshStandardMaterial visible={false} />
              </mesh>
            </RigidBody>
          )
        }

        <CustomDragControls
          {...props.dragControlsProps}
          onDragStart={startDragging}
          onDrag={onDrag}
          onDragEnd={stopDragging}
        >
          <mesh ref={invisibleDragControlsMeshRef} key="invisible">
            <boxGeometry args={[cardWidth, cardHeight, cardDepth]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </CustomDragControls>

        <RigidBody
          ref={rigidBodyRef}
          type={'dynamic'}
          {...props.rigidBodyProps}
        >
          {React.cloneElement(props.visibleMesh, {
            ref: meshRef,
            key: 'visible'
          })}
        </RigidBody>
      </group >
    );
  }
);

export default DraggableRigidBody;
