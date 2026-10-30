'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DATA, type Key } from '@/lib/data';

const MIN = 1500;
const IDLE = 'Dabaye rakho aur bolo · Hold to speak';
const BAR_COUNT = 36;

function Say({ k, n }: { k: Key; n: number }) {
  const d = DATA[k];
  const i = d.say.indexOf(d.mark);
  if (i < 0 || n <= i) return <>{d.say.slice(0, n)}</>;
  const end = Math.min(n, i + d.mark.length);
  return (
    <>
      {d.say.slice(0, i)}
      <mark>{d.say.slice(i, end)}</mark>
      {d.say.slice(end, n)}
    </>
  );
}

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Demo() {
  const [key, setKey] = useState<Key>('consumer');
  const d = DATA[key];

  const [rec, setRec] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chars, setChars] = useState(DATA.consumer.say.length);
  const [confirm, setConfirm] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stepsOn, setStepsOn] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [srcOn, setSrcOn] = useState(true);
  const [draftOn, setDraftOn] = useState(true);
  const [draftChars, setDraftChars] = useState(DATA.consumer.draft.length);
  const [copyLabel, setCopyLabel] = useState('Copy');

  const token = useRef(0);
  const recRef = useRef(false);
  const downAt = useRef(0);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const draftRef = useRef<HTMLPreElement>(null);

  const showStatic = useCallback((k: Key) => {
    setChars(DATA[k].say.length);
    setConfirm(true);
    setConfirmed(false);
    setEditing(false);
    setStepsOn(true);
    setAnimate(false);
    setSrcOn(true);
    setDraftOn(true);
    setDraftChars(DATA[k].draft.length);
    setBusy(false);
  }, []);

  const hideResults = useCallback(() => {
    setStepsOn(false);
    setSrcOn(false);
    setDraftOn(false);
    setConfirm(false);
    setConfirmed(false);
    setEditing(false);
    setChars(0);
  }, []);

  const sleep = (ms: number, id: number) =>
    new Promise<void>((res, rej) => {
      setTimeout(() => (id === token.current ? res() : rej(new Error('stale'))), ms);
    });

  const play = useCallback(
    async (k: Key) => {
      const id = ++token.current;
      const dd = DATA[k];
      setRec(false);
      if (reduced()) {
        showStatic(k);
        return;
      }
      setBusy(true);
      hideResults();
      try {
        await sleep(350, id);
        let n = 0;
        while (n < dd.say.length) {
          n += 2;
          setChars(n);
          await sleep(18, id);
        }
        setConfirm(true);
        await sleep(500, id);
        setAnimate(true);
        setStepsOn(true);
        await sleep(dd.steps.length * 350 + 300, id);
        setSrcOn(true);
        await sleep(450, id);
        setDraftChars(0);
        setDraftOn(true);
        let c = 0;
        while (c < dd.draft.length) {
          c += 4;
          setDraftChars(c);
          await sleep(10, id);
        }
        setBusy(false);
      } catch {
        /* a newer run or tab switch took over */
      }
    },
    [hideResults, showStatic],
  );

  const startRec = () => {
    if (recRef.current) return;
    recRef.current = true;
    downAt.current = Date.now();
    token.current++;
    setRec(true);
    setBusy(false);
    if (!reduced()) hideResults();
  };

  const stopRec = () => {
    if (!recRef.current) return;
    recRef.current = false;
    setRec(false);
    setBusy(true);
    const wait = Math.max(0, MIN - (Date.now() - downAt.current));
    const id = token.current;
    setTimeout(() => {
      if (id === token.current && !recRef.current) play(key);
    }, wait);
  };

  const pick = (k: Key) => {
    token.current++;
    recRef.current = false;
    setRec(false);
    setKey(k);
    showStatic(k);
  };

  const copy = () => {
    const txt = draftRef.current?.textContent ?? '';
    const done = () => {
      setCopyLabel('Copied');
      setTimeout(() => setCopyLabel('Copy'), 1600);
    };
    const fallback = () => {
      const el = draftRef.current;
      if (el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
      setCopyLabel('Select ho gaya, copy karo');
      setTimeout(() => setCopyLabel('Copy'), 2200);
    };
    try {
      navigator.clipboard.writeText(txt).then(done, fallback);
    } catch {
      fallback();
    }
  };

  /* waveform */
  useEffect(() => {
    if (reduced()) {
      bars.current.forEach((b, i) => {
        if (b) b.style.height = `${8 + Math.abs(Math.sin(i * 0.5)) * 28}%`;
      });
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      bars.current.forEach((b, i) => {
        if (!b) return;
        const h = recRef.current
          ? 14 + Math.abs(Math.sin(t * 7 + i * 0.7) * Math.cos(t * 3.1 + i * 0.31)) * 86
          : 6 + Math.abs(Math.sin(t * 1.2 + i * 0.45)) * 10;
        b.style.height = `${h}%`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const hint = rec ? 'Sun rahe hain… bolo, phir chhod do' : busy ? 'Samajh rahe hain…' : IDLE;

  return (
    <div className="demo" id="demo" aria-label="NyayaVoice sample demo">
      <div className="demo-top">
        <span className="tag">Sample demo · not a live recording</span>
        <div className="seg" role="tablist" aria-label="Sample scenario">
          <button role="tab" aria-selected={key === 'consumer'} onClick={() => pick('consumer')}>Consumer</button>
          <button role="tab" aria-selected={key === 'challan'} onClick={() => pick('challan')}>Challan</button>
        </div>
      </div>

      <div className={`mic-row${rec ? ' rec-on' : ''}`}>
        <button
          className={`mic${rec ? ' rec' : ''}`}
          aria-label="Hold to speak the sample complaint (press and hold, or hold Space)"
          onPointerDown={(e) => {
            e.preventDefault();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              /* ignore */
            }
            startRec();
          }}
          onPointerUp={stopRec}
          onPointerCancel={stopRec}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              startRec();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              stopRec();
            }
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v4" />
          </svg>
        </button>
        <div className="wave" aria-hidden="true">
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <span key={i} ref={(el) => { bars.current[i] = el; }} />
          ))}
        </div>
      </div>
      <span className="mic-hint">{hint}</span>

      <div className="blk">
        <p className="lbl">Humne yeh suna</p>
        <p
          className="transcript"
          aria-live="polite"
          contentEditable={editing}
          suppressContentEditableWarning
        >
          <Say k={key} n={chars} />
        </p>
        <div className="confirm" style={{ display: confirm ? '' : 'none' }}>
          <span>Did I understand you correctly?</span>
          <button className="chip ok" onClick={() => setConfirmed(true)}>{confirmed ? 'Confirm hua ✓' : 'Haan, sahi'}</button>
          <button className="chip" onClick={() => setEditing(true)}>{editing ? 'Editing…' : 'Edit'}</button>
        </div>
      </div>

      <div className={`blk${stepsOn ? '' : ' off'}`}>
        <p className="lbl">Agle kadam</p>
        <ol className="steps">
          {d.steps.map((s, i) => (
            <li key={`${key}-${i}`} style={animate ? { animationDelay: `${i * 0.35}s` } : { animation: 'none' }}>
              <b>{i + 1}</b>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={`blk${srcOn ? '' : ' off'}`}>
        <p className="lbl">Official sources</p>
        <div className="srcs">
          {d.src.map(([name, href]) => (
            <a key={href} className="chip" href={href} target="_blank" rel="noopener noreferrer">{name}</a>
          ))}
        </div>
      </div>

      <div className={`blk${draftOn ? '' : ' off'}`}>
        <div className="draft-head">
          <p className="lbl">Aapka draft · bhejne se pehle check karo</p>
          <button className="chip" onClick={copy}>{copyLabel}</button>
        </div>
        <pre className="draft" ref={draftRef}>{d.draft.slice(0, draftChars)}</pre>
      </div>

      <p className="demo-foot">Yeh sample hai. Real app mein yahan aapki awaaz ka transcript aur official sources se bana jawab aayega.</p>
    </div>
  );
}
