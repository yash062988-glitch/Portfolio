import { useRef, useState, useCallback } from "react";

export default function useCardHover() {
  const [isHovered, setIsHovered] = useState(false);
  const hoverProgressRef = useRef(0); // 0: standard, 1: hovered lift

  const onPointerOver = useCallback((e) => {
    e.stopPropagation();
    setIsHovered(true);
  }, []);

  const onPointerOut = useCallback((e) => {
    e.stopPropagation();
    setIsHovered(false);
  }, []);

  const updateHoverProgress = (dt) => {
    const target = isHovered ? 1 : 0;
    // Smooth interpolation with time-delta scaling
    hoverProgressRef.current += (target - hoverProgressRef.current) * (1 - Math.exp(-0.2 * dt));
    return hoverProgressRef.current;
  };

  return {
    isHovered,
    hoverProgressRef,
    onPointerOver,
    onPointerOut,
    updateHoverProgress
  };
}
