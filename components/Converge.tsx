'use client';

import { useEffect, useRef } from 'react';

/* [label, x offset (share of width), y offset (share of height), rotation] */
const TABS: [string, number, number, number][] = [
  ['consumerhelpline.gov.in', -0.36, -0.3, -7],
  ['echallan.parivahan.gov.in', 0.3, -0.34, 6],
  ['indiacode.nic.in', -0.38, 0.08, 5],
  ['Consumer Protection Act 2019.pdf', 0.28, 0.02, -6],
  ['forum thread (2014)', -0.26, 0.36, -4],
  ['seller T&C, page 7 of 9', 0.32, 0.34, 8],
  ['“top 10 consumer rights”', 0.02, -0.4, -3],
];

export default function Converge() {
  const tv = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const run = () => {
      const box = tv.current;
      if (!box) return;
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.55)));
      chips.current.forEach((c, i) => {
        if (!c) return;
        const t = TABS[i];
        const k = 1 - p;
        c.style.transform = `translate(-50%,-50%) translate(${(t[1] * r.width * k).toFixed(1)}px,${(t[2] * r.height * k).toFixed(1)}px) rotate(${(t[3] * k).toFixed(1)}deg) scale(${(1 - 0.25 * p).toFixed(3)})`;
        c.style.opacity = (1 - p).toFixed(2);
      });
      if (card.current) {
        card.current.style.opacity = (0.55 + 0.45 * p).toFixed(2);
        card.current.style.transform = `translate(-50%,-50%) scale(${(0.94 + 0.06 * p).toFixed(3)})`;
      }
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        run();
        ticking = false;
      });
    };
    run();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="tv rv" ref={tv} aria-label="Many scattered portals collapse into one voice card">
      {TABS.map((t, i) => (
        <div key={t[0]} className="t" style={{ transform: 'translate(-50%,-50%)' }} ref={(el) => { chips.current[i] = el; }}>
          {t[0]}
        </div>
      ))}
      <div className="vcard" ref={card}>
        <div className="m">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
          </svg>
        </div>
        <div>
          <strong>Bolo. Hum dhoondhenge.</strong>
          <small>Hindi · Hinglish · English</small>
        </div>
      </div>
    </div>
  );
}
