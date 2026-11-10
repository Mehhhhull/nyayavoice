import { PHRASES } from '@/lib/data';

export default function Marquee() {
  const items = [...PHRASES, ...PHRASES];
  return (
    <div className="marq" aria-label="Things people say">
      <div className="marq-track">
        {items.map((t, i) => (
          <span key={i} aria-hidden={i >= PHRASES.length ? true : undefined}>{t}</span>
        ))}
      </div>
    </div>
  );
}
