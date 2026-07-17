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
      const rootStyle = getComputedStyle(document.documentElement);
      setColors({
        primary: rootStyle.getPropertyValue("--accent-primary").trim() || "#D8B15B",
        secondary: rootStyle.getPropertyValue("--accent-secondary").trim() || "#F0C979",
        glow: rootStyle.getPropertyValue("--accent-glow").trim() || "rgba(216, 177, 91, 0.35)",
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
