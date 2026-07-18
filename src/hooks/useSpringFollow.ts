"use client";

import { useEffect, useRef, useState } from 'react';

export interface SpringState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

const STIFFNESS = 0.11;
const DAMPING = 0.72;

export function useSpringFollow(): SpringState {
  // SSR safe initialization values
  const getInitialValue = (axis: 'x' | 'y') => {
    if (typeof window !== 'undefined') {
      return axis === 'x' ? window.innerWidth / 2 : window.innerHeight / 2;
    }
    return 0;
  };

  const mouse = useRef({ x: getInitialValue('x'), y: getInitialValue('y') });
  const pos = useRef({ x: getInitialValue('x'), y: getInitialValue('y') });
  const vel = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);
  
  const [state, setState] = useState<SpringState>({
    x: getInitialValue('x'),
    y: getInitialValue('y'),
    vx: 0,
    vy: 0,
    speed: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      const dx = mouse.current.x - pos.current.x;
      const dy = mouse.current.y - pos.current.y;

      vel.current.x += dx * STIFFNESS;
      vel.current.y += dy * STIFFNESS;
      vel.current.x *= DAMPING;
      vel.current.y *= DAMPING;

      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      const speed = Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2);

      setState({
        x: pos.current.x,
        y: pos.current.y,
        vx: vel.current.x,
        vy: vel.current.y,
        speed,
      });

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return state;
}
