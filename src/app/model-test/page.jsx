"use client";

import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, useAnimations, Bounds, useBounds } from "@react-three/drei";

function ModelViewer() {
  const { scene, animations } = useGLTF("/models/space_station_final.glb");
  const { actions, names } = useAnimations(animations, scene);

  // Automatically play all embedded GLTF animations
  useEffect(() => {
    if (actions) {
      names.forEach((name) => {
        actions[name]?.play();
      });
    }
  }, [actions, names]);

  // Disable frustum culling on all meshes to ensure visibility
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;
        }
      });
    }
  }, [scene]);

  // Automatically fit the camera bounds once the model loads
  const bounds = useBounds();
  useEffect(() => {
    if (scene) {
      bounds.refresh().clip().fit();
    }
  }, [bounds, scene]);

  return <primitive object={scene} />;
}

export default function ModelTestPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#0b0705", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.15}>
            <ModelViewer />
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
