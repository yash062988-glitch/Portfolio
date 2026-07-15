"use client";

import React, { useEffect, useRef } from "react";

const GRID_W = 96;
const GRID_H = 40;
const DRAG = 1.8;
const SPRING_K = 0.08;
const DAMPING = 0.9;
const DT = 0.1;
const CHROMA = 0.005;
const PADDING_X = 60;
const PADDING_Y = 30;

const VERT_SRC = `#version 300 es
in vec2 aPos;
in vec2 aUv;
in vec2 aDisp;
out vec2 vUv;
out float vMag;
void main() {
    gl_Position = vec4(aPos + aDisp, 0.0, 1.0);
    vUv = aUv;
    vMag = length(aDisp);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
in float vMag;
out vec4 outColor;
uniform sampler2D uTex;
uniform float uChroma;
uniform vec3 uColorA;
uniform vec3 uColorB;
void main() {
    vec4 base = texture(uTex, vUv);
    if (uChroma > 0.0) {
        float o = uChroma * ${CHROMA.toFixed(5)} * clamp(vMag * 8.0, 0.0, 1.0);
        float aOff = texture(uTex, vUv + vec2(o, 0.0)).a;
        float bOff = texture(uTex, vUv - vec2(o, 0.0)).a;
        vec3 col = base.rgb * base.a;
        col += uColorA * max(0.0, aOff - base.a);
        col += uColorB * max(0.0, bOff - base.a);
        float aMax = max(base.a, max(aOff, bOff));
        outColor = vec4(col, aMax);
    } else {
        outColor = base;
    }
}`;

function compile(gl, type, src) {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
    }
    return sh;
}

function linkProgram(gl, vs, fs) {
    const p = gl.createProgram();
    if (!p) return null;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(p));
        gl.deleteProgram(p);
        return null;
    }
    return p;
}

const VARIANT_WEIGHTS = {
    Thin: 100,
    Hairline: 100,
    ExtraLight: 200,
    UltraLight: 200,
    Light: 300,
    Regular: 400,
    Normal: 400,
    Book: 400,
    Medium: 500,
    SemiBold: 600,
    DemiBold: 600,
    Bold: 700,
    ExtraBold: 800,
    UltraBold: 800,
    Black: 900,
    Heavy: 900,
};

function variantToWeight(variant) {
    if (!variant) return 400;
    const base = variant
        .replace(/\s*Italic\s*/i, "")
        .trim()
        .replace(/\s+/g, "");
    return VARIANT_WEIGHTS[base] ?? 400;
}

function variantIsItalic(variant) {
    return !!variant && /italic/i.test(variant);
}

