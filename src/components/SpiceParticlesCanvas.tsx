import React, { useEffect, useRef } from 'react';

interface SpiceParticlesCanvasProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

const SPICE_PALETTE = [
  '#D49B28', // Turmeric Gold
  '#C0392B', // Byadgi Chilli Crimson
  '#993300', // Terracotta Spice
  '#E67E22', // Roasted Paprika
  '#2E7D32', // Curry Leaf Emerald
  '#C5A059', // Heritage Brass Warmth
];

export const SpiceParticlesCanvas: React.FC<SpiceParticlesCanvasProps> = ({
  className = '',
  particleCount = 35,
  interactive = true,
  opacity = 0.7
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Adjust particle count for mobile screens
    const actualCount = width < 640 ? Math.floor(particleCount * 0.5) : particleCount;

    const particles: Particle[] = [];
    for (let i = 0; i < actualCount; i++) {
      const baseAlpha = 0.25 + Math.random() * 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.4, // gentle upward floating like spice aroma
        size: 1.5 + Math.random() * 2.8,
        color: SPICE_PALETTE[Math.floor(Math.random() * SPICE_PALETTE.length)],
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Mouse tracking for gentle vortex repulsion
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvas || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
        active: true
      };
    };

    const parent = canvas.parentElement;
    if (interactive && parent) {
      parent.addEventListener('mousemove', handleMouseMove, { passive: true });
      parent.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      parent.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    // Pause loop when out of viewport for maximum battery & performance
    const observer = new IntersectionObserver(
      entries => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let time = 0;
    const render = () => {
      if (isVisibleRef.current && ctx) {
        ctx.clearRect(0, 0, width, height);
        time += 0.03;

        const mouse = mouseRef.current;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Gentle sine-wave pulse in opacity for aroma effect
          p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.15;

          // Mouse vortex interaction
          if (interactive && mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 120;
            if (dist < maxDist && dist > 0) {
              const force = (1 - dist / maxDist) * 1.5;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          p.x += p.vx + Math.sin(time + p.pulseOffset) * 0.2;
          p.y += p.vy;

          // Wrap-around screen bounds
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.y > height + 10) p.y = -10;

          // Draw soft glowing circular spice particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.05, Math.min(1, p.alpha * opacity));
          ctx.shadowBlur = p.size * 2;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
        parent.removeEventListener('touchmove', handleTouchMove);
      }
      observer.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [particleCount, interactive, opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
    />
  );
};
