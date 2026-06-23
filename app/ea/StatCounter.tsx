'use client';
import { useEffect, useRef, useState } from 'react';

export function StatCounter({
  target,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const fps = 60;
          const totalSteps = (duration / 1000) * fps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / totalSteps;
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;
            if (step >= totalSteps) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(parseFloat(current.toFixed(decimals)));
            }
          }, 1000 / fps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals]);

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}
      {suffix}
    </span>
  );
}
