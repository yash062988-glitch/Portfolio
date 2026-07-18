"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";

function buildGroups(text) {
    const lines = text.split("\n");
    const groups = [];
    let globalIdx = 0,
        gi = 0;
    lines.forEach((line, lineIdx) => {
        let posInLine = 0;
        (line.match(/\S+|\s+/g) ?? []).forEach((seg) => {
            groups.push({
                type: /^\s/.test(seg) ? "space" : "word",
                chars: seg.split("").map((c) => ({
                    char: c,
                    globalIdx: globalIdx++,
                    posInLine: posInLine++,
                    lineIdx,
                })),
                lineIdx,
                gi: gi++,
            });
        });
        if (lineIdx < lines.length - 1)
            groups.push({ type: "newline", chars: [], lineIdx, gi: gi++ });
    });
    return { groups, totalVisible: globalIdx };
}

function rawDelay(c, total, pos, mode, vli) {
    const S = 0.055;
    if (mode === "multiLine" && vli) {
        const p = vli.charVLPos.get(c.globalIdx) ?? 0;
        return p * S;
    }
    return c.globalIdx * S;
}

function rawAppearDelay(c, total, pos, mode, vli, maxRaw) {
    return rawDelay(c, total, pos, mode, vli);
}

function scaledTiming(rawD, maxRaw, duration) {
    if (maxRaw <= 0) return { delay: 0, charDur: duration };
    return {
        charDur: duration * 0.5,
        delay: (rawD * (duration * 0.5)) / maxRaw,
    };
}

function getAppear(c, total, pos, mode, vli) {
    const e = c.globalIdx % 2 === 0;
    if (mode === "inPlace") return e ? "smt-ap-c-a" : "smt-ap-c-b";
    if (pos === "topLeft") return e ? "smt-ap-tl-a" : "smt-ap-tl-b";
    return e ? "smt-ap-bl-a" : "smt-ap-bl-b";
}

function parseT(t, def) {
    const EASES = {
        linear: "linear",
        easeIn: "cubic-bezier(0.42,0,1,1)",
        easeOut: "cubic-bezier(0,0,0.58,1)",
        easeInOut: "cubic-bezier(0.42,0,0.58,1)",
    };
    if (!t)
        return {
            duration: def.duration,
            delay: def.delay,
            timing: "cubic-bezier(0,0,0.58,1)",
        };
    if (t.type === "spring")
        return {
            duration: 1.5,
            delay: t.delay ?? def.delay,
            timing: "cubic-bezier(0.175,0.885,0.32,1.275)",
        };
    return {
        duration: typeof t.duration === "number" ? t.duration : def.duration,
        delay: typeof t.delay === "number" ? t.delay : def.delay,
        timing: Array.isArray(t.ease)
            ? `cubic-bezier(${t.ease.map((v) => +v.toFixed(4)).join(",")})`
            : (EASES[String(t.ease)] ?? "cubic-bezier(0,0,0.58,1)"),
    };
}

function buildKF(color, intensity) {
    const n = (Math.max(1, Math.min(20, intensity)) - 1) / 19;
    const r = (v) => +v.toFixed(2);

    const peakB = Math.round(n * 200);
    const initB = Math.round(n * 70);

    const layers = 1 + Math.round(n * 3);
    const stack = (blur) => {
        if (blur <= 0) return `0 0 0px ${color}`;
        return Array.from(
            { length: layers },
            (_, i) => `0 0 ${Math.round((blur * (i + 1)) / layers)}px ${color}`
        ).join(",");
    };
    const peak = stack(peakB);
    const init = stack(initB);

    const d = 0.7 + n * 0.8;
    const ic = r(1.08 + n * 0.72);
    const ic2 = r(1.04 + n * 0.46);

    return `
@keyframes smt-ap-c-a{from{opacity:0;text-shadow:${init};transform:scale(${ic})}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0px ${color};transform:none}}
@keyframes smt-ap-c-b{from{opacity:0;text-shadow:${init};transform:scale(${ic2})}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0px ${color};transform:none}}
@keyframes smt-ap-bl-a{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-15 * d)}rem,${r(8 * d)}rem,0) rotate(40deg) skewX(-70deg) scale(0.7)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0px ${color};transform:none}}
@keyframes smt-ap-bl-b{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-18 * d)}rem,${r(8 * d)}rem,0) rotate(40deg) skewX(70deg) scale(0.5)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0px ${color};transform:none}}
@keyframes smt-ap-tl-a{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-15 * d)}rem,${r(-8 * d)}rem,0) rotate(-40deg) skewX(70deg) scale(0.7)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0px ${color};transform:none}}
@keyframes smt-ap-tl-b{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-18 * d)}rem,${r(-8 * d)}rem,0) rotate(-40deg) skewX(-70deg) scale(0.5)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0px ${color};transform:none}}
`;
}

