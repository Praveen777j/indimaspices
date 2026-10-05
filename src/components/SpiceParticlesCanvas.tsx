import React, { useEffect, useRef } from 'react';

interface SpiceParticlesCanvasProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
  opacity?: number;
  showWholeSpices?: boolean;
  wholeSpiceCount?: number;
  activeStageId?: string;
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

type WholeSpiceType = 'chilli' | 'coriander' | 'turmeric' | 'cumin' | 'pepper' | 'clove';

interface WholeSpiceItem {
  type: WholeSpiceType;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  z: number; // 0.4 to 1.5 depth scale
  rotation: number;
  rotSpeed: number;
  scale: number;
  vx: number;
  vy: number;
  floatPhase: number;
  floatSpeed: number;
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
  opacity = 0.7,
  showWholeSpices = true,
  wholeSpiceCount = 12,
  activeStageId = 'sourcing'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; targetX: number; targetY: number }>({
    x: -1000,
    y: -1000,
    targetX: 0,
    targetY: 0,
    active: false
  });
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Adjust particle counts based on viewport
    const actualParticleCount = width < 640 ? Math.floor(particleCount * 0.4) : particleCount;
    const actualWholeCount = width < 640 ? Math.min(6, wholeSpiceCount) : wholeSpiceCount;

    // Build glowing aroma particles
    const particles: Particle[] = [];
    for (let i = 0; i < actualParticleCount; i++) {
      const baseAlpha = 0.2 + Math.random() * 0.4;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.35,
        size: 1.5 + Math.random() * 2.5,
        color: SPICE_PALETTE[Math.floor(Math.random() * SPICE_PALETTE.length)],
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // Build floating whole spices
    const spiceTypes: WholeSpiceType[] = ['chilli', 'coriander', 'turmeric', 'cumin', 'pepper', 'clove'];
    const wholeSpices: WholeSpiceItem[] = [];

    if (showWholeSpices && !prefersReducedMotion) {
      for (let i = 0; i < actualWholeCount; i++) {
        const type = spiceTypes[i % spiceTypes.length];
        const x = (width * (i + 0.5)) / actualWholeCount + (Math.random() - 0.5) * 60;
        const y = 80 + Math.random() * (height - 160);
        const z = 0.5 + Math.random() * 0.7; // depth
        wholeSpices.push({
          type,
          x,
          y,
          baseX: x,
          baseY: y,
          z,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.008,
          scale: (0.7 + Math.random() * 0.5) * z,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          floatPhase: Math.random() * Math.PI * 2,
          floatSpeed: 0.015 + Math.random() * 0.02
        });
      }
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Track mouse / cursor parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;
      mouseRef.current.targetX = (clientX - width / 2) / (width / 2);
      mouseRef.current.targetY = (clientY - height / 2) / (height / 2);
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvas || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches[0].clientX - rect.left;
      const clientY = e.touches[0].clientY - rect.top;
      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;
      mouseRef.current.targetX = (clientX - width / 2) / (width / 2);
      mouseRef.current.targetY = (clientY - height / 2) / (height / 2);
      mouseRef.current.active = true;
    };

    const parent = canvas.parentElement;
    if (interactive && parent) {
      parent.addEventListener('mousemove', handleMouseMove, { passive: true });
      parent.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      parent.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    const observer = new IntersectionObserver(
      entries => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Procedural Spice Render Functions
    const drawChilli = (c: CanvasRenderingContext2D, scale: number) => {
      c.save();
      c.scale(scale, scale);
      // Dried Byadgi Chilli curved body
      c.beginPath();
      c.moveTo(-35, 12);
      c.bezierCurveTo(-15, -12, 10, -18, 38, -6);
      c.bezierCurveTo(45, -3, 48, 2, 40, 6);
      c.bezierCurveTo(20, 14, -5, 18, -35, 12);
      c.closePath();

      // Rich Crimson gradient
      const grad = c.createLinearGradient(-35, 0, 45, 0);
      grad.addColorStop(0, '#781508');
      grad.addColorStop(0.35, '#A82313');
      grad.addColorStop(0.7, '#C5301E');
      grad.addColorStop(1, '#8B170B');
      c.fillStyle = grad;
      c.fill();

      // Stem (stalk)
      c.beginPath();
      c.moveTo(-35, 12);
      c.quadraticCurveTo(-45, 18, -50, 28);
      c.strokeStyle = '#43582D';
      c.lineWidth = 2.4;
      c.stroke();

      // Natural wrinkled skin highlights
      c.beginPath();
      c.moveTo(-15, -4);
      c.quadraticCurveTo(5, -6, 25, 0);
      c.strokeStyle = 'rgba(255, 180, 160, 0.35)';
      c.lineWidth = 1.2;
      c.stroke();

      c.restore();
    };

    const drawTurmeric = (c: CanvasRenderingContext2D, scale: number) => {
      c.save();
      c.scale(scale, scale);
      // Knobby turmeric finger
      c.beginPath();
      c.moveTo(-25, 0);
      c.bezierCurveTo(-20, -14, -6, -16, 10, -10);
      c.bezierCurveTo(22, -6, 28, 4, 24, 12);
      c.bezierCurveTo(14, 18, -10, 16, -25, 0);
      c.closePath();

      const grad = c.createRadialGradient(-5, 0, 4, 0, 0, 26);
      grad.addColorStop(0, '#E5A93C');
      grad.addColorStop(0.6, '#C9851F');
      grad.addColorStop(1, '#8B5410');
      c.fillStyle = grad;
      c.fill();

      // Root rings / ridges
      c.strokeStyle = 'rgba(80, 45, 10, 0.4)';
      c.lineWidth = 1.2;
      [-10, 0, 12].forEach(rx => {
        c.beginPath();
        c.arc(rx, 2, 8, -Math.PI / 3, Math.PI / 3);
        c.stroke();
      });

      c.restore();
    };

    const drawCoriander = (c: CanvasRenderingContext2D, scale: number) => {
      c.save();
      c.scale(scale, scale);
      // Spherical coriander seed
      c.beginPath();
      c.arc(0, 0, 11, 0, Math.PI * 2);
      const grad = c.createRadialGradient(-3, -3, 2, 0, 0, 12);
      grad.addColorStop(0, '#E2C286');
      grad.addColorStop(0.5, '#C6A15E');
      grad.addColorStop(1, '#8C6C32');
      c.fillStyle = grad;
      c.fill();

      // Distinct longitudinal ridges
      c.strokeStyle = 'rgba(90, 65, 25, 0.45)';
      c.lineWidth = 0.9;
      for (let a = -8; a <= 8; a += 4) {
        c.beginPath();
        c.ellipse(0, 0, Math.abs(a), 11, 0, 0, Math.PI * 2);
        c.stroke();
      }
      c.restore();
    };

    const drawCumin = (c: CanvasRenderingContext2D, scale: number) => {
      c.save();
      c.scale(scale, scale);
      // Slender jeera seed
      c.beginPath();
      c.moveTo(-16, 0);
      c.quadraticCurveTo(0, -5, 16, 0);
      c.quadraticCurveTo(0, 5, -16, 0);
      c.closePath();

      const grad = c.createLinearGradient(-16, 0, 16, 0);
      grad.addColorStop(0, '#6A4423');
      grad.addColorStop(0.5, '#8D5B2F');
      grad.addColorStop(1, '#533418');
      c.fillStyle = grad;
      c.fill();

      // Seed ribs
      c.strokeStyle = 'rgba(230, 200, 150, 0.35)';
      c.lineWidth = 0.7;
      c.beginPath();
      c.moveTo(-12, 0);
      c.lineTo(12, 0);
      c.stroke();
      c.restore();
    };

    const drawPepper = (c: CanvasRenderingContext2D, scale: number) => {
      c.save();
      c.scale(scale, scale);
      c.beginPath();
      c.arc(0, 0, 8.5, 0, Math.PI * 2);
      const grad = c.createRadialGradient(-2, -2, 1, 0, 0, 9);
      grad.addColorStop(0, '#423D3A');
      grad.addColorStop(0.5, '#262220');
      grad.addColorStop(1, '#110F0E');
      c.fillStyle = grad;
      c.fill();

      // Textured wrinkles
      c.fillStyle = 'rgba(255, 255, 255, 0.12)';
      c.beginPath();
      c.arc(-2, -2, 2.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    const drawClove = (c: CanvasRenderingContext2D, scale: number) => {
      c.save();
      c.scale(scale, scale);
      // Stem
      c.beginPath();
      c.rect(-2.5, -4, 5, 16);
      c.fillStyle = '#422415';
      c.fill();

      // Rounded aromatic head
      c.beginPath();
      c.arc(0, -6, 5, 0, Math.PI * 2);
      c.fillStyle = '#6E3A20';
      c.fill();

      // Crown petals
      c.beginPath();
      c.arc(0, -8, 2, 0, Math.PI * 2);
      c.fillStyle = '#8B4828';
      c.fill();
      c.restore();
    };

    let time = 0;
    const render = () => {
      if (isVisibleRef.current && ctx) {
        ctx.clearRect(0, 0, width, height);
        time += 0.025;

        const mouse = mouseRef.current;
        const parallaxX = mouse.targetX * 22;
        const parallaxY = mouse.targetY * 18;

        // 1. Render Floating Whole Spices (with Depth, 3D Rotation & Mouse Parallax)
        if (showWholeSpices && wholeSpices.length > 0) {
          wholeSpices.forEach(item => {
            item.rotation += item.rotSpeed;
            item.floatPhase += item.floatSpeed;

            // Parallax based on z depth
            const currentX = item.baseX + Math.sin(item.floatPhase) * 12 + parallaxX * item.z;
            const currentY = item.baseY + Math.cos(item.floatPhase * 0.8) * 10 + parallaxY * item.z;

            ctx.save();
            ctx.translate(currentX, currentY);
            ctx.rotate(item.rotation);

            // Add soft realistic shadow under floating spice
            ctx.shadowColor = 'rgba(31, 22, 16, 0.18)';
            ctx.shadowBlur = 10 * item.scale;
            ctx.shadowOffsetY = 6 * item.scale;

            switch (item.type) {
              case 'chilli':
                drawChilli(ctx, item.scale);
                break;
              case 'turmeric':
                drawTurmeric(ctx, item.scale);
                break;
              case 'coriander':
                drawCoriander(ctx, item.scale);
                break;
              case 'cumin':
                drawCumin(ctx, item.scale);
                break;
              case 'pepper':
                drawPepper(ctx, item.scale);
                break;
              case 'clove':
                drawClove(ctx, item.scale);
                break;
            }

            ctx.restore();
          });
        }

        // 2. Render Soft Glowing Spice Aroma Particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.15;

          // Mouse vortex interaction
          if (interactive && mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 140;
            if (dist < maxDist && dist > 0) {
              const force = (1 - dist / maxDist) * 1.8;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          p.x += p.vx + Math.sin(time + p.pulseOffset) * 0.25;
          p.y += p.vy;

          if (p.x < -15) p.x = width + 15;
          if (p.x > width + 15) p.x = -15;
          if (p.y < -15) {
            p.y = height + 15;
            p.x = Math.random() * width;
          }
          if (p.y > height + 15) p.y = -15;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.05, Math.min(1, p.alpha * opacity));
          ctx.shadowBlur = p.size * 2.5;
          ctx.shadowColor = p.color;
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      if (!prefersReducedMotion) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render();
    } else {
      animFrameRef.current = requestAnimationFrame(render);
    }

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
  }, [particleCount, interactive, opacity, showWholeSpices, wholeSpiceCount, activeStageId]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
    />
  );
};
