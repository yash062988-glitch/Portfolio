"use client";

import { useEffect, useRef, useMemo, useState } from 'react';
import { useSpringFollow } from '../hooks/useSpringFollow';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number; hue: number;
}

const UFO_W = 140;
const UFO_H = 115;
const UFO_CX = UFO_W / 2;
const UFO_CY = 72;

export default function UfoCompanion() {
  const spring = useSpringFollow();
  const springRef = useRef(spring);
  springRef.current = spring;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const { x, y, vx, vy, speed, isHoveringInteractive, isDockedToNavbar } = spring;

  const tiltDeg = Math.max(-22, Math.min(22, vx * 3.5));
  const scaleX = 1 + Math.min(speed * 0.006, 0.12);
  const scaleY = 1 - Math.min(speed * 0.004, 0.08);
  const glowIntensity = Math.min(speed * 0.18, 1);
  const lookX = Math.max(-4, Math.min(4, vx * 1.2));
  const lookY = Math.max(-3, Math.min(3, vy * 0.8));
  const isIdle = speed < 0.8;
  const shadowBlur = (8 + glowIntensity * 16).toFixed(0);
  const shadowOpacity = (0.35 + glowIntensity * 0.55).toFixed(2);
  const shadowY = (4 + glowIntensity * 6).toFixed(0);
  const engineGlowShadow = `drop-shadow(0 ${shadowY}px ${shadowBlur}px rgba(var(--accent-glow-raw, 216, 177, 91),${shadowOpacity}))`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: cx, y: cy, vx: cvx, vy: cvy, speed: cspeed } = springRef.current;

      let rawRgb = '216, 177, 91';
      if (typeof window !== 'undefined') {
        const val = getComputedStyle(document.documentElement).getPropertyValue('--accent-glow-raw').trim();
        if (val) rawRgb = val;
      }

      if (cspeed > 2) {
        const count = Math.min(Math.floor(cspeed * 0.4), 8);
        for (let i = 0; i < count; i++) {
          particles.current.push({
            x: cx + (Math.random() - 0.5) * 18,
            y: cy + 18 + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1.2 - cvx * 0.15,
            vy: (Math.random() - 0.5) * 1.2 - cvy * 0.15 + 0.4,
            life: 1,
            maxLife: 30 + Math.random() * 25,
            size: 1.5 + Math.random() * 3,
            hue: 38 + Math.random() * 20,
          });
        }
      }

      particles.current = particles.current.filter(p => p.life > 0);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.97;
        p.life -= 1;
        const t = p.life / p.maxLife;
        const alpha = t * 0.85;
        const sz = Math.max(0.1, p.size * t);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 2.5);
        grad.addColorStop(0, `rgba(${rawRgb}, ${alpha})`);
        grad.addColorStop(1, `rgba(${rawRgb}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const portholes = useMemo(() => [
    { x: 22, y: 74 }, { x: 37, y: 69 }, { x: 55, y: 66.5 },
    { x: 70, y: 66 }, { x: 85, y: 66.5 }, { x: 103, y: 69 }, { x: 118, y: 74 },
  ], []);

  const posLeft = x - UFO_CX;
  const posTop = y - UFO_CY;

  const [mounted, setMounted] = useState(false);

  // --- Interactive Click Messages & Sleep Timer ---
  const MESSAGES = useMemo(() => [
    "🛸 Beep boop! Navigating Yash's creative universe...",
    "🌌 Warp speed engaged! Exploring new dimensions...",
    "⚡ Quantum engines operational!",
    "👨‍🚀 Greetings, fellow explorer!",
    "⭐ 100% of code here is crafted with curiosity!",
    "🛸 Scanning for cool AI & Full-Stack projects...",
    "🛸 All systems nominal! Ready for launch!",
    "🚀 Exploring ideas beyond Earth!"
  ], []);

  const [messageIndex, setMessageIndex] = useState(0);
  const [clickMessage, setClickMessage] = useState<string | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [clickBounce, setClickBounce] = useState(false);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mousemove sleep timer tracker
  useEffect(() => {
    const handleMouseMove = () => {
      // Remove sleeping bubble instantly on cursor movement
      setIsSleeping(false);

      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = setTimeout(() => {
        setIsSleeping(true);
      }, 3500); // 3.5 seconds of no cursor movement -> sleep mode
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, []);

  const handleUfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Bounce animation
    setClickBounce(true);
    setTimeout(() => setClickBounce(false), 500);

    // Set next interactive click message
    const nextMsg = MESSAGES[messageIndex % MESSAGES.length];
    setMessageIndex(prev => prev + 1);
    setClickMessage(nextMsg);

    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setClickMessage(null);
    }, 3500);
  };

  if (!mounted) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 4 }}
      />

      {/* Position layer - locked at z-index 5 to always float behind section blocks */}
      <div
        className="fixed pointer-events-none"
        style={{ left: posLeft, top: posTop, width: UFO_W, height: UFO_H, zIndex: 5 }}
      >
        {/* Floating Sci-Fi Speech Bubble (Click message or Sleep Zzz...) */}
        {(clickMessage || isSleeping) && (
          <div 
            className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide pointer-events-none select-none shadow-lg border transition-all duration-300 animate-pulse font-space-grotesk z-20 ${
              isDockedToNavbar ? "top-24" : "-top-12"
            }`}
            style={{
              backgroundColor: "rgba(18, 12, 24, 0.94)",
              borderColor: "rgba(var(--accent-glow-raw, 216, 177, 91), 0.5)",
              color: "var(--accent-primary, #D8B15B)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7), 0 0 15px rgba(var(--accent-glow-raw, 216, 177, 91), 0.35)"
            }}
          >
            {clickMessage ? (
              <span>{clickMessage}</span>
            ) : (
              <span className="flex items-center gap-1.5 font-mono text-xs text-primary">
                <span>🛸</span> Zzz... 💤
              </span>
            )}
            {/* Speech bubble pointer arrow */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
                isDockedToNavbar ? "-top-1 border-t border-l" : "-bottom-1 border-r border-b"
              }`}
              style={{
                backgroundColor: "rgba(18, 12, 24, 0.94)",
                borderColor: "rgba(var(--accent-glow-raw, 216, 177, 91), 0.5)"
              }}
            />
          </div>
        )}

        {/* Idle bob / click bounce layer */}
        <div style={{ width: '100%', height: '100%', animation: clickBounce ? 'bounce 0.5s ease' : (isIdle ? 'ufo-bob 2.6s ease-in-out infinite' : 'none') }}>
          {/* Physics transform layer - pointer-events-auto enables clicking directly on UFO */}
          <div
            onClick={handleUfoClick}
            className={`transition-all duration-300 ${
              isHoveringInteractive || isDockedToNavbar ? "pointer-events-none select-none" : "pointer-events-auto cursor-pointer"
            }`}
            title={isHoveringInteractive || isDockedToNavbar ? undefined : "Click to talk with your UFO companion!"}
            style={{
              width: '100%',
              height: '100%',
              transform: `rotate(${tiltDeg}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
              transformOrigin: `${UFO_CX}px ${UFO_CY}px`,
              filter: engineGlowShadow,
              willChange: 'transform, filter',
            }}
          >
            <svg
              viewBox="0 0 140 115"
              width={UFO_W}
              height={UFO_H}
              xmlns="http://www.w3.org/2000/svg"
              overflow="visible"
            >
              <defs>
                <radialGradient id="engineGlow" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="var(--accent-secondary, #ffd060)" stopOpacity={0.95 + glowIntensity * 0.05} />
                  <stop offset="40%" stopColor="var(--accent-primary, #f59e0b)" stopOpacity={0.7 + glowIntensity * 0.3} />
                  <stop offset="100%" stopColor="var(--accent-primary, #b45309)" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="engineHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--accent-primary, #fbbf24)" stopOpacity={0.3 + glowIntensity * 0.55} />
                  <stop offset="100%" stopColor="var(--accent-primary, #fbbf24)" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="saucerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2a2a38" />
                  <stop offset="50%" stopColor="#1a1a26" />
                  <stop offset="100%" stopColor="#0d0d16" />
                </linearGradient>

                <linearGradient id="saucerTopGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34344a" />
                  <stop offset="100%" stopColor="#1e1e2e" />
                </linearGradient>

                <radialGradient id="domeGrad" cx="38%" cy="28%" r="65%">
                  <stop offset="0%" stopColor="#4a5a78" stopOpacity="0.55" />
                  <stop offset="55%" stopColor="#1c2438" stopOpacity="0.72" />
                  <stop offset="100%" stopColor="#0a0e1a" stopOpacity="0.88" />
                </radialGradient>

                <radialGradient id="domeSheen" cx="35%" cy="22%" r="45%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="portGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--accent-secondary, #ffd060)" stopOpacity="1" />
                  <stop offset="60%" stopColor="var(--accent-primary, #f59e0b)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="var(--accent-primary, #d97706)" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="suitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8e8ec" />
                  <stop offset="100%" stopColor="#b8b8c4" />
                </linearGradient>

                <radialGradient id="visorGrad" cx="35%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#2a3a52" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#050a12" stopOpacity="1" />
                </radialGradient>

                <radialGradient id="helmetGrad" cx="38%" cy="32%" r="60%">
                  <stop offset="0%" stopColor="#f0f0f4" />
                  <stop offset="100%" stopColor="#c8c8d0" />
                </radialGradient>

                <linearGradient id="goldRing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-secondary, #f0c040)" />
                  <stop offset="50%" stopColor="var(--accent-primary, #c8962a)" />
                  <stop offset="100%" stopColor="var(--accent-primary, #9a6e1a)" />
                </linearGradient>

                <clipPath id="domeClip">
                  <path d="M 32 70 Q 32 18 70 18 Q 108 18 108 70 Z" />
                </clipPath>
              </defs>

              {/* Engine glow */}
              <ellipse cx="70" cy="89" rx="36" ry="10" fill="url(#engineHalo)" />
              <ellipse cx="70" cy="85" rx="22" ry="7" fill="url(#engineGlow)" />
              <ellipse cx="70" cy="83" rx="10" ry="3.5" fill="var(--accent-secondary, #fde68a)" opacity={0.6 + glowIntensity * 0.4} />

              {/* Saucer underside curve */}
              <path d="M 16 78 Q 70 91 124 78" fill="#0e0e1c" />

              {/* Saucer main disc */}
              <ellipse cx="70" cy="78" rx="54" ry="12" fill="url(#saucerGrad)" />

              {/* Saucer top surface */}
              <path d="M 16 78 Q 42 62 70 60 Q 98 62 124 78" fill="url(#saucerTopGrad)" />

              {/* Gold rim rings */}
              <ellipse cx="70" cy="78" rx="54" ry="12" fill="none" stroke="url(#goldRing)" strokeWidth="1.8" />
              <ellipse cx="70" cy="78" rx="44" ry="9.5" fill="none" stroke="var(--accent-primary, #c8962a)" strokeWidth="0.6" opacity="0.45" />

              {/* Panel seam lines */}
              <path d="M 16 78 Q 70 68 124 78" fill="none" stroke="#252535" strokeWidth="0.8" opacity="0.6" />
              <path d="M 22 76 Q 70 70 118 76" fill="none" stroke="#303048" strokeWidth="0.4" opacity="0.35" />

              {/* Porthole lights */}
              {portholes.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={5.5} fill="url(#portGlow)" opacity="0.55" />
                  <circle cx={p.x} cy={p.y} r={3} fill="#1a1a28" stroke="var(--accent-primary, #c8962a)" strokeWidth="0.8" />
                  <circle cx={p.x} cy={p.y} r={1.9} fill="var(--accent-secondary, #fde68a)" opacity="0.92" />
                  <circle cx={p.x - 0.7} cy={p.y - 0.7} r={0.65} fill="#ffffff" opacity="0.55" />
                </g>
              ))}

              {/* Dome base ambient glow */}
              <ellipse cx="70" cy="69" rx="38" ry="5" fill="#1a3060" opacity="0.35" />

              {/* Dome body */}
              <path d="M 32 70 Q 32 18 70 18 Q 108 18 108 70 Z" fill="url(#domeGrad)" />

              {/* Astronaut (clipped inside dome) */}
              <g clipPath="url(#domeClip)">
                {/* Console */}
                <path
                  d="M 46 76 Q 46 70 70 70 Q 94 70 94 76 L 90 80 Q 70 82 50 80 Z"
                  fill="#1c1c2c"
                  stroke="#c8962a"
                  strokeWidth="0.6"
                />
                <ellipse cx="70" cy="73" rx="16" ry="3.5" fill="#1a3060" opacity="0.65" />
                <ellipse cx="70" cy="73" rx="12" ry="2.5" fill="#2a50a0" opacity="0.45" />
                {/* Console screen blips */}
                <rect x="62" y="71.5" width="3" height="2" rx="0.5" fill="#60ff80" opacity="0.6" />
                <rect x="67" y="71.5" width="3" height="2" rx="0.5" fill="#60c0ff" opacity="0.6" />
                <rect x="72" y="71.5" width="3" height="2" rx="0.5" fill="#ff8060" opacity="0.5" />

                {/* Torso */}
                <rect x="54" y="62" width="32" height="18" rx="7" ry="7" fill="url(#suitGrad)" />

                {/* Shoulder pads */}
                <ellipse cx="55" cy="64" rx="6" ry="4.5" fill="#d0d0da" />
                <ellipse cx="85" cy="64" rx="6" ry="4.5" fill="#d0d0da" />

                {/* Chest panel */}
                <rect x="62" y="65" width="16" height="8" rx="2" fill="#2a2a3c" opacity="0.6" />
                <circle cx="65" cy="68" r="1.5" fill="#fde68a" opacity="0.85" />
                <circle cx="70" cy="68" r="1.5" fill="#60a0ff" opacity="0.85" />
                <circle cx="75" cy="68" r="1.5" fill="#ff6060" opacity="0.75" />

                {/* Left arm */}
                <path d="M 54 65 Q 48 67 46 72" fill="none" stroke="#c8c8d4" strokeWidth="5" strokeLinecap="round" />
                <circle cx="46" cy="73" r="3.5" fill="#b8b8c4" />

                {/* Right arm */}
                <path d="M 86 65 Q 92 67 94 72" fill="none" stroke="#c8c8d4" strokeWidth="5" strokeLinecap="round" />
                <circle cx="94" cy="73" r="3.5" fill="#b8b8c4" />

                {/* Helmet */}
                <circle cx="70" cy="52" r="13" fill="url(#helmetGrad)" />
                <circle cx="70" cy="52" r="13" fill="none" stroke="#d0d0dc" strokeWidth="1.2" />

                {/* Neck ring */}
                <rect x="63" y="62" width="14" height="4" rx="2" fill="#c0c0cc" />
                <rect x="63" y="62" width="14" height="4" rx="2" fill="none" stroke="#a0a0ae" strokeWidth="0.5" />

                {/* Visor (offset by look direction) */}
                <path
                  d={`M ${56 + lookX} ${48 + lookY} Q ${70 + lookX} ${40 + lookY} ${84 + lookX} ${48 + lookY} Q ${84 + lookX} ${60 + lookY} ${70 + lookX} ${62 + lookY} Q ${56 + lookX} ${60 + lookY} ${56 + lookX} ${48 + lookY} Z`}
                  fill="url(#visorGrad)"
                  opacity="0.96"
                />
                <path
                  d={`M ${59 + lookX} ${46 + lookY} Q ${65 + lookX} ${43 + lookY} ${72 + lookX} ${45 + lookY}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  opacity="0.22"
                  strokeLinecap="round"
                />
                <ellipse cx={61 + lookX} cy={49 + lookY} rx="3" ry="2" fill="#ffffff" opacity="0.08" />

                {/* Antenna */}
                <line x1="70" y1="39" x2="70" y2="32" stroke="#c0c0cc" strokeWidth="1.2" />
                <circle cx="70" cy="31" r="1.8" fill="#fde68a" opacity="0.92" />
                <circle cx="70" cy="31" r="0.7" fill="#ffffff" opacity="0.6" />

                {/* Helmet highlight */}
                <ellipse cx="63" cy="45" rx="5" ry="3.5" fill="#ffffff" opacity="0.09" />
              </g>

              {/* Dome glass sheen overlay */}
              <path d="M 32 70 Q 32 18 70 18 Q 108 18 108 70 Z" fill="url(#domeSheen)" />

              {/* Dome edge */}
              <path
                d="M 32 70 Q 32 18 70 18 Q 108 18 108 70"
                fill="none"
                stroke="#6080b0"
                strokeWidth="0.8"
                opacity="0.45"
              />

              {/* Dome base ring */}
              <ellipse cx="70" cy="69" rx="38" ry="5" fill="none" stroke="url(#goldRing)" strokeWidth="1.4" />
              <ellipse cx="70" cy="69" rx="34" ry="4" fill="none" stroke="#c8962a" strokeWidth="0.5" opacity="0.38" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