export default function SmokyText({
    text = "SMOKY\nTEXT",
    font = {},
    color = "whitesmoke",
    appearTrigger = "default",
    scrollConfig = {},
    appearTransition = undefined,
    intensity = 1,
    position = "bottomLeft",
    animationMode = "singleLine",
    onAnimationEnd = null,
    className = ""
}) {
    const kfEl = useRef(null);
    const containerRef = useRef(null);
    const wordRefs = useRef(new Map());
    const [resolvedColor, setResolvedColor] = useState(color || "whitesmoke");

    useEffect(() => {
        kfEl.current = document.createElement("style");
        document.head.appendChild(kfEl.current);
        return () => {
            if (kfEl.current) kfEl.current.remove();
            kfEl.current = null;
        };
    }, []);
    
    useEffect(() => {
        if (!containerRef.current) return;
        
        let cVal = color || "whitesmoke";
        if (cVal.startsWith("var(")) {
          const varName = cVal.slice(4, -1).trim();
          const root = document.documentElement;
          const rawVal = root.style.getPropertyValue(varName);
          cVal = (rawVal ? rawVal.trim() : getComputedStyle(root).getPropertyValue(varName).trim()) || "#e9b15d";
        } else {
          // Resolve actual text color dynamically from computed CSS style classes (like text-white / text-primary)
          const computedColor = window.getComputedStyle(containerRef.current).color;
          if (computedColor) cVal = computedColor;
        }
        setResolvedColor(cVal);
    }, [color, className]);

    useEffect(() => {
        if (kfEl.current) kfEl.current.textContent = buildKF(resolvedColor, intensity);
    }, [resolvedColor, intensity]);

    const { groups, totalVisible } = useMemo(() => buildGroups(text), [text]);
    const appearT = useMemo(
        () => parseT(appearTransition, { duration: 2, delay: 0 }),
        [JSON.stringify(appearTransition)]
    );

    const [vli, setVli] = useState(null);

    const measureVL = useCallback(() => {
        if (animationMode !== "multiLine") {
            setVli(null);
            return;
        }
        const items = [];
        groups.forEach((g) => {
            if (g.type === "newline" || !g.chars.length) return;
            const el = wordRefs.current.get(g.gi);
            if (el) items.push({ top: el.offsetTop, gi: g.gi, chars: g.chars });
        });
        items.sort((a, b) => a.gi - b.gi);
        const tops = [...new Set(items.map((i) => i.top))].sort((a, b) => a - b);
        const topToVL = new Map(tops.map((t, i) => [t, i]));
        const charVL = new Map(),
            charVLPos = new Map();
        const vlLen = new Map(),
            vlPos = new Map();
        items.forEach(({ top, chars }) => {
            const vl = topToVL.get(top) ?? 0;
            chars.forEach((c) => {
                const p = vlPos.get(vl) ?? 0;
                charVL.set(c.globalIdx, vl);
                charVLPos.set(c.globalIdx, p);
                vlPos.set(vl, p + 1);
                vlLen.set(vl, p + 1);
            });
        });
        setVli({ charVL, charVLPos, vlLen });
    }, [groups, animationMode]);

    useEffect(() => {
        measureVL();
        if (!containerRef.current) return;
        const ro = new ResizeObserver(measureVL);
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [measureVL]);

    const maxRaw = useMemo(() => {
        let m = 0;
        groups.forEach((g) =>
            g.chars.forEach((c) => {
                const d = rawDelay(c, totalVisible, position, animationMode, vli);
                if (d > m) m = d;
            })
        );
        return m;
    }, [groups, totalVisible, position, animationMode, vli]);

    const [phase, setPhase] = useState("hidden");
    const tRef = useRef([]);
    const clear = () => {
        tRef.current.forEach(clearTimeout);
        tRef.current = [];
    };
    
    const later = (fn, ms) => tRef.current.push(setTimeout(fn, ms));

    const apRef = useRef(appearT);
    apRef.current = appearT;
    const hoverFiredRef = useRef(false);
    const scrollPos = (scrollConfig?.position ?? "bottom");
    const scrollDist = Math.max(0, Math.min(100, scrollConfig?.distance ?? 20));

    const runAppear = useCallback(() => {
        clear();
        const ap = apRef.current;
        setPhase("hidden");
        later(
            () => {
                setPhase("appearing");
                later(() => {
                    setPhase("visible");
                    if (onAnimationEnd) {
                        onAnimationEnd();
                    }
                }, ap.duration * 1000 + 200);
            },
            Math.max(ap.delay * 1000, 80)
        );
    }, [onAnimationEnd]);

    useEffect(() => {
        clear();
        if (appearTrigger === "default") {
            runAppear();
            return clear;
        }
        hoverFiredRef.current = false;
        setPhase("hidden");
        if (appearTrigger === "scroll") {
            const el = containerRef.current;
            if (!el) return clear;
            const check = () => {
                const vh = window.innerHeight || document.documentElement.clientHeight;
                const rect = el.getBoundingClientRect();
                if (scrollPos === "top") {
                    return rect.top <= vh * (scrollDist / 100);
                }
                return rect.bottom <= vh * (1 - scrollDist / 100);
            };
            if (check()) {
                runAppear();
                return clear;
            }
            const onScroll = () => {
                if (check()) {
                    runAppear();
                    window.removeEventListener("scroll", onScroll, true);
                    window.removeEventListener("resize", onScroll);
                }
            };
            window.addEventListener("scroll", onScroll, true);
            window.addEventListener("resize", onScroll);
            return () => {
                window.removeEventListener("scroll", onScroll, true);
                window.removeEventListener("resize", onScroll);
                clear();
            };
        }
        return clear;
    }, [text, color, intensity, position, animationMode, appearTrigger, scrollPos, scrollDist, JSON.stringify(appearT), runAppear]);

    const fontAny = font;
    const textAlign = (fontAny?.textAlign ?? "center");
    const justify = textAlign === "right" ? "flex-end" : textAlign === "center" ? "center" : "flex-start";

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => {
                if (appearTrigger === "hover" && !hoverFiredRef.current) {
                    hoverFiredRef.current = true;
                    runAppear();
                }
            }}
            style={{
                position: "relative",
                display: "inline-block",
                width: "fit-content",
                maxWidth: "100%",
                userSelect: "none"
            }}
        >
            <div
                className={className}
                style={{
                    ...fontAny,
                    color: "transparent",
                    backfaceVisibility: "hidden",
                    userSelect: "none",
                    textAlign: textAlign,
                    wordBreak: "keep-all",
                    overflowWrap: "normal",
                }}
            >
                {groups.map((group) => {
                    if (group.type === "newline") return <br key={group.gi} />;
                    if (group.type === "space")
                        return (
                            <span
                                key={group.gi}
                                ref={(el) => {
                                    if (el) wordRefs.current.set(group.gi, el);
                                }}
                                style={{ display: "inline", whiteSpace: "pre" }}
                            >
                                {" "}
                            </span>
                        );

                    return (
                        <span
                            key={group.gi}
                            ref={(el) => {
                                if (el) wordRefs.current.set(group.gi, el);
                            }}
                            style={{
                                display: "inline-block",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {group.chars.map((c) => {
                                const base = {
                                    display: "inline-block",
                                    textShadow: `0 0 0 ${color}`,
                                };

                                if (phase === "hidden")
                                    return (
                                        <span
                                            key={c.globalIdx}
                                            style={{ ...base, opacity: 0 }}
                                        >
                                            {c.char}
                                        </span>
                                    );

                                if (phase === "visible")
                                    return (
                                        <span
                                            key={c.globalIdx}
                                            style={{ ...base, opacity: 1 }}
                                        >
                                            {c.char}
                                        </span>
                                    );

                                if (phase === "appearing") {
                                    const rd = rawAppearDelay(c, totalVisible, position, animationMode, vli, maxRaw);
                                    const { delay, charDur } = scaledTiming(rd, maxRaw, appearT.duration);
                                    const anim = getAppear(c, totalVisible, position, animationMode, vli);
                                    return (
                                        <span
                                            key={c.globalIdx}
                                            style={{
                                                ...base,
                                                animation: `${anim} ${charDur}s ${delay}s ${appearT.timing} both`,
                                            }}
                                        >
                                            {c.char}
                                        </span>
                                    );
                                }

                                return null;
                            })}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
