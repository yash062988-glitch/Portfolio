"use client";

import React, { useEffect, useRef, useState, useId } from "react";

const PADDING_X = 60;
const PADDING_Y = 30;
const ALPHA_THR = 50;

function parseColor(c) {
    if (!c) return [1, 1, 1];
    const s = c.trim();
    if (s.startsWith("#")) {
        let h = s.slice(1);
        if (h.length === 3)
            h = h
                .split("")
                .map((x) => x + x)
                .join("");
        if (h.length >= 6) {
            const r = parseInt(h.slice(0, 2), 16) / 255;
            const g = parseInt(h.slice(2, 4), 16) / 255;
            const b = parseInt(h.slice(4, 6), 16) / 255;
            return [r || 0, g || 0, b || 0];
        }
    }
    const m = s.match(/rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (m) {
        return [
            parseInt(m[1], 10) / 255,
            parseInt(m[2], 10) / 255,
            parseInt(m[3], 10) / 255,
        ];
    }
    return [1, 1, 1];
}

export default function MeshText({
    text = "MESH",
    color = "#ffffff",
    className = "",
    colorSplit = true,
    customColors = ["#e9b15d", "#ffffff"],
    force = 18,
    as: Component = "h2"
}) {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const particlesRef = useRef([]);
    const distRef = useRef(null);
    const mouseRef = useRef({
        x: -9999,
        y: -9999,
        prevX: -9999,
        prevY: -9999,
        speed: 0,
        active: false,
    });

    const [blurValue, setBlurValue] = useState(2.2);
    const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "-");
    const filterId = `liquid-goo-${reactId}`;

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // styles fromcomputed css
        const styles = window.getComputedStyle(wrapper);
        const fontFamily = styles.fontFamily || "Inter";
        const fontSizeVal = parseFloat(styles.fontSize) || 40;
        const fontWeight = styles.fontWeight || "700";
        const fontStyle = styles.fontStyle || "normal";

        let cancelled = false;
        let lastWidth = 0;
        let lastHeight = 0;
        let textCanvas = null;

        const sampleSpawnPoint = (distMap, w, h) => {
            if (!distMap) return { x: Math.random() * w, y: Math.random() * h };
            for (let attempt = 0; attempt < 150; attempt++) {
                const rx = Math.floor(Math.random() * w);
                const ry = Math.floor(Math.random() * h);
                if (distMap[ry * w + rx] > 5) {
                    return { x: rx, y: ry };
                }
            }
            return { x: Math.random() * w, y: Math.random() * h };
        };

        const spawnAtBottom = (p, distMap, w, h) => {
            const pt = sampleSpawnPoint(distMap, w, h);
            p.x = pt.x;
            p.y = pt.y;
            p.vx = (Math.random() - 0.5) * 0.25;
            p.vy = -(0.9 + Math.random() * 0.3);
            p.baseSize = 0.75 + Math.random() * 0.75;
            p.jitterPhase = Math.random() * Math.PI * 2;
            p.jitterAmp = 0.015 + Math.random() * 0.035;
            p.direction = "up";
        };

        const spawnAtTop = (p, distMap, w, h) => {
            const pt = sampleSpawnPoint(distMap, w, h);
            p.x = pt.x;
            p.y = pt.y;
            p.vx = (Math.random() - 0.5) * 0.25;
            p.vy = 0.9 + Math.random() * 0.3;
            p.baseSize = 0.75 + Math.random() * 0.75;
            p.jitterPhase = Math.random() * Math.PI * 2;
            p.jitterAmp = 0.015 + Math.random() * 0.035;
            p.direction = "down";
        };

        const buildDistanceFieldAndCache = (w, h, dpr) => {
            textCanvas = document.createElement("canvas");
            textCanvas.width = w;
            textCanvas.height = h;
            const tCtx = textCanvas.getContext("2d", { willReadFrequently: true });
            if (!tCtx) return;

            let resolvedColor = color || "#ffffff";
            if (resolvedColor.startsWith("var(")) {
              const varName = resolvedColor.slice(4, -1).trim();
              resolvedColor = getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#D8B15B";
            }

            tCtx.clearRect(0, 0, w, h);
            tCtx.fillStyle = resolvedColor; // Draw text mask in heading color
            tCtx.textAlign = "center";
            tCtx.textBaseline = "middle";
            tCtx.font = `${fontStyle} ${fontWeight} ${fontSizeVal * dpr}px ${fontFamily}, sans-serif`;
            tCtx.fillText(text, w / 2, h / 2);

            let data;
            try {
                data = tCtx.getImageData(0, 0, w, h).data;
            } catch (e) {
                return;
            }

            const dist = new Float32Array(w * h);
            const INF = 1e9;
            for (let i = 0; i < w * h; i++) {
                dist[i] = data[i * 4 + 3] < ALPHA_THR ? 0 : INF;
            }

            const D1 = 1;
            const D2 = 1.4142;
            for (let y = 1; y < h; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const i = y * w + x;
                    let v = dist[i];
                    if (dist[i - w] + D1 < v) v = dist[i - w] + D1;
                    if (dist[i - 1] + D1 < v) v = dist[i - 1] + D1;
                    if (dist[i - w - 1] + D2 < v) v = dist[i - w - 1] + D2;
                    if (dist[i - w + 1] + D2 < v) v = dist[i - w + 1] + D2;
                    dist[i] = v;
                }
            }
            for (let y = h - 2; y >= 0; y--) {
                for (let x = w - 2; x >= 1; x--) {
                    const i = y * w + x;
                    let v = dist[i];
                    if (dist[i + w] + D1 < v) v = dist[i + w] + D1;
                    if (dist[i + 1] + D1 < v) v = dist[i + 1] + D1;
                    if (dist[i + w + 1] + D2 < v) v = dist[i + w + 1] + D2;
                    if (dist[i + w - 1] + D2 < v) v = dist[i + w - 1] + D2;
                    dist[i] = v;
                }
            }
            distRef.current = dist;

            // Pre-spawn particles inside text mask area
            const list = [];
            const count = Math.min(600, Math.max(80, String(text).length * 15));
            for (let i = 0; i < count; i++) {
                const p = {};
                if (i % 2 === 0) spawnAtBottom(p, dist, w, h);
                else spawnAtTop(p, dist, w, h);
                // Stagger initial positions vertically
                p.y = Math.random() * h;
                list.push(p);
            }
            particlesRef.current = list;
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const rect = wrapper.getBoundingClientRect();
            const padX = PADDING_X * dpr;
            const padY = PADDING_Y * dpr;
            const w = Math.max(10, Math.round(rect.width * dpr + padX * 2));
            const h = Math.max(10, Math.round(rect.height * dpr + padY * 2));

            if (lastWidth !== w || lastHeight !== h) {
                canvas.width = w;
                canvas.height = h;
                canvas.style.width = `${rect.width + PADDING_X * 2}px`;
                canvas.style.height = `${rect.height + PADDING_Y * 2}px`;

                lastWidth = w;
                lastHeight = h;

                buildDistanceFieldAndCache(w, h, dpr);

                const pSize = Math.max(2.0, fontSizeVal * dpr * 0.08);
                const computedBlur = Math.max(0.3, Math.min(pSize * 0.35, 4 * 0.35));
                setBlurValue(computedBlur);
            }
        };

        const ro = new ResizeObserver(resize);
        ro.observe(wrapper);
        resize();

        const updatePointer = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
            const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
            const mx = (clientX - rect.left) * scaleX;
            const my = (clientY - rect.top) * scaleY;
            const m = mouseRef.current;
            if (m.prevX > -9999) {
                const ddx = mx - m.prevX;
                const ddy = my - m.prevY;
                m.speed = Math.sqrt(ddx * ddx + ddy * ddy);
            }
            m.prevX = mx;
            m.prevY = my;
            m.x = mx;
            m.y = my;
            m.active = true;
        };

        const onMove = (e) => updatePointer(e.clientX, e.clientY);
        const onLeave = () => {
            const m = mouseRef.current;
            m.active = false;
            m.x = -9999;
            m.y = -9999;
            m.prevX = -9999;
            m.prevY = -9999;
            m.speed = 0;
        };

        wrapper.addEventListener("pointermove", onMove);
        wrapper.addEventListener("pointerleave", onLeave);

        // Simulation parameters
        const speed = 4;
        const speedMul = 0.05 + Math.pow((speed - 1) / 9, 1.3) * 2.35;
        const hoverRadius = 90;
        const breakChance = 50;

        let rafId = 0;
        let last = performance.now();

        const tick = (now) => {
            if (cancelled) return;
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;

            const w = canvas.width;
            const h = canvas.height;
            if (!w || !h) {
                rafId = requestAnimationFrame(tick);
                return;
            }

            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, w, h);

            // 1. Draw solid text first as the base for 100% legibility
            if (textCanvas) {
                ctx.drawImage(textCanvas, 0, 0);
            }

            const particles = particlesRef.current;
            const mouse = mouseRef.current;
            mouse.speed *= 0.88;
            const breakProb = (breakChance / 100) * dt;
            const hovering = mouse.active && hoverRadius > 0;

            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const pSize = Math.max(2.0, fontSizeVal * dpr * 0.08);

            let activeColor = color;
            if (color && color.startsWith("var(")) {
              const varName = color.slice(4, -1).trim();
              activeColor = getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#D8B15B";
            }
            ctx.fillStyle = activeColor;

            // 2. Draw smaller bubbling particles on top
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                if (p.direction === "down") {
                    if (p.vy > 1.6) p.vy = 1.6;
                } else {
                    if (p.vy < -1.6) p.vy = -1.6;
                }

                p.vx += Math.sin(p.jitterPhase + now * 0.0015) * p.jitterAmp;
                p.vx *= 0.96;

                if (Math.random() < breakProb) {
                    p.vx += (Math.random() - 0.5) * 1.8;
                    p.vy += (Math.random() - 0.5) * 0.6;
                }

                if (p.repX === undefined) p.repX = 0;
                if (p.repY === undefined) p.repY = 0;
                let inZone = false;
                if (hovering) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distSq = dx * dx + dy * dy;
                    const cutoff = hoverRadius * dpr;
                    if (distSq > 0 && distSq < cutoff * cutoff) {
                        const dist = Math.sqrt(distSq);
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const falloff = 1 - dist / cutoff;
                        const push = falloff * mouse.speed * 0.07;
                        p.repX += nx * push;
                        p.repY += ny * push;
                        const targetRepX = nx * (cutoff - dist);
                        const targetRepY = ny * (cutoff - dist);
                        p.repX += (targetRepX - p.repX) * 0.06;
                        p.repY += (targetRepY - p.repY) * 0.06;
                        inZone = true;
                    }
                }
                if (!inZone) {
                    p.repX *= 0.97;
                    p.repY *= 0.97;
                }
                const hoverOX = p.repX;
                const hoverOY = p.repY;

                p.x += p.vx * speedMul * 60 * dt;
                p.y += p.vy * speedMul * 60 * dt;

                const distMap = distRef.current;
                const margin = pSize * 2;

                const resetParticle = (pt) => {
                    const spawn = sampleSpawnPoint(distMap, w, h);
                    pt.x = spawn.x;
                    pt.y = spawn.y;
                    pt.vx = (Math.random() - 0.5) * 0.25;
                    pt.vy = pt.direction === "down" ? (0.9 + Math.random() * 0.3) : -(0.9 + Math.random() * 0.3);
                };

                if (p.direction === "down") {
                    if (p.y > h + margin) resetParticle(p);
                } else {
                    if (p.y < -margin) resetParticle(p);
                }
                if (p.x < -margin || p.x > w + margin) resetParticle(p);

                let alphaFactor = 1;
                if (distMap) {
                    const ix = Math.max(0, Math.min(w - 1, Math.floor(p.x)));
                    const iy = Math.max(0, Math.min(h - 1, Math.floor(p.y)));
                    const d = distMap[iy * w + ix];
                    const band = pSize * 1.5;
                    alphaFactor = Math.max(0.25, Math.min(1, d / band));
                }

                const edgeBand = h * 0.15;
                const distFromEdge = Math.min(p.y, h - p.y);
                const vertFactor = distFromEdge >= edgeBand ? 1 : Math.max(0.25, distFromEdge / edgeBand);
                const sizeFactor = Math.min(vertFactor, alphaFactor);

                const drawX = p.x + hoverOX;
                const drawY = p.y + hoverOY;
                const finalRadius = pSize * p.baseSize * sizeFactor;

                ctx.beginPath();
                ctx.arc(drawX, drawY, finalRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        const observer = new MutationObserver(() => {
            const rect = wrapper.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = Math.max(10, Math.round(rect.width * dpr + PADDING_X * dpr * 2));
            const h = Math.max(10, Math.round(rect.height * dpr + PADDING_Y * dpr * 2));
            buildDistanceFieldAndCache(w, h, dpr);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

        return () => {
            observer.disconnect();
            cancelled = true;
            cancelAnimationFrame(rafId);
            ro.disconnect();
            wrapper.removeEventListener("pointermove", onMove);
            wrapper.removeEventListener("pointerleave", onLeave);
        };
    }, [text, color]);

    const filterActive = true;
    const matrix = `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7`;

    return (
        <div
            ref={wrapperRef}
            style={{
                position: "relative",
                display: "inline-block",
                width: "fit-content",
                maxWidth: "100%",
                userSelect: "none"
            }}
            className={className}
        >
            {/* Invisible native heading for layout & accessibility */}
            <Component
                style={{
                    visibility: "hidden",
                    pointerEvents: "none",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    margin: 0,
                    padding: 0
                }}
            >
                {text}
            </Component>

            {/* Gooey SVG Filter */}
            <svg
                aria-hidden
                style={{
                    position: "absolute",
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                }}
            >
                <defs>
                    <filter id={filterId} colorInterpolationFilters="sRGB">
                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation={blurValue}
                            result="blur"
                        />
                        <feColorMatrix in="blur" values={matrix} result="goo" />
                        <feComposite
                            in="SourceGraphic"
                            in2="goo"
                            operator="atop"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Liquid 2D Canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: `-${PADDING_Y}px`,
                    left: `-${PADDING_X}px`,
                    display: "block",
                    pointerEvents: "none",
                    filter: filterActive ? `url(#${filterId})` : "none",
                }}
            />
        </div>
    );
}
