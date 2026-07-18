"use client";

import { useState, useEffect } from "react";

export function useAccentColors() {
  const [colors, setColors] = useState({
    primary: "#D8B15B",
    secondary: "#F0C979",
    glow: "rgba(216, 177, 91, 0.35)",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateColors = () => {
      const root = document.documentElement;
      const getThemeColor = (varName, fallback) => {
        let val = root.style.getPropertyValue(varName);
        if (!val) {
          val = getComputedStyle(root).getPropertyValue(varName);
        }
        return val.trim() || fallback;
      };

      setColors({
        primary: getThemeColor("--accent-primary", "#D8B15B"),
        secondary: getThemeColor("--accent-secondary", "#F0C979"),
        glow: getThemeColor("--accent-glow", "rgba(216, 177, 91, 0.35)"),
      });
    };

    updateColors();

    // Observe changes to the documentElement's style attribute (where theme variables are written)
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    return () => observer.disconnect();
  }, []);

  return colors;
}
