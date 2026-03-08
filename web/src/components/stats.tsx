'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  note?: string;
}

const STATS: StatItem[] = [
  { value: 10000, suffix: '+', label: 'Calls Queued', note: '(obviously fake, just looked good)' },
  { value: 99, suffix: '%', label: 'Uptime', note: '(theoretical)' },
  { value: 1, suffix: '', label: 'Language', note: 'English (for now). to roast you in.' },
  { value: 0, suffix: '', label: 'Human Feelings', note: 'about this' },
];

function Counter({ value, suffix, prefix = '' }: { value: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || value === 0) {
      setCount(value);
      return;
    }
    const duration = 2000;
    const step = value / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent tabular-nums">
                <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {stat.label}
              </div>
              {stat.note && (
                <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-600 italic">
                  {stat.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
