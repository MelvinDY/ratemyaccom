'use client';

import { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Color, Triangle, type OGLRenderingContext } from 'ogl';

type Props = {
  className?: string;
};

export default function LiquidBackground({ className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationIdRef = useRef<number>();
  const rendererRef = useRef<Renderer>();
  const glRef = useRef<OGLRenderingContext>();
  const meshRef = useRef<Mesh>();

  // Vertex Shader
  const vert = `
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
  `;

  // Fragment Shader
  const frag = `
    precision highp float;

    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uResolution;

    varying vec2 vUv;

    void main() {
        float mr = min(uResolution.x, uResolution.y);
        vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

        float d = -uTime * 1.2;
        float a = 0.0;
        for (float i = 0.0; i < 8.0; ++i) {
            a += cos(i - d - a * uv.x);
            d += sin(uv.y * i + a);
        }
        d += uTime * 1.0;
        vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
        col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);

        // Apply color tint
        col = col * uColor;

        gl_FragColor = vec4(col, 1.0);
    }
  `;

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize renderer
    const renderer = new Renderer();
    rendererRef.current = renderer;
    const gl = renderer.gl;
    glRef.current = gl;
    gl.clearColor(1, 1, 1, 1);

    // Resize function
    const resize = () => {
      if (!containerRef.current) return;
      const scale = 1;
      renderer.setSize(
        containerRef.current.offsetWidth * scale,
        containerRef.current.offsetHeight * scale
      );
      if (meshRef.current) {
        meshRef.current.program.uniforms.uResolution.value = [
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        ];
      }
    };

    // Animation loop
    const update = (t: number) => {
      animationIdRef.current = requestAnimationFrame(update);
      if (meshRef.current) {
        meshRef.current.program.uniforms.uTime.value = t * 0.001;
        renderer.render({ scene: meshRef.current });
      }
    };

    // Setup WebGL
    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(0.6, 0.2, 0.8) }, // Deep purple/violet tones
        uResolution: {
          value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height],
        },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    // Initial resize and start animation
    window.addEventListener('resize', resize, false);
    resize();
    animationIdRef.current = requestAnimationFrame(update);

    // Append canvas to container
    containerRef.current.appendChild(gl.canvas);

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', resize);
      if (containerRef.current && gl?.canvas) {
        try {
          containerRef.current.removeChild(gl.canvas);
        } catch (e) {
          // Canvas may already be removed
        }
      }
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
