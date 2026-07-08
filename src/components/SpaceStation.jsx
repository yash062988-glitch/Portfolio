"use client";

import React, { useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function SpaceStation({ onLoad }) {
  const { scene, animations } = useGLTF("/models/space_station_final.glb");
  const { actions, names } = useAnimations(animations, scene);

  // Automatically play all embedded animations (filtering out emissive/intensity pulsing tracks)
  useEffect(() => {
    if (actions && animations) {
      animations.forEach((clip) => {
        if (clip.tracks) {
          clip.tracks = clip.tracks.filter((track) => {
            const name = track.name.toLowerCase();
            return (
              !name.includes("emissive") &&
              !name.includes("intensity") &&
              !name.includes("color")
            );
          });
        }
      });
      names.forEach((name) => {
        actions[name]?.play();
      });
    }
  }, [actions, names, animations]);

  // Disable frustum culling on meshes and set flat emissive intensity and titanium metallic look
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;

          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              // Boost metallic properties to represent premium titanium / alloy
              if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                mat.metalness = 0.95;
                if (!mat.roughnessMap) {
                  mat.roughness = 0.42;
                }
              }

              // Set subtle constant emissive intensity on materials with active emissive properties
              if (mat.emissive && (mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0 || mat.emissiveMap)) {
                mat.emissiveIntensity = 0.8;
              }
            });
          }
        }
      });
    }
  }, [scene]);

  // Notify LoadingScreen when the GLB has finished loading
  useEffect(() => {
    if (scene) {
      if (onLoad) onLoad();
    }
  }, [scene, onLoad]);

  return <primitive object={scene} />;
}

// Preload the GLB asset globally
useGLTF.preload("/models/space_station_final.glb");