function parseColor(v) {
    if (typeof v !== "string") return [1, 1, 1];
    const s = v.trim();
    if (s.startsWith("#")) {
        let h = s.slice(1);
        if (h.length === 3)
            h = h
                .split("")
                .map((c) => c + c)
                .join("");
        if (h.length >= 6) {
            const r = parseInt(h.slice(0, 2), 16) / 255;
            const g = parseInt(h.slice(2, 4), 16) / 255;
            const b = parseInt(h.slice(4, 6), 16) / 255;
            if (isFinite(r) && isFinite(g) && isFinite(b)) return [r, g, b];
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

function renderTextToCanvas(
    text,
    color,
    fontFamily,
    fontWeight,
    fontStyle,
    fontSize,
    width,
    height
) {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");
    if (!ctx) return c;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}, sans-serif`;
    ctx.fillText(text, width / 2, height / 2);
    return c;
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
    const colorSplitRef = useRef(!!colorSplit);
    colorSplitRef.current = !!colorSplit;
    
    const customColorsRef = useRef([]);
    customColorsRef.current = Array.isArray(customColors)
        ? customColors.map(parseColor)
        : [];
        
    const forceRef = useRef(typeof force === "number" ? force / 10 : DRAG);
    forceRef.current = typeof force === "number" ? force / 10 : DRAG;

    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const gl = canvas.getContext("webgl2", {
            alpha: true,
            premultipliedAlpha: true,
            antialias: true,
        });
        if (!gl) {
            console.error("WebGL2 not available");
            return;
        }

        // ── Get styles from computed CSS styles of wrapper ────────────────
        const styles = window.getComputedStyle(wrapper);
        const fontFamily = styles.fontFamily || "Inter";
        const fontSizeVal = parseFloat(styles.fontSize) || 40;
        const fontWeight = styles.fontWeight || "700";
        const fontStyle = styles.fontStyle || "normal";

        // ── Grid geometry ───────────────────────────────────────────────
        const vertCount = (GRID_W + 1) * (GRID_H + 1);
        const positions = new Float32Array(vertCount * 2);
        const uvs = new Float32Array(vertCount * 2);
        for (let y = 0; y <= GRID_H; y++) {
            for (let x = 0; x <= GRID_W; x++) {
                const i = y * (GRID_W + 1) + x;
                const u = x / GRID_W;
                const v = y / GRID_H;
                positions[i * 2] = u * 2 - 1;
                positions[i * 2 + 1] = 1 - v * 2;
                uvs[i * 2] = u;
                uvs[i * 2 + 1] = v;
            }
        }
        const indexCount = GRID_W * GRID_H * 6;
        const indices = new Uint32Array(indexCount);
        let idx = 0;
        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                const a = y * (GRID_W + 1) + x;
                const b = a + 1;
                const c = a + (GRID_W + 1);
                const d = c + 1;
                indices[idx++] = a;
                indices[idx++] = c;
                indices[idx++] = b;
                indices[idx++] = b;
                indices[idx++] = c;
                indices[idx++] = d;
            }
        }

        const disp = new Float32Array(vertCount * 2);
        const vel = new Float32Array(vertCount * 2);

        // ── GL setup ────────────────────────────────────────────────────
        const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
        if (!vs || !fs) return;
        const program = linkProgram(gl, vs, fs);
        if (!program) return;

        const aPos = gl.getAttribLocation(program, "aPos");
        const aUv = gl.getAttribLocation(program, "aUv");
        const aDisp = gl.getAttribLocation(program, "aDisp");
        const uTex = gl.getUniformLocation(program, "uTex");
        const uChroma = gl.getUniformLocation(program, "uChroma");
        const uColorA = gl.getUniformLocation(program, "uColorA");
        const uColorB = gl.getUniformLocation(program, "uColorB");

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uvBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(aUv);
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

        const dispBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, dispBuf);
        gl.bufferData(gl.ARRAY_BUFFER, disp, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(aDisp);
        gl.vertexAttribPointer(aDisp, 2, gl.FLOAT, false, 0, 0);

        const idxBuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        let cancelled = false;

        const rebuildTex = async () => {
            const w = Math.max(2, canvas.width);
            const h = Math.max(2, canvas.height);
            const dpr = window.devicePixelRatio || 1;
            const realSize = fontSizeVal * dpr;

            try {
                if (typeof document !== "undefined") {
                    const fontStr = `${fontStyle} ${fontWeight} ${realSize}px ${fontFamily}`;
                    if (document.fonts?.load) {
                        await document.fonts.load(fontStr);
                    }
                    if (document.fonts?.ready) {
                        await document.fonts.ready;
                    }
                }
            } catch (e) {
                /* ignore */
            }
            if (cancelled) return;
            const c2 = renderTextToCanvas(
                String(text ?? ""),
                color ?? "#ffffff",
                fontFamily,
                fontWeight,
                fontStyle,
                realSize,
                w,
                h
            );
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                c2
            );
        };

        // ── Resize ──────────────────────────────────────────────────────
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = wrapper.getBoundingClientRect();
            const padX = PADDING_X * dpr;
            const padY = PADDING_Y * dpr;
            const w = Math.max(2, Math.round(rect.width * dpr + padX * 2));
            const h = Math.max(2, Math.round(rect.height * dpr + padY * 2));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
                rebuildTex();
            }
        };
        const ro = new ResizeObserver(resize);
        ro.observe(wrapper);
        resize();
        rebuildTex();

        // ── Mouse tracking ──────────────────────────────────────────────
        const cursor = {
            x: 99,
            y: 99,
            px: 99,
            py: 99,
            vx: 0,
            vy: 0,
            inside: false,
        };
        const onMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width;
            const ny = (e.clientY - rect.top) / rect.height;
            const x = nx * 2 - 1;
            const y = 1 - ny * 2;
            if (!cursor.inside) {
                cursor.px = x;
                cursor.py = y;
                cursor.inside = true;
            }
            cursor.x = x;
            cursor.y = y;
        };
        const onLeave = () => {
            cursor.inside = false;
            cursor.x = 99;
            cursor.y = 99;
            cursor.vx = 0;
            cursor.vy = 0;
        };
        wrapper.addEventListener("pointermove", onMove);
        wrapper.addEventListener("pointerleave", onLeave);

        // ── Animation loop ──────────────────────────────────────────────
        let rafId = 0;
        const tick = () => {
            cursor.vx = cursor.x - cursor.px;
            cursor.vy = cursor.y - cursor.py;
            const vmag = Math.hypot(cursor.vx, cursor.vy);
            if (vmag > 0.3) {
                cursor.vx = 0;
                cursor.vy = 0;
            }
            cursor.px = cursor.x;
            cursor.py = cursor.y;

            for (let i = 0; i < vertCount; i++) {
                const i2 = i * 2;
                const px = positions[i2];
                const py = positions[i2 + 1];
                const dx = disp[i2];
                const dy = disp[i2 + 1];

                const cx = cursor.x - (px + dx);
                const cy = cursor.y - (py + dy);
                const cd = Math.hypot(cx, cy);
                const proximity = Math.max(0, 1 / (1 + cd / 0.05) - 0.1);

                let vx = vel[i2];
                let vy = vel[i2 + 1];

                const fpull = forceRef.current;
                vx += cursor.vx * fpull * proximity;
                vy += cursor.vy * fpull * proximity;

                vx -= dx * SPRING_K;
                vy -= dy * SPRING_K;

                vx *= DAMPING;
                vy *= DAMPING;

                vel[i2] = vx;
                vel[i2 + 1] = vy;

                let ndx = dx + vx * DT;
                let ndy = dy + vy * DT;
                if (ndx > 1) ndx = 1;
                else if (ndx < -1) ndx = -1;
                if (ndy > 1) ndy = 1;
                else if (ndy < -1) ndy = -1;
                disp[i2] = ndx;
                disp[i2 + 1] = ndy;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, dispBuf);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, disp);

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.uniform1i(uTex, 0);
            gl.uniform1f(uChroma, colorSplitRef.current ? 1.0 : 0.0);

            let cA = [1, 0, 0];
            let cB = [0, 0, 1];
            const cols = customColorsRef.current;
            if (cols.length === 1) {
                cA = cols[0];
                cB = cols[0];
            } else if (cols.length > 1) {
                const cycleMs = 400;
                const idx = Math.floor(performance.now() / cycleMs) % cols.length;
                cA = cols[idx];
                cB = cols[(idx + 1) % cols.length];
            }
            gl.uniform3f(uColorA, cA[0], cA[1], cA[2]);
            gl.uniform3f(uColorB, cB[0], cB[1], cB[2]);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

            gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);

            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            ro.disconnect();
            wrapper.removeEventListener("pointermove", onMove);
            wrapper.removeEventListener("pointerleave", onLeave);
            gl.deleteBuffer(posBuf);
            gl.deleteBuffer(uvBuf);
            gl.deleteBuffer(dispBuf);
            gl.deleteBuffer(idxBuf);
            gl.deleteTexture(tex);
            gl.deleteVertexArray(vao);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, [text, color]);

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
            {/* Invisible heading for SEO, screen readers, and sizing */}
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
            
            {/* WebGL Overlay */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: `-${PADDING_Y}px`,
                    left: `-${PADDING_X}px`,
                    width: `calc(100% + ${PADDING_X * 2}px)`,
                    height: `calc(100% + ${PADDING_Y * 2}px)`,
                    display: "block",
                    pointerEvents: "none"
                }}
            />
        </div>
    );
}
