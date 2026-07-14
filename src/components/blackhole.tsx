// Black Hole — Originkit
// Using component defaults.

"use client"
import * as React from "react"
import { useRef, useEffect, useCallback, useState } from "react"

/**
 * BlackHole - A premium 3D black hole accretion disk component.
 *
 * Renders an active gravitationally bound accretion disk with flowing particles
 * leaving fading trail lines. Utilizes 3D Z-depth sorting to allow particles to pass
 * behind and in front of the central event horizon with authentic physical occlusion.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 600
 * @framerIntrinsicHeight 600
 */

// ─── Types ───────────────────────────────────────────────────

type Particle = {
    angle: number // Orbit angle (0 to 2PI)
    radius: number // Inward orbital radius from core
    height: number // 3D vertical displacement from disk plane
    speedOffset: number // Organic variance in particle velocity
    colorIdx: number // Index of the particle color
    sizeClass: number // 1: small (72%), 2: medium (22%), 3: large (5%), 4: hero (1%)
    twinklePhase: number
    twinkleSpeed: number
}

type Centre = {
    voidRadius?: number
    voidX?: number
    voidY?: number
}

type Props = {
    // Center (Event Horizon)
    showCenter?: boolean
    centre?: Centre // grouped in a modal, shown only when showCenter is on
    // Particles
    particleCount?: number
    particleSize?: number // 1–100 (divided by 20 inside → 0.05–5 effective px)
    colors?: string[]
    outerRadius?: number // 0–100 % of half-canvas (0 = at center, 100 = full)
    tilt?: number
    tiltSideway?: number
    trail?: number // 0–50 (0 = no trail, 50 = max trail)
    // Motion
    orbitSpeed?: number
    pullSpeed?: number // 0–20 (divided by 2 inside → 0–10 effective; 20 = old 100)
    style?: React.CSSProperties
}

// ─── Constants ───────────────────────────────────────────────

const BG = "#000000" // Stage background — void fill & halo both match this
const PERSPECTIVE = 1300 // Fixed 3D projection depth (no longer a control)

// ─── Defaults ────────────────────────────────────────────────

const DEFAULT_CENTRE = {
    voidRadius: 40,
    voidX: 50, // % across canvas: 0 = left, 50 = center, 100 = right
    voidY: 50, // % down canvas: 0 = top, 50 = center, 100 = bottom
}

const DEFAULTS = {
    showCenter: true,
    centre: DEFAULT_CENTRE,
    particleCount: 1000,
    particleSize: 4,
    colors: ["#ffffff"],
    outerRadius: 70, // % of half-width
    tilt: 20,
    tiltSideway: 160,
    trail: 50,
    orbitSpeed: 4,
    pullSpeed: 0,
}

// ─── Component ───────────────────────────────────────────────

