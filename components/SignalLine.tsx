'use client';

import React, { useRef, useEffect } from 'react';

interface SignalLineProps {
  width?: number;
  color?: string;
  delay?: number;
}

export default function SignalLine({ width = 96, color, delay = 0 }: SignalLineProps) {
  const ref = useRef<SVGLineElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !ref.current) return;

    const line = ref.current;
    const length = line.getTotalLength();
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);

    const timer = setTimeout(() => {
      line.style.transition = `stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)`;
      line.style.strokeDashoffset = '0';
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <svg
      width={width}
      height={4}
      viewBox={`0 0 ${width} 4`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
      aria-hidden="true"
    >
      <line
        ref={ref}
        x1="0"
        y1="2"
        x2={width}
        y2="2"
        stroke={color || '#22C55E'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
