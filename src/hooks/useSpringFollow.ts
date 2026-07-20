"use client";

import { useEffect, useRef, useState } from 'react';

export interface SpringState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  isHoveringInteractive: boolean;
  isDockedToNavbar: boolean;
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
  const isHoveringInteractive = useRef(false);
  const isInSkills = useRef(false);
  const isInContact = useRef(false);
  const isModalOpen = useRef(false);
  
  const [state, setState] = useState<SpringState>({
    x: getInitialValue('x'),
    y: getInitialValue('y'),
    vx: 0,
    vy: 0,
    speed: 0,
    isHoveringInteractive: false,
    isDockedToNavbar: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSectionsAndModals = () => {
      const skillsEl = document.getElementById("skills");
      if (skillsEl) {
        const rect = skillsEl.getBoundingClientRect();
        isInSkills.current = rect.top <= window.innerHeight * 0.7 && rect.bottom >= window.innerHeight * 0.25;
      } else {
        isInSkills.current = false;
      }

      const contactEl = document.getElementById("contact");
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        isInContact.current = rect.top <= window.innerHeight * 0.75 && rect.bottom >= window.innerHeight * 0.2;
      } else {
        isInContact.current = false;
      }

      const modalEl = document.querySelector('[role="dialog"], .modal-backdrop, .fixed.inset-0.z-50');
      isModalOpen.current = !!modalEl;
    };

    window.addEventListener("scroll", checkSectionsAndModals, { passive: true });
    window.addEventListener("resize", checkSectionsAndModals, { passive: true });
    checkSectionsAndModals();

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      checkSectionsAndModals();

      let target = e.target as Element | null;
      let interactive = false;
      while (target && target !== document.body) {
        const tagName = target.tagName.toLowerCase();
        if (['button', 'a', 'input', 'select', 'textarea', 'option'].includes(tagName)) {
          interactive = true;
          break;
        }
        const role = target.getAttribute('role');
        if (role === 'button' || role === 'link' || role === 'checkbox' || role === 'tab') {
          interactive = true;
          break;
        }
        if (target.classList && (
          target.classList.contains('cursor-pointer') ||
          target.classList.contains('interactive')
        )) {
          interactive = true;
          break;
        }
        try {
          const style = window.getComputedStyle(target);
          if (style.cursor === 'pointer') {
            interactive = true;
            break;
          }
        } catch (err) {}
        target = target.parentElement;
      }
      isHoveringInteractive.current = interactive;
    };
    window.addEventListener('mousemove', onMove);

    const tick = () => {
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;

      const shouldDockToNavbar = isInSkills.current || isModalOpen.current;

      if (shouldDockToNavbar) {
        // Lock UFO Y coordinate to top navbar level (38px) when in Skills or Modal view
        targetY = 38;
        const minX = Math.max(120, window.innerWidth * 0.15);
        const maxX = Math.min(window.innerWidth - 120, window.innerWidth * 0.85);
        targetX = Math.max(minX, Math.min(maxX, mouse.current.x));
      } else if (isHoveringInteractive.current) {
        // Offset UFO away from cursor so it never sits directly under cursor point
        targetX = mouse.current.x + 40;
        targetY = mouse.current.y - 40;
      }

      const dx = targetX - pos.current.x;
      const dy = targetY - pos.current.y;

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
        isHoveringInteractive: isHoveringInteractive.current,
        isDockedToNavbar: shouldDockToNavbar,
      });

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', checkSectionsAndModals);
      window.removeEventListener('resize', checkSectionsAndModals);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return state;
}