export default function BlackHole(props: Props) {
    props = { ...COMPONENT_DEFAULTS, ...props }
    // Flat variables — destructure directly with defaults
    const {
        showCenter = DEFAULTS.showCenter,
        centre,
        particleCount = DEFAULTS.particleCount,
        particleSize: particleSizeRaw = DEFAULTS.particleSize,
        colors = DEFAULTS.colors,
        outerRadius = DEFAULTS.outerRadius,
        tilt = DEFAULTS.tilt,
        tiltSideway = DEFAULTS.tiltSideway,
        trail: trailRaw = DEFAULTS.trail,
        orbitSpeed = DEFAULTS.orbitSpeed,
        pullSpeed: pullSpeedRaw = DEFAULTS.pullSpeed,
        style,
    } = props

    // Unpack the grouped center modal, merged with its defaults
    const {
        voidRadius: rawVoidRadius,
        voidX,
        voidY,
    } = {
        ...DEFAULT_CENTRE,
        ...centre,
    }

    // Void fill matches the bg
    const voidColor = BG
    const perspective = PERSPECTIVE

    // Map whole-number slider values to effective render values
    // Particle size 1–50 → 0.5–4.5 px (1 = old "10", 50 = old "90")
    const particleSize =
        0.5 + (Math.max(1, Math.min(50, particleSizeRaw ?? 20)) - 1) * (4 / 49)
    const pullSpeed = Math.max(0, pullSpeedRaw ?? 1) / 2 // 0–20 → 0–10
    // Trail: 0 = clear every frame (no trail), 50 = slow fade (max trail)
    const trailAlpha = Math.max(
        0.02,
        1 - (Math.max(0, trailRaw ?? 40) / 50) * 0.98
    )

    const voidRadius = showCenter !== false ? rawVoidRadius : 1

    // Resolve outer radius % → world px against the live canvas size
    // 0% sits on the center void, 100% reaches the canvas edge (full width)
    const outerRadFromSize = useCallback(
        (w: number, _h: number) => {
            const maxR = w / 2 // 100% reaches the canvas edge → full width
            const pct = Math.max(0, Math.min(200, outerRadius)) / 100
            return voidRadius + pct * (maxR - voidRadius)
        },
        [voidRadius, outerRadius]
    )

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fgCanvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const animRef = useRef<number>(0)
    const sizeRef = useRef({ w: 600, h: 600 })
    const isVisibleRef = useRef(true)
    // Bumped whenever the real canvas size changes, so particles re-seed in place
    const [sizeVersion, setSizeVersion] = useState(0)

    // ─── Initialize Particles ────────────────────────────────

    const initParticles = useCallback(
        (
            count: number,
            horizonRad: number,
            outerRad: number,
            colorsLength: number
        ) => {
            const pts: Particle[] = []
            for (let i = 0; i < count; i++) {
                const radius =
                    horizonRad +
                    Math.pow(Math.random(), 2) * (outerRad - horizonRad)

                // Determine size class: 72% small (<= 0.72), 22% medium (0.72-0.94), 5% large (0.94-0.99), 1% hero (> 0.99)
                const randSize = Math.random()
                let sizeClass = 1
                let speedOffset = 1.1 + Math.random() * 0.4 // Small particles: fast

                if (randSize > 0.99) {
                    sizeClass = 4 // Hero
                    speedOffset = 0.2 + Math.random() * 0.2 // Very slow
                } else if (randSize > 0.94) {
                    sizeClass = 3 // Large
                    speedOffset = 0.4 + Math.random() * 0.3 // Standard slow
                } else if (randSize > 0.72) {
                    sizeClass = 2 // Medium
                    speedOffset = 0.8 + Math.random() * 0.4 // Standard
                }

                // Setup color selection with a 70% white bias:
                let colorIdx = 0
                if (colorsLength <= 3) {
                    colorIdx = Math.floor(Math.random() * colorsLength)
                } else {
                    const numWarm = 3
                    const numWhite = colorsLength - numWarm
                    colorIdx = Math.random() < 0.70
                        ? Math.floor(Math.random() * numWhite)
                        : numWhite + Math.floor(Math.random() * numWarm)
                }

                pts.push({
                    angle: Math.random() * Math.PI * 2,
                    radius,
                    height: (Math.random() - 0.5) * 16, // Vertical thickness
                    speedOffset,
                    colorIdx,
                    sizeClass,
                    twinklePhase: Math.random() * Math.PI * 2,
                    twinkleSpeed: 0.05 + Math.random() * 0.05
                })
            }
            particlesRef.current = pts
        },
        []
    )

    // Seed particles already in place — on mount, when params change, and
    // (via sizeVersion) as soon as the true canvas size is known
    useEffect(() => {
        const { w, h } = sizeRef.current
        initParticles(
            particleCount,
            voidRadius,
            outerRadFromSize(w, h),
            colors.length
        )
    }, [
        particleCount,
        voidRadius,
        colors.length,
        initParticles,
        outerRadFromSize,
        sizeVersion,
    ])

    // ─── Resize Observer ─────────────────────────────────────

    useEffect(() => {
        const container = containerRef.current
        const canvas = canvasRef.current
        const fgCanvas = fgCanvasRef.current
        if (!container || !canvas || !fgCanvas) return

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
                canvas.width = width * dpr
                canvas.height = height * dpr
                canvas.style.width = `${width}px`
                canvas.style.height = `${height}px`
                fgCanvas.width = width * dpr
                fgCanvas.height = height * dpr
                fgCanvas.style.width = `${width}px`
                fgCanvas.style.height = `${height}px`
                const prev = sizeRef.current
                sizeRef.current = { w: width, h: height }
                // Re-seed only on a real dimension change (avoids render loops)
                if (prev.w !== width || prev.h !== height) {
                    setSizeVersion((v) => v + 1)
                }
            }
        })
        ro.observe(container)
        return () => ro.disconnect()
    }, [])

    // ─── Animation Loop ──────────────────────────────────────

    useEffect(() => {
        const canvas = canvasRef.current
        const fgCanvas = fgCanvasRef.current
        if (!canvas || !fgCanvas) return
        const ctx = canvas.getContext("2d")
        const fgCtx = fgCanvas.getContext("2d")
        if (!ctx || !fgCtx) return

        let lastTime = performance.now()

        const draw = (now: number) => {
            if (!isVisibleRef.current) return
            const dt = Math.min((now - lastTime) / 16.667, 3) // Normalize to ~60fps
            lastTime = now

            const { w, h } = sizeRef.current
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

            // Setup high DPR drawing context
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

            // Explicitly reset globalAlpha to 1.0 to prevent previous frame's settings from corrupting the fade
            ctx.globalAlpha = 1.0
            fgCtx.globalAlpha = 1.0

            // Fade main canvas (bg particles + sphere) trails via destination-out (keeps canvas transparent)
            ctx.globalCompositeOperation = "destination-out"
            ctx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`
            ctx.fillRect(0, 0, w, h)
            ctx.globalCompositeOperation = "source-over"

            // Fade foreground canvas trails via destination-out (keeps canvas transparent)
            fgCtx.globalCompositeOperation = "destination-out"
            fgCtx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`
            fgCtx.fillRect(0, 0, w, h)
            fgCtx.globalCompositeOperation = "source-over"

            // Outer disk radius in world px, resolved against the live canvas size
            const outerRad = outerRadFromSize(w, h)

            // Void position anchored top-left: 0% = left/top edge, 100% = right/bottom
            const voidCx = (voidX / 100) * w
            const voidCy = (voidY / 100) * h

            const pts = particlesRef.current
            const tiltRad = (tilt * Math.PI) / 180
            const tiltSidewayRad = (tiltSideway * Math.PI) / 180

            type ProjectedPt = {
                x: number
                y: number
                size: number
                alpha: number
                z: number
                color: string
            }

            // Split particles into foreground and background arrays for perfect 3D occlusion layering
            const backgroundParticles: ProjectedPt[] = []
            const foregroundParticles: ProjectedPt[] = []

            // Calculate 22-second global brightness breathing wave
            const breathe = 1.0 + Math.sin((now * Math.PI) / 11000) * 0.05

            for (let i = 0; i < pts.length; i++) {
                const pt = pts[i]

                // Physics Orbit Speed increases closer to core (Relativistic approximation: v ~ 1/sqrt(r))
                const speedFactor = Math.sqrt(
                    voidRadius / Math.max(pt.radius, 10)
                )
                const localOrbitSpeed =
                    orbitSpeed * speedFactor * pt.speedOffset
                const localPullSpeed = pullSpeed * speedFactor * pt.speedOffset

                // Add 0.2 deg/sec global field rotation (~0.000058 rad per dt at 60fps)
                pt.angle += (localOrbitSpeed * 0.012 + 0.000058) * dt
                pt.radius -= localPullSpeed * dt

                // Update particle twinkle phase
                pt.twinklePhase += pt.twinkleSpeed * 0.012 * dt

                // Core consumption re-spawn
                if (pt.radius < voidRadius) {
                    pt.radius =
                        voidRadius +
                        0.7 * (outerRad - voidRadius) +
                        Math.random() * 0.3 * (outerRad - voidRadius)
                    pt.angle = Math.random() * Math.PI * 2
                    pt.height = (Math.random() - 0.5) * 16
                    continue
                }

                // 3D coordinates relative to center (XZ orbital plane)
                const cosA = Math.cos(pt.angle)
                const sinA = Math.sin(pt.angle)

                // Base coordinates in XZ plane
                const x_base = pt.radius * cosA
                const y_base = pt.height
                const z_base = pt.radius * sinA

                // 1. Apply main inclination tilt (around X-axis)
                const x1 = x_base
                const y1 =
                    y_base * Math.cos(tiltRad) + z_base * Math.sin(tiltRad)
                const z1 =
                    -y_base * Math.sin(tiltRad) + z_base * Math.cos(tiltRad)

                // 2. Apply sideway tilt (roll around Z-axis)
                const x3d =
                    x1 * Math.cos(tiltSidewayRad) -
                    y1 * Math.sin(tiltSidewayRad)
                const y3d =
                    x1 * Math.sin(tiltSidewayRad) +
                    y1 * Math.cos(tiltSidewayRad)
                const z3d = z1

                // 3D perspective projection
                const scale = perspective / (perspective + z3d)
                const px = voidCx + x3d * scale
                const py = voidCy + y3d * scale

                // Render bounding clip optimization
                if (px < -30 || px > w + 30 || py < -30 || py > h + 30) continue

                // Size scaling based on size class (Small, Medium, Large, Hero)
                let scaleClass = 0.6
                if (pt.sizeClass === 2) scaleClass = 1.0
                if (pt.sizeClass === 3) scaleClass = 1.6
                if (pt.sizeClass === 4) scaleClass = 2.0 // Hero particles at 2x size
                const size = Math.max(0.3, particleSize * scale * scaleClass)

                // Proximity fade: fade out particles as they approach the event horizon (dissolves naturally)
                const proximityFade = pt.radius < voidRadius * 1.20
                    ? Math.max(0, (pt.radius - voidRadius) / (voidRadius * 0.20))
                    : 1.0

                // Gentle 0.8 -> 1.0 radial falloff, twinkling, and breathing factor
                const distRatio = Math.max(0, Math.min(1, (pt.radius - voidRadius) / (Math.max(1, outerRad - voidRadius))))
                const radialFade = 1.0 - distRatio * 0.2 // gentle fade to 0.8
                const twinkle = 1.0 + Math.sin(pt.twinklePhase) * 0.05
                const alpha = Math.max(
                    0.35,
                    (1 - ((z3d + outerRad) / (2 * outerRad)) * 0.45) * radialFade * twinkle * (pt.sizeClass === 4 ? 1.1 : 1.0) * breathe
                ) * proximityFade * 0.75 // individually reduce trail/particle brightness by 25%

                const color = colors[pt.colorIdx % colors.length]

                const projectedPt: ProjectedPt = {
                    x: px,
                    y: py,
                    size,
                    alpha,
                    z: z3d,
                    color,
                }

                if (z3d >= 0) {
                    backgroundParticles.push(projectedPt)
                } else {
                    foregroundParticles.push(projectedPt)
                }
            }

            // Sort arrays back-to-front (Z-Buffer)
            backgroundParticles.sort((a, b) => b.z - a.z)
            foregroundParticles.sort((a, b) => b.z - a.z)

            // ─── Step A: Draw Background Particles (Passing Behind Black Hole) ───
            for (let i = 0; i < backgroundParticles.length; i++) {
                const pt = backgroundParticles[i]
                ctx.globalAlpha = pt.alpha
                ctx.fillStyle = pt.color
                ctx.beginPath()
                ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.globalAlpha = 1.0

            // ─── Step B: Draw Center Gravity Void (Premium 3D Sphere & Glows) ───
            if (showCenter !== false) {
                // Robust color parser to apply radial opacity gradients safely (handles Hex, RGB, and RGBA)
                const hexToRgb = (colorStr: string) => {
                    let r = 0,
                        g = 0,
                        b = 0
                    if (!colorStr) return { r, g, b }

                    if (colorStr.startsWith("#")) {
                        const hex = colorStr.replace("#", "")
                        if (hex.length === 3) {
                            r = parseInt(hex[0] + hex[0], 16)
                            g = parseInt(hex[1] + hex[1], 16)
                            b = parseInt(hex[2] + hex[2], 16)
                        } else if (hex.length >= 6) {
                            r = parseInt(hex.substring(0, 2), 16)
                            g = parseInt(hex.substring(2, 4), 16)
                            b = parseInt(hex.substring(4, 6), 16)
                        }
                    } else if (colorStr.startsWith("rgb")) {
                        const match = colorStr.match(
                            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
                        )
                        if (match) {
                            r = parseInt(match[1])
                            g = parseInt(match[2])
                            b = parseInt(match[3])
                        }
                    }
                    return { r, g, b }
                }
                const voidRgb = hexToRgb(voidColor)

                // 1. Draw Volumetric Shadow (Perfect, Smooth Circle)
                const shadowGrad = ctx.createRadialGradient(
                    voidCx,
                    voidCy,
                    voidRadius * 0.95,
                    voidCx,
                    voidCy,
                    voidRadius * 1.80
                )
                shadowGrad.addColorStop(0, `rgba(0, 0, 0, 0.95)`) // matching page bg #000000
                shadowGrad.addColorStop(0.3, `rgba(0, 0, 0, 0.70)`)
                shadowGrad.addColorStop(0.7, `rgba(0, 0, 0, 0.20)`)
                shadowGrad.addColorStop(1, `rgba(0, 0, 0, 0)`)
                ctx.globalAlpha = 1.0
                ctx.fillStyle = shadowGrad
                ctx.beginPath()
                ctx.arc(voidCx, voidCy, voidRadius * 1.80, 0, Math.PI * 2)
                ctx.fill()

                // 2. Draw Event Horizon (Perfect, Smooth 3D Sphere Core)
                const sphereGrad = ctx.createRadialGradient(
                    voidCx - voidRadius * 0.25,
                    voidCy - voidRadius * 0.3,
                    voidRadius * 0.05,
                    voidCx,
                    voidCy,
                    voidRadius
                )
                const edgeR = Math.min(255, voidRgb.r + 18)
                const edgeG = Math.min(255, voidRgb.g + 18)
                const edgeB = Math.min(255, voidRgb.b + 18)
                sphereGrad.addColorStop(
                    0,
                    `rgba(${Math.min(255, voidRgb.r + 8)}, ${Math.min(255, voidRgb.g + 8)}, ${Math.min(255, voidRgb.b + 8)}, 1)`
                )
                sphereGrad.addColorStop(
                    0.65,
                    `rgba(${voidRgb.r}, ${voidRgb.g}, ${voidRgb.b}, 1)`
                )
                sphereGrad.addColorStop(
                    0.92,
                    `rgba(${edgeR}, ${edgeG}, ${edgeB}, 1)`
                )
                sphereGrad.addColorStop(
                    1,
                    `rgba(${edgeR}, ${edgeG}, ${edgeB}, 0.9)`
                )

                ctx.globalAlpha = 1.0
                ctx.fillStyle = sphereGrad
                ctx.beginPath()
                ctx.arc(voidCx, voidCy, voidRadius, 0, Math.PI * 2)
                ctx.fill()

                // 3. Draw Accretion Glows (Slightly Oblate Ellipse & Irregular paths)
                ctx.save()
                ctx.translate(voidCx, voidCy)
                ctx.scale(1.0, 0.86) // Flatten accretion glows vertically for spinning look

                // Helper to draw slightly irregular/perturbed paths
                const drawPerturbedArc = (rBase: number) => {
                    ctx.beginPath()
                    const steps = 72
                    for (let j = 0; j <= steps; j++) {
                        const a = (j / steps) * Math.PI * 2
                        const offset = (Math.sin(a * 5) * 0.012 + Math.cos(a * 3) * 0.008) * voidRadius
                        const r = rBase + offset
                        const x = Math.cos(a) * r
                        const y = Math.sin(a) * r
                        if (j === 0) ctx.moveTo(x, y)
                        else ctx.lineTo(x, y)
                    }
                    ctx.closePath()
                }

                // Layer 4: Faint gravitational lensing ring (Accretion glow)
                const lensingGrad = ctx.createRadialGradient(
                    0,
                    0,
                    voidRadius * 0.98,
                    0,
                    0,
                    voidRadius * 1.35
                )
                lensingGrad.addColorStop(0, `rgba(245, 201, 122, 0)`)
                lensingGrad.addColorStop(0.25, `rgba(245, 201, 122, 0.08)`)
                lensingGrad.addColorStop(0.55, `rgba(250, 245, 239, 0.13)`) // ivory tone
                lensingGrad.addColorStop(0.8, `rgba(245, 201, 122, 0.04)`)
                lensingGrad.addColorStop(1, `rgba(245, 201, 122, 0)`)
                ctx.fillStyle = lensingGrad
                drawPerturbedArc(voidRadius * 1.35)
                ctx.fill()

                // Layer 5: Relativistic Asymmetric rim light (highlight upper-right)
                const rimGrad = ctx.createRadialGradient(
                    -voidRadius * 0.12,
                    voidRadius * 0.12,
                    voidRadius * 0.80,
                    0,
                    0,
                    voidRadius * 1.03
                )
                rimGrad.addColorStop(0, `rgba(245, 201, 122, 0)`)
                rimGrad.addColorStop(0.6, `rgba(245, 201, 122, 0.08)`)
                rimGrad.addColorStop(0.85, `rgba(245, 201, 122, 0.20)`) // warm metal
                rimGrad.addColorStop(1, `rgba(245, 201, 122, 0)`)
                ctx.globalAlpha = 1.0
                ctx.fillStyle = rimGrad
                drawPerturbedArc(voidRadius * 1.03)
                ctx.fill()

                ctx.restore()
            }

            // ─── Step C: Draw Foreground Particles on separate transparent canvas ───
            for (let i = 0; i < foregroundParticles.length; i++) {
                const pt = foregroundParticles[i]
                fgCtx.globalAlpha = pt.alpha
                fgCtx.fillStyle = pt.color
                fgCtx.beginPath()
                fgCtx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
                fgCtx.fill()
            }
            fgCtx.globalAlpha = 1.0

            animRef.current = requestAnimationFrame(draw)
        }

        // Setup IntersectionObserver to halt/restart anim frame loop
        const container = containerRef.current
        let observer: IntersectionObserver | null = null

        if (container && typeof window !== "undefined" && "IntersectionObserver" in window) {
            observer = new IntersectionObserver(
                ([entry]) => {
                    const isVisible = entry.isIntersecting
                    const wasVisible = isVisibleRef.current
                    isVisibleRef.current = isVisible

                    if (isVisible && !wasVisible) {
                        lastTime = performance.now()
                        animRef.current = requestAnimationFrame(draw)
                    } else if (!isVisible && wasVisible) {
                        cancelAnimationFrame(animRef.current)
                    }
                },
                { threshold: 0.01 }
            )
            observer.observe(container)
        }

        if (isVisibleRef.current) {
            animRef.current = requestAnimationFrame(draw)
        }

        return () => {
            if (observer) observer.disconnect()
            cancelAnimationFrame(animRef.current)
        }
    }, [
        voidX,
        voidY,
        voidRadius,
        voidColor,
        showCenter,
        particleCount,
        particleSize,
        JSON.stringify(colors),
        outerRadFromSize,
        tilt,
        tiltSideway,
        trailAlpha,
        orbitSpeed,
        pullSpeed,
        perspective,
    ])

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                ...style,
                position: "relative",
                overflow: "hidden",
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                }}
            />
            <canvas
                ref={fgCanvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                }}
            />
        </div>
    )
}

// ─── Default Props ───────────────────────────────────────────

// ─── Property Controls ──────────────────────────────────────

const COMPONENT_DEFAULTS = {
    showCenter: DEFAULTS.showCenter,
    centre: {
        voidRadius: DEFAULT_CENTRE.voidRadius,
        voidX: DEFAULT_CENTRE.voidX,
        voidY: DEFAULT_CENTRE.voidY,
    },
    colors: DEFAULTS.colors,
    outerRadius: DEFAULTS.outerRadius,
    particleCount: DEFAULTS.particleCount,
    particleSize: DEFAULTS.particleSize,
    orbitSpeed: DEFAULTS.orbitSpeed,
    trail: DEFAULTS.trail,
    tilt: DEFAULTS.tilt,
    tiltSideway: DEFAULTS.tiltSideway,
    pullSpeed: DEFAULTS.pullSpeed,
}
