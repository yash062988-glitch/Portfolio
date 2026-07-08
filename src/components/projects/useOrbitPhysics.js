import { useCallback } from "react";

export default function useOrbitPhysics({
  angleRef,
  velocityRef,
  targetVelocityRef,
  dragVelocityRef,
  isDraggingRef,
  startXRef,
  startYRef,
  startAngleRef,
  lastXRef,
  lastTimeRef,
  hasDraggedRef,
  dimensions,
  selectedProject
}) {
  const handlePointerDown = useCallback((e) => {
    if (e.target.closest(".action-btn") || selectedProject) return;

    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startAngleRef.current = angleRef.current;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
    velocityRef.current = 0;
    hasDraggedRef.current = false;
  }, [selectedProject, angleRef, velocityRef, targetVelocityRef, dragVelocityRef, isDraggingRef, startXRef, startYRef, startAngleRef, lastXRef, lastTimeRef, hasDraggedRef]);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const currentTime = performance.now();
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

    if (dist > 8) {
      hasDraggedRef.current = true;
    }

    if (!hasDraggedRef.current) {
      lastXRef.current = currentX;
      lastTimeRef.current = currentTime;
      return;
    }

    const scaleFactor = dimensions.width < 768 ? 1.4 : 1.0;
    const pxDelta = currentX - lastXRef.current;
    const angleChange = (pxDelta / dimensions.width) * 180 * scaleFactor;

    angleRef.current += angleChange;

    const timeDelta = currentTime - lastTimeRef.current;
    if (timeDelta > 0) {
      dragVelocityRef.current = (pxDelta / dimensions.width) * 180 * (16.666 / timeDelta);
    }

    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
  }, [dimensions, angleRef, isDraggingRef, startXRef, startYRef, startAngleRef, lastXRef, lastTimeRef, hasDraggedRef, dragVelocityRef, velocityRef]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (hasDraggedRef.current) {
      velocityRef.current = dragVelocityRef.current;
    } else {
      velocityRef.current = targetVelocityRef.current;
    }
  }, [isDraggingRef, hasDraggedRef, velocityRef, dragVelocityRef, targetVelocityRef]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
