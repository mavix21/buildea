"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function DitherBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mountedRef = useRef(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    mountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme === "dark";
    const bgColor = isDark ? "#1a1814" : "#faf9f6";
    const dotColor = isDark ? "#f5d547" : "#966b12";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = (timestamp: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const time = timestamp * 0.001;

      // Clear with theme-aware background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const spacing = 6;
      const maxDotSize = 2.5;

      // Main dither pattern with animation
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          // Create radial gradient from center-left
          const centerX = width * 0.35;
          const centerY = height * 0.45;
          const distFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
          );
          const maxDist = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));

          // Animated gradient with wave effect
          const waveOffset =
            Math.sin(time * 0.5 + distFromCenter * 0.005) * 0.1;
          const gradient =
            Math.min(distFromCenter / (maxDist * 0.5), 1) + waveOffset;

          // Add noise for dither effect
          const noise = Math.random();
          const threshold = 0.35 + gradient * 0.45;

          if (noise > threshold) {
            const dotSize =
              maxDotSize * (1 - gradient * 0.8) * (0.4 + noise * 0.6);
            const opacity = (1 - gradient * 0.9) * 0.2 * noise;

            ctx.fillStyle = dotColor;
            ctx.globalAlpha = Math.max(0, Math.min(opacity, 0.25));
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Particle ring animation
      const ringCenterX = width * 0.5;
      const ringCenterY = height * 0.5;
      const ringRadius = Math.min(width, height) * 0.35;
      const numParticles = 120;

      for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2 + time * 0.3;
        const wobble = Math.sin(time * 2 + i * 0.5) * 15;
        const x = ringCenterX + Math.cos(angle) * (ringRadius + wobble);
        const y = ringCenterY + Math.sin(angle) * (ringRadius + wobble);

        const particleSize = 2 + Math.sin(time * 3 + i) * 1;
        const opacity = 0.15 + Math.sin(time * 2 + i * 0.3) * 0.1;

        ctx.fillStyle = dotColor;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Floating particles
      // const floatingParticles = 50;
      // for (let i = 0; i < floatingParticles; i++) {
      //   const seed = i * 1337;
      //   const baseX = (seed * 7) % width;
      //   const baseY = (seed * 13) % height;
      //   const floatX = Math.sin(time * 0.5 + seed) * 30;
      //   const floatY = Math.cos(time * 0.7 + seed * 0.5) * 20;

      //   const x = baseX + floatX;
      //   const y = baseY + floatY;
      //   const size = 1 + (seed % 3);
      //   const opacity = 0.1 + Math.sin(time + seed) * 0.05;

      //   ctx.fillStyle = dotColor;
      //   ctx.globalAlpha = opacity;
      //   ctx.beginPath();
      //   ctx.arc(x, y, size, 0, Math.PI * 2);
      //   ctx.fill();
      // }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    animationRef.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      suppressHydrationWarning
    />
  );
}
