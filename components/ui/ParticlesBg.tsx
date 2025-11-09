'use client';

import { useRef, useEffect, useState } from 'react';

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

type Props = {
  color?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  className?: string;
  refresh?: boolean;
};

export default function ParticlesBg({
  color = '#FFF',
  quantity = 100,
  staticity = 50,
  ease = 50,
  className = '',
  refresh = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const pixelRatioRef = useRef<number>(1);
  const animationFrameRef = useRef<number>();

  // Convert hex color to RGB
  const hexToRgb = (hex: string): string => {
    let cleanHex = hex.replace(/^#/, '');

    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r} ${g} ${b}`;
  };

  const rgbColor = hexToRgb(color);

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext('2d');
    }

    pixelRatioRef.current = window.devicePixelRatio || 1;

    const initCanvas = () => {
      resizeCanvas();
      drawParticles();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const { w, h } = canvasSizeRef.current;
        const x = e.clientX - rect.left - w / 2;
        const y = e.clientY - rect.top - h / 2;

        const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
        if (inside) {
          mouseRef.current.x = x;
          mouseRef.current.y = y;
        }
      }
    };

    initCanvas();
    animate();

    window.addEventListener('resize', initCanvas);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', initCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [color, quantity, staticity, ease, refresh]);

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && contextRef.current) {
      circles.current = [];
      canvasSizeRef.current.w = canvasContainerRef.current.offsetWidth;
      canvasSizeRef.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSizeRef.current.w * pixelRatioRef.current;
      canvasRef.current.height = canvasSizeRef.current.h * pixelRatioRef.current;
      canvasRef.current.style.width = `${canvasSizeRef.current.w}px`;
      canvasRef.current.style.height = `${canvasSizeRef.current.h}px`;
      contextRef.current.scale(pixelRatioRef.current, pixelRatioRef.current);
    }
  };

  const circleParams = (): Circle => {
    const x = Math.floor(Math.random() * canvasSizeRef.current.w);
    const y = Math.floor(Math.random() * canvasSizeRef.current.h);
    const translateX = 0;
    const translateY = 0;
    const size = Math.floor(Math.random() * 2) + 1;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.2;
    const dy = (Math.random() - 0.5) * 0.2;
    const magnetism = 0.1 + Math.random() * 4;

    return {
      x,
      y,
      translateX,
      translateY,
      size,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const drawCircle = (circle: Circle, update = false) => {
    if (contextRef.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      contextRef.current.translate(translateX, translateY);
      contextRef.current.beginPath();
      contextRef.current.arc(x, y, size, 0, 2 * Math.PI);
      contextRef.current.fillStyle = `rgba(${rgbColor}, ${alpha})`;
      contextRef.current.fill();
      contextRef.current.setTransform(
        pixelRatioRef.current,
        0,
        0,
        pixelRatioRef.current,
        0,
        0
      );

      if (!update) {
        circles.current.push(circle);
      }
    }
  };

  const clearContext = () => {
    if (contextRef.current) {
      contextRef.current.clearRect(
        0,
        0,
        canvasSizeRef.current.w,
        canvasSizeRef.current.h
      );
    }
  };

  const drawParticles = () => {
    clearContext();
    for (let i = 0; i < quantity; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  };

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ): number => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const animate = () => {
    clearContext();
    circles.current.forEach((circle, i) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSizeRef.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSizeRef.current.h - circle.y - circle.translateY - circle.size,
      ];

      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));

      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }

      circle.x += circle.dx;
      circle.y += circle.dy;
      circle.translateX +=
        (mouseRef.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
      circle.translateY +=
        (mouseRef.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;

      if (
        circle.x < -circle.size ||
        circle.x > canvasSizeRef.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSizeRef.current.h + circle.size
      ) {
        circles.current.splice(i, 1);
        const newCircle = circleParams();
        drawCircle(newCircle);
      } else {
        drawCircle(
          {
            ...circle,
            x: circle.x,
            y: circle.y,
            translateX: circle.translateX,
            translateY: circle.translateY,
            alpha: circle.alpha,
          },
          true
        );
      }
    });

    animationFrameRef.current = window.requestAnimationFrame(animate);
  };

  return (
    <div ref={canvasContainerRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
