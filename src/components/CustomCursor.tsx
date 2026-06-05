import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHidden, setIsHidden] = useState(true);

  // Position of cursor (no delay)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth position tracking
  const springConfig = { damping: 30, stiffness: 350, mass: 0.3 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hide custom cursor on mobile / touch devices
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) {
      return;
    }

    setIsHidden(false);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea');

      if (isInteractive) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev, newRipple]);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY]);

  // requestAnimationFrame loop to update particles and spawn new ones from the glassy cursor dot's position
  useEffect(() => {
    if (isHidden) return;

    let animId: number;
    let lastX = smoothX.get();
    let lastY = smoothY.get();

    const tick = () => {
      const currentX = smoothX.get();
      const currentY = smoothY.get();

      // Calculate distance moved by the glassy cursor dot in this frame
      const dx = currentX - lastX;
      const dy = currentY - lastY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If the glassy dot has moved, spawn stardust particles from its center
      if (distance > 0.5) {
        const colors = ['#c084fc', '#a78bfa', '#8b5cf6', '#e9d5ff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.4 + 0.1;

        const newParticle: Particle = {
          id: Math.random() + Date.now(),
          x: currentX,
          y: currentY,
          vx: Math.cos(angle) * speed - dx * 0.08, // oppose movement direction for trailing effect
          vy: Math.sin(angle) * speed - dy * 0.08 + 0.15, // slight downward drift
          size: Math.random() * 2.5 + 1.5, // 1.5px to 4.0px
          opacity: 0.8, // softer starting opacity
          color: randomColor,
        };

        setParticles((prev) => [...prev.slice(-40), newParticle]);
      }

      // Update existing particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            opacity: p.opacity - 0.02, // slower fade for smoother trails
            size: Math.max(0, p.size - 0.04), // slower shrink
          }))
          .filter((p) => p.opacity > 0 && p.size > 0)
      );

      lastX = currentX;
      lastY = currentY;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isHidden, smoothX, smoothY]);

  if (isHidden) return null;

  return (
    <>
      {/* CSS to hide the default browser cursor globally on desktop */}
      <style>{`
        @media (pointer: fine) {
          body, button, a, [role="button"], input, select, textarea {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Star Dust Trail Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed pointer-events-none rounded-full z-[9997]"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 6px ${p.color}`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* Main Glassmorphic Purple Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'rgba(167, 139, 250, 0.25)',
          border: '1.5px solid rgba(167, 139, 250, 0.5)',
          backdropFilter: isHovered ? 'none' : 'blur(3px)',
          WebkitBackdropFilter: isHovered ? 'none' : 'blur(3px)',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
        }}
        animate={{
          scale: isClicked ? 0.75 : isHovered ? 4 : 1,
          background: isClicked
            ? 'rgba(167, 139, 250, 0.4)'
            : isHovered
            ? 'rgba(167, 139, 250, 0)'
            : 'rgba(167, 139, 250, 0.25)',
          borderColor: isClicked
            ? 'rgba(192, 132, 252, 0.8)'
            : isHovered
            ? 'rgba(167, 139, 250, 0.6)'
            : 'rgba(167, 139, 250, 0.5)',
          boxShadow: isClicked
            ? '0 0 18px rgba(139, 92, 246, 0.8)'
            : isHovered
            ? '0 0 14px rgba(139, 92, 246, 0.3)'
            : '0 0 10px rgba(139, 92, 246, 0.4)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      />

      {/* Click Shockwave Ripples (Purple themed) */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9998]"
          style={{
            x: ripple.x,
            y: ripple.y,
            translateX: '-50%',
            translateY: '-50%',
            border: '2px solid rgba(167, 139, 250, 0.6)',
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.6)',
          }}
          initial={{ scale: 0.2, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          onAnimationComplete={() => {
            setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
          }}
        />
      ))}
    </>
  );
}
