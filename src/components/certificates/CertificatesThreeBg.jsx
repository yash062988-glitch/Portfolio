"use client";

import React, { useEffect, useRef } from "react";

// 3D Geometry vertices and edges projection helper
const shapes3D = {
  cube: {
    vertices: [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ]
  },
  octahedron: {
    vertices: [
      [0, -1.414, 0], [1, 0, -1], [1, 0, 1], [-1, 0, 1], [-1, 0, -1], [0, 1.414, 0]
    ],
    edges: [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
      [5, 1], [5, 2], [5, 3], [5, 4]
    ]
  },
  tetrahedron: {
    vertices: [
      [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]
    ],
    edges: [
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
    ]
  }
};

function parseToRGB(colorStr) {
  const s = colorStr.trim().toLowerCase();
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3) h = h.split("").map(x => x + x).join("");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16)
    ];
  }
  const m = s.match(/rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (m) {
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  }
  return [233, 177, 93]; // fallback gold
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function CertificatesThreeBg({ speedMultiplierRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let width = 0;
    let height = 0;

    // Mouse interactive offsets
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    // Dynamic color lerping variables
    let targetRGB = [233, 177, 93];
    let activeRGB = [233, 177, 93];

    // Spacetime parameters
    let energyPulseRadius = 0;
    let energyPulseActive = false;
    let lastPulseTime = 0;

    // Objects arrays
    const nodes = [];
    const particles = [];
    const geometry = [];
    const dataStream = [];

    // Helper: spacing grid spacetime distortion near center
    const distortPoint = (x, y, cx, cy, pulseVal = 0) => {
      const dx = x - cx;
      const dy = y - cy;
      const distSq = dx * dx + dy * dy;
      
      // Distortion pull simulating a spacetime well (modulated by pulse wave)
      const force = (25000 / (distSq + 32000)) * (1 + pulseVal * 0.45);
      const angle = Math.atan2(dy, dx);
      const pull = force * 65;
      
      return {
        x: x - Math.cos(angle) * pull,
        y: y - Math.sin(angle) * pull
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.parentNode.getBoundingClientRect();
      width = rect.width * dpr;
      height = rect.height * dpr;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      // 1. Initialize Quantum Nodes (85 nodes)
      nodes.length = 0;
      const nodeCount = 85;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          baseSize: Math.random() * 2.8 + 1.2,
          sizeBoost: 0,
          pulseProgress: 0
        });
      }

      // 2. Initialize Microscopic Energy Particles (195 particles with layers)
      particles.length = 0;
      const particleCount = 195;
      for (let i = 0; i < particleCount; i++) {
        // Distribute to 3 distinct depth layers
        const layerRoll = Math.random();
        let depth = 0.4; // Far
        let size = Math.random() * 0.8 + 0.4;
        let speedFactor = 0.25;
        let baseAlpha = Math.random() * 0.25 + 0.12;

        if (layerRoll > 0.75) {
          depth = 1.6; // Near
          size = Math.random() * 2.4 + 1.6;
          speedFactor = 0.95;
          baseAlpha = Math.random() * 0.65 + 0.35;
        } else if (layerRoll > 0.35) {
          depth = 0.9; // Medium
          size = Math.random() * 1.5 + 0.8;
          speedFactor = 0.55;
          baseAlpha = Math.random() * 0.45 + 0.22;
        }

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5 * speedFactor,
          vy: (Math.random() - 0.5) * 0.5 * speedFactor,
          size,
          depth,
          alpha: baseAlpha,
          convergePhase: Math.random() * Math.PI * 2
        });
      }

      // 3. Initialize Floating Wireframe Geometry (9 structures)
      geometry.length = 0;
      const shapeKeys = Object.keys(shapes3D);
      const geomCount = 9;
      for (let i = 0; i < geomCount; i++) {
        const type = shapeKeys[i % shapeKeys.length];
        const shapeDef = shapes3D[type];
        
        // Spawn layout: placing them on left and right sides to never overlap center cards
        const isLeft = i % 2 === 0;
        const sx = isLeft ? (Math.random() * width * 0.28) : (width * 0.72 + Math.random() * width * 0.28);
        
        geometry.push({
          x: sx,
          y: Math.random() * height * 0.8 + height * 0.1,
          scale: Math.random() * 22 + 14,
          rotX: Math.random() * Math.PI,
          rotY: Math.random() * Math.PI,
          rotZ: Math.random() * Math.PI,
          rotSpeedX: (Math.random() - 0.5) * 0.0075,
          rotSpeedY: (Math.random() - 0.5) * 0.0075,
          driftX: 0,
          driftY: 0,
          alpha: Math.random() * 0.42 + 0.22,
          targetAlpha: Math.random() * 0.42 + 0.22,
          vertices: shapeDef.vertices.map(v => [...v]),
          edges: shapeDef.edges
        });
      }

      // 4. Initialize Data Stream Pool (15 active columns)
      dataStream.length = 0;
      const dataItems = [
        "010101", "111001", "001010", "0x7F2A", "0x91B2", "0x5D4F",
        "NODE_42", "DATA_STREAM", "CACHE", "VECTOR", "AI_CORE", "CLUSTER",
        "v2.7", "v5.1", "Build_401"
      ];
      for (let i = 0; i < 15; i++) {
        dataStream.push({
          text: dataItems[Math.floor(Math.random() * dataItems.length)],
          x: Math.random() * width,
          y: Math.random() * height,
          alpha: Math.random() * 0.3 + 0.1,
          life: Math.random() * 4 + 2,
          maxLife: 6,
          speed: 0
        });
      }
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      targetMouse.x = (mx - rect.width / 2) / (rect.width / 2);
      targetMouse.y = (my - rect.height / 2) / (rect.height / 2);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", resize);
    resize();

    const tick = (now) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Animate Theme Colors (Layer 10 Lerping)
      const root = document.documentElement;
      const rawPrimary = root.style.getPropertyValue("--accent-primary") || getComputedStyle(root).getPropertyValue("--accent-primary");
      if (rawPrimary) {
        targetRGB = parseToRGB(rawPrimary);
      }
      activeRGB[0] = lerp(activeRGB[0], targetRGB[0], 0.05);
      activeRGB[1] = lerp(activeRGB[1], targetRGB[1], 0.05);
      activeRGB[2] = lerp(activeRGB[2], targetRGB[2], 0.05);

      const colorAccent = `rgba(${Math.round(activeRGB[0])}, ${Math.round(activeRGB[1])}, ${Math.round(activeRGB[2])}, `;

      // 2. Mouse parallax smoothing (Layer 9 & 10)
      currentMouse.x = lerp(currentMouse.x, targetMouse.x, 0.05);
      currentMouse.y = lerp(currentMouse.y, targetMouse.y, 0.05);

      // Parallax multipliers
      const coreParX = currentMouse.x * 8;      // HUD Circular Core (8px)
      const coreParY = currentMouse.y * 8;
      const geomParX = currentMouse.x * 6;      // Geometry (6px)
      const geomParY = currentMouse.y * 6;
      const nodeParX = currentMouse.x * 4;      // Network Nodes (4px)
      const nodeParY = currentMouse.y * 4;
      const partParX = currentMouse.x * 2;      // Far Particles (2px)
      const partParY = currentMouse.y * 2;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      
      // Math-aligned coordinates: centered horizontally and exactly 190px from the bottom
      const cx = width / 2 + coreParX;
      const cy = height - 190 * dpr + coreParY;

      // 3. Spacetime Ripple Pulse trigger (Layer 6)
      if (now - lastPulseTime > 6200) {
        energyPulseActive = true;
        energyPulseRadius = 0;
        lastPulseTime = now;
      }

      let pulseVal = 0;
      if (energyPulseActive) {
        energyPulseRadius += 4.5;
        const maxRadius = Math.max(width, height);
        pulseVal = Math.max(0, Math.sin((energyPulseRadius / maxRadius) * Math.PI));
        if (energyPulseRadius > maxRadius) {
          energyPulseActive = false;
        }
      }

      // --- Layer 7 — Holographic Spacetime Grid ---
      ctx.strokeStyle = colorAccent + "0.024)";
      ctx.lineWidth = 0.55;
      const gridSpacing = 68;
      
      // Vertical grid lines
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 12) {
          const pt = distortPoint(x, y, cx, cy, pulseVal);
          if (y === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 12) {
          const pt = distortPoint(x, y, cx, cy, pulseVal);
          if (x === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // --- Layer 1 — Concentric Animated Circular Data Core ---
      ctx.save();
      ctx.translate(cx, cy);

      // Stronger Central Volumetric Glow (Significantly boosted brightness & size)
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, Math.min(width, height) * 0.85);
      glowGrad.addColorStop(0, colorAccent + "0.32)"); // Boosted from 0.105
      glowGrad.addColorStop(0.35, colorAccent + "0.14)"); // Boosted from 0.045
      glowGrad.addColorStop(0.7, colorAccent + "0.04)"); // Boosted from 0.012
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Rotation loops for multiple concentric rings
      const r1Angle = now * 0.00018;
      const r2Angle = now * -0.00009;
      const r3Angle = now * 0.00025;
      const r4Angle = now * -0.00014;
      const r5Angle = now * 0.00006;
      const r6Angle = now * -0.00004;

      // Sizing base enlarged by ~85% for desktop scales
      const baseR = Math.max(Math.min(width, height) * 0.54, width * 0.19);

      // Ring 1: Primary radial ticks
      ctx.save();
      ctx.rotate(r1Angle);
      ctx.strokeStyle = colorAccent + "0.32)"; // Boosted from 0.105
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.arc(0, 0, baseR, 0, Math.PI * 2);
      ctx.stroke();
      
      // Radial measurement ticks
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 32) {
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * baseR, Math.sin(a) * baseR);
        ctx.lineTo(Math.cos(a) * (baseR - 10), Math.sin(a) * (baseR - 10));
        ctx.stroke();
      }
      ctx.restore();

      // Ring 2: Innermost compass dial
      ctx.save();
      ctx.rotate(r5Angle);
      ctx.strokeStyle = colorAccent + "0.26)"; // Boosted from 0.08
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.arc(0, 0, baseR - 35, 0, Math.PI * 2);
      ctx.stroke();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (baseR - 35), Math.sin(a) * (baseR - 35));
        ctx.lineTo(Math.cos(a) * (baseR - 46), Math.sin(a) * (baseR - 46));
        ctx.stroke();
      }
      ctx.restore();

      // Ring 3: Segmented arcs (Thicker, more visibility)
      ctx.save();
      ctx.rotate(r2Angle);
      ctx.strokeStyle = colorAccent + "0.42)"; // Boosted from 0.135
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.arc(0, 0, baseR + 30, 0, Math.PI * 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, baseR + 30, Math.PI * 0.75, Math.PI * 1.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, baseR + 30, Math.PI * 1.35, Math.PI * 1.7);
      ctx.stroke();
      ctx.restore();

      // Ring 4: Outer dashed circle
      ctx.save();
      ctx.rotate(r3Angle);
      ctx.strokeStyle = colorAccent + "0.24)"; // Boosted from 0.08
      ctx.lineWidth = 0.85;
      ctx.setLineDash([8, 16]);
      ctx.beginPath();
      ctx.arc(0, 0, baseR + 65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating indicator nodes
      ctx.fillStyle = colorAccent + "0.85)";
      ctx.beginPath();
      ctx.arc(baseR + 65, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ring 5: Large outer measurement scale
      ctx.save();
      ctx.rotate(r4Angle);
      ctx.strokeStyle = colorAccent + "0.20)"; // Boosted from 0.06
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.arc(0, 0, baseR + 95, 0, Math.PI * 2);
      ctx.stroke();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 64) {
        const isLong = a % (Math.PI / 8) === 0;
        const length = isLong ? 15 : 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (baseR + 95), Math.sin(a) * (baseR + 95));
        ctx.lineTo(Math.cos(a) * (baseR + 95 + length), Math.sin(a) * (baseR + 95 + length));
        ctx.stroke();
      }
      ctx.restore();

      // Ring 6: Thin outermost perimeter boundary ring
      ctx.save();
      ctx.rotate(r6Angle);
      ctx.strokeStyle = colorAccent + "0.14)";
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.arc(0, 0, baseR + 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // --- Layer 2 — Quantum Network ---
      // Update nodes coordinates
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < -30 || n.x > width + 30) n.vx *= -1;
        if (n.y < -30 || n.y > height + 30) n.vy *= -1;

        n.sizeBoost *= 0.92;
        if (energyPulseActive) {
          const dx = (n.x + nodeParX) - cx;
          const dy = (n.y + nodeParY) - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - energyPulseRadius) < 22) {
            n.sizeBoost = 3.5;
          }
        }
      }

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        const drawX1 = n1.x + nodeParX;
        const drawY1 = n1.y + nodeParY;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const drawX2 = n2.x + nodeParX;
          const drawY2 = n2.y + nodeParY;

          const dx = drawX2 - drawX1;
          const dy = drawY2 - drawY1;
          const distSq = dx * dx + dy * dy;
          const maxDist = 165;

          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const baseAlpha = (1.0 - dist / maxDist) * 0.17;
            const pulseBoost = (n1.sizeBoost + n2.sizeBoost) * 0.08;
            ctx.strokeStyle = colorAccent + `${Math.min(0.55, baseAlpha + pulseBoost)})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(drawX1, drawY1);
            ctx.lineTo(drawX2, drawY2);
            ctx.stroke();

            // Light pulses traveling across connections
            if (Math.random() < 0.004) {
              const pulseProgress = (now * 0.0008) % 1.0;
              const px = drawX1 + dx * pulseProgress;
              const py = drawY1 + dy * pulseProgress;
              ctx.fillStyle = colorAccent + "0.8)";
              ctx.beginPath();
              ctx.arc(px, py, 1.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw network nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const drawX = n.x + nodeParX;
        const drawY = n.y + nodeParY;

        ctx.fillStyle = colorAccent + `${Math.min(0.95, 0.38 + n.sizeBoost * 0.28)})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, n.baseSize + n.sizeBoost, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Layer 3 — Floating 3D Wireframe Geometry ---
      for (let i = 0; i < geometry.length; i++) {
        const g = geometry[i];
        
        g.y += g.driftY;
        g.x += g.driftX;
        g.rotX += g.rotSpeedX;
        g.rotY += g.rotSpeedY;
        g.rotZ += 0.001;

        if (g.y < -60) {
          g.y = height + 60;
          g.x = Math.random() * width;
        }

        g.alpha = lerp(g.alpha, g.targetAlpha, 0.02);

        // Volumetric pulse brightening
        let activeAlpha = g.alpha;
        if (energyPulseActive) {
          const dx = (g.x + geomParX) - cx;
          const dy = (g.y + geomParY) - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - energyPulseRadius) < 40) {
            activeAlpha = Math.min(0.85, g.alpha + 0.42);
          }
        }

        ctx.strokeStyle = colorAccent + `${activeAlpha})`;
        ctx.lineWidth = 0.78;

        const projected = g.vertices.map(v => {
          let rx = rotateX(v, g.rotX);
          let ry = rotateY(rx, g.rotY);
          return [
            g.x + geomParX + ry[0] * g.scale,
            g.y + geomParY + ry[1] * g.scale
          ];
        });

        for (let e = 0; e < g.edges.length; e++) {
          const edge = g.edges[e];
          const p1 = projected[edge[0]];
          const p2 = projected[edge[1]];
          
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        }
      }

      // --- Layer 4 — Digital Data Stream ---
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < dataStream.length; i++) {
        const item = dataStream[i];
        item.y -= item.speed;
        
        item.life -= 0.016;
        if (item.life > item.maxLife - 1) {
          item.alpha = Math.min(0.35, item.alpha + 0.012);
        } else if (item.life < 1) {
          item.alpha = Math.max(0, item.alpha - 0.012);
        }

        if (item.life <= 0) {
          item.text = [
            "010101", "111001", "001010", "0x7F2A", "0x91B2", "0x5D4F",
            "NODE_42", "DATA_STREAM", "CACHE", "VECTOR", "AI_CORE", "CLUSTER",
            "v2.7", "v5.1", "Build_401"
          ][Math.floor(Math.random() * 15)];
          item.x = Math.random() * width;
          item.y = height + 10;
          item.life = Math.random() * 4 + 2;
          item.alpha = 0;
        }

        ctx.fillStyle = colorAccent + `${item.alpha})`;
        ctx.fillText(item.text, item.x + geomParX, item.y);
      }

      // --- Layer 5 — Microscopic Energy Particles ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.convergePhase += 0.003;
        
        const pullFactor = Math.sin(now * 0.00018 + p.convergePhase) * 0.35 + 0.2;
        
        let drawX = p.x;
        let drawY = p.y;
        if (p.depth > 1.0) {
          drawX += geomParX;
          drawY += geomParY;
        } else if (p.depth > 0.6) {
          drawX += nodeParX;
          drawY += nodeParY;
        } else {
          drawX += partParX;
          drawY += partParY;
        }

        const dx = cx - drawX;
        const dy = cy - drawY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        p.vx += (dx / dist) * pullFactor * 0.008 * p.depth;
        p.vy += (dy / dist) * pullFactor * 0.008 * p.depth;

        p.vx *= 0.985;
        p.vy *= 0.985;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        let activeAlpha = p.alpha;
        let pGlow = 0;

        if (energyPulseActive) {
          const pdx = drawX - cx;
          const pdy = drawY - cy;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (Math.abs(pdist - energyPulseRadius) < 18) {
            pGlow = 0.7;
            activeAlpha = Math.min(1.0, p.alpha + 0.45);
          }
        }

        ctx.fillStyle = colorAccent + `${activeAlpha})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size + pGlow, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [speedMultiplierRef]);

  const rotateX = (p, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
  };

  const rotateY = (p, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ pointerEvents: "none" }}
    />
  );
}
