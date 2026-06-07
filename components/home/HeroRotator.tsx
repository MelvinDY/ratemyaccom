'use client';

import { useRef, useEffect } from 'react';

const ROT_WORDS = ['live.', 'sleep.', 'study.', 'belong.', 'wake up.', 'breathe.', 'start.'];

export default function HeroRotator() {
  const trackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let i = 0;
    const total = ROT_WORDS.length;

    const tick = () => {
      i++;
      const unit = (track.children[0] as HTMLElement).offsetHeight;
      track.style.transform = `translateY(-${i * unit}px)`;
      if (i >= total) {
        setTimeout(() => {
          track.style.transition = 'none';
          i = 0;
          track.style.transform = 'translateY(0px)';
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              track.style.transition = '';
            })
          );
        }, 720);
      }
    };

    const start = setTimeout(() => {
      const iv = setInterval(tick, 1900);
      // store for cleanup
      (track as HTMLElement & { _iv?: ReturnType<typeof setInterval> })._iv = iv;
    }, 1500);

    return () => {
      clearTimeout(start);
      const iv = (track as HTMLElement & { _iv?: ReturnType<typeof setInterval> })._iv;
      if (iv) clearInterval(iv);
    };
  }, []);

  return (
    <span className="heroB-rot" style={{ width: '7ch', display: 'inline-block' }}>
      <span className="heroB-rot-track" ref={trackRef}>
        {ROT_WORDS.map((w, idx) => (
          <span key={idx}>{w}</span>
        ))}
        {/* anchor copy for seamless loop */}
        <span>{ROT_WORDS[0]}</span>
      </span>
    </span>
  );
}
