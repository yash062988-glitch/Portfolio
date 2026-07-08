"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function PlatformModel() {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Get parent dimensions
    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 700;

    // Create Scene
    const scene = new THREE.Scene();

    // Create Camera looking at an angle down, matching the 75deg visual tilt
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, -0.2, 0);

    // Create Renderer with alpha support for background transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Add Ambient Light (soft environment filler)
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.8);
    scene.add(ambientLight);

    // Add Directional Key Light (casting gold accents)
    const dirLight = new THREE.DirectionalLight(0xffecc2, 2.0);
    dirLight.position.set(4, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Add Blue/Purple Point Light below the platform for dynamic atmosphere blending
    const underGlow = new THREE.PointLight(0x7000ff, 12, 10);
    underGlow.position.set(0, -2.0, 0);
    scene.add(underGlow);

    // Add Gold Point Light above the platform center
    const topGlow = new THREE.PointLight(0xe9b15d, 5, 8);
    topGlow.position.set(0, 1.0, 0);
    scene.add(topGlow);

    let model;
    // Load GLTF Platform Model
    const loader = new GLTFLoader();
    loader.load(
      "/models/platform/scene.gltf",
      (gltf) => {
        model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Premium materials adjust
            if (child.material) {
              child.material.roughness = 0.45;
              child.material.metalness = 0.8;
            }
          }
        });

        // Auto scaling and alignment based on bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        
        // Scale factor: align boundaries proportionally without distortion
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetScale = 3.6 / maxDimension;
        model.scale.set(targetScale, targetScale, targetScale);

        // Center and position the platform lower (corresponds to bottom shadow)
        model.position.set(0, -1.15, 0);
        
        scene.add(model);
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF platform model:", error);
      }
    );

    // Animation loop (rendering stationary scene)
    let animationFrameId;
    const animate = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 600;
      const h = mountRef.current.clientHeight || 700;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Clean up WebGL resources
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
