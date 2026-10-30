'use client';

import { useEffect, useState } from 'react';

const LINES: { text: string; hi?: boolean }[] = [
  { text: 'बोलिए। समझिए। कीजिए।', hi: true },
  { text: 'Speak. Understand. Act.' },
  { text: 'Apni baat, apni zubaan mein.' },
];

export default function RollingLine() {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState(-1);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => {
      setIdx((i) => {
        setPrev(i);
        return (i + 1) % LINES.length;
      });
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="roll" aria-hidden="true">
      {LINES.map((l, i) => (
        <p key={l.text} className={`${l.hi ? 'hi ' : ''}${i === idx ? 'on' : i === prev ? 'off' : 'nx'}`}>
          {l.text}
        </p>
      ))}
    </div>
  );
}
