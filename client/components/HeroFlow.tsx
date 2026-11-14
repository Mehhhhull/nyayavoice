'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

const GHOST =
  'bhaiya woh phone jo pichhle hafte liya tha na, uska screen kharab nikla aur seller bol raha hai refund nahi milega, ab kya karun samajh nahi aa raha…   ';
const RIBBON =
  'Complaint regarding defective mobile phone   ·   Consumer Protection Act, 2019   ·   Draft ready to send   ·   Official source linked   ·   ';
const REPEAT = 4;
const WORDS = ['refund nahi mila?', 'phone kharab nikla?', 'seller sun nahi raha?'];
const BARS = 30;

const GHOST_D =
  'M -160 262 C 20 262 180 282 318 262 C 470 240 520 130 430 72 C 340 14 232 72 258 152 C 282 222 400 262 526 290 C 610 306 700 312 790 310';
const RIBBON_D = 'M 800 310 C 960 312 1120 286 1280 246 C 1420 212 1560 186 1760 176';

export default function HeroFlow() {
  const svgRef = useRef<SVGSVGElement>(null);
  const ghostText = useRef<SVGTextPathElement>(null);
  const ribbonText = useRef<SVGTextPathElement>(null);
  const ghostMeasure = useRef<SVGTextElement>(null);
  const ribbonMeasure = useRef<SVGTextElement>(null);
  const [word, setWord] = useState(0);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setWord((index) => (index + 1) % WORDS.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let ghostLength = 600;
    let ribbonLength = 600;
    let frame = 0;
    let visible = true;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const measure = () => {
      const ghostWidth = ghostMeasure.current?.getComputedTextLength();
      const ribbonWidth = ribbonMeasure.current?.getComputedTextLength();
      if (ghostWidth) ghostLength = ghostWidth / REPEAT;
      if (ribbonWidth) ribbonLength = ribbonWidth / REPEAT;
    };

    const draw = (time: number) => {
      ghostText.current?.setAttribute('startOffset', String(-ghostLength + ((time * 0.042) % ghostLength)));
      ribbonText.current?.setAttribute('startOffset', String(-ribbonLength + ((time * 0.058) % ribbonLength)));
    };

    const animate = (time: number) => {
      if (visible) draw(time);
      frame = requestAnimationFrame(animate);
    };

    measure();
    void document.fonts?.ready.then(() => {
      measure();
      if (reducedMotion) draw(9000);
    });

    if (reducedMotion) {
      draw(9000);
    } else {
      frame = requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(svg);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="hero-flow" aria-hidden="true">
      <div className="hero-flow-stage">
        <svg ref={svgRef} className="hero-flow-svg" viewBox="0 0 1600 380" xmlSpace="preserve">
          <defs>
            <path id="hero-flow-ghost-path" d={GHOST_D} />
            <path id="hero-flow-ribbon-path" d={RIBBON_D} />
          </defs>

          <text ref={ghostMeasure} className="hero-flow-ghost hero-flow-measure" x="0" y="-60" xmlSpace="preserve">
            {GHOST.repeat(REPEAT)}
          </text>
          <text ref={ribbonMeasure} className="hero-flow-ribbon-text hero-flow-measure" x="0" y="-60" xmlSpace="preserve">
            {RIBBON.repeat(REPEAT)}
          </text>

          <text className="hero-flow-ghost" dy="7" xmlSpace="preserve">
            <textPath ref={ghostText} href="#hero-flow-ghost-path" startOffset="-600">{GHOST.repeat(REPEAT)}</textPath>
          </text>
          <use href="#hero-flow-ribbon-path" className="hero-flow-ribbon" />
          <text className="hero-flow-ribbon-text" dy="8" xmlSpace="preserve">
            <textPath ref={ribbonText} href="#hero-flow-ribbon-path" startOffset="-600">{RIBBON.repeat(REPEAT)}</textPath>
          </text>
        </svg>

        <p className="hero-flow-word" key={word}>{WORDS[word]}</p>
        <div className="hero-flow-pill">
          {Array.from({ length: BARS }, (_, index) => {
            const height = 18 + Math.abs(Math.sin(index * 1.7) * Math.cos(index * 0.6)) * 70;
            const style = {
              '--bar-height': `${height.toFixed(1)}%`,
              '--bar-index': index,
            } as CSSProperties;
            return <i key={index} style={style} />;
          })}
        </div>
      </div>
    </div>
  );
}