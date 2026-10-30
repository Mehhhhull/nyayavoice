import type { ReactNode } from 'react';

const STEPS: { n: string; title: string; body: string; hi: string; ill: ReactNode }[] = [
  {
    n: 'KADAM 1',
    title: 'Apni baat bolo',
    body: 'Mic dabao aur jaise dost ko batate ho, waise batao. Hindi, Hinglish ya English, sab chalta hai. Form bharne ki zaroorat nahi.',
    hi: '“Mera product defective aaya hai.”',
    ill: (
      <svg className="ill" viewBox="0 0 240 180" role="img" aria-label="Line drawing of a microphone with sound waves">
        <rect className="ln" x="104" y="34" width="32" height="56" rx="16" />
        <path className="ln" d="M90 80c0 20 13 34 30 34s30-14 30-34" />
        <path className="ln" d="M120 114v26M100 140h40" />
        <path className="ln ac" d="M162 62c8 8 8 20 0 28" />
        <path className="ln ac" d="M176 52c14 14 14 38 0 52" />
        <path className="ln ac" d="M78 62c-8 8-8 20 0 28" />
        <path className="ln ac" d="M64 52c-14 14-14 38 0 52" />
      </svg>
    ),
  },
  {
    n: 'KADAM 2',
    title: 'Pehle confirm, phir jawab',
    body: 'Transcript screen par dikhta hai. Price, date ya challan number galat suna gaya ho to usi waqt theek kar do. Galat suni baat par salah nahi milegi.',
    hi: '“Kya maine sahi samjha?”',
    ill: (
      <svg className="ill" viewBox="0 0 240 180" role="img" aria-label="Line drawing of a transcript card with a highlighted number being edited">
        <rect className="ln" x="40" y="36" width="160" height="108" rx="10" />
        <path className="ln" d="M60 64h72M60 86h120M60 128h56" />
        <rect className="ln ac" x="104" y="96" width="60" height="22" rx="11" />
        <path className="ln ac" d="M170 130l22-22 8 8-22 22-10 2z" />
      </svg>
    ),
  },
  {
    n: 'KADAM 3',
    title: 'Official source se jawab',
    body: 'Jawab model ki yaadasht se nahi, chuni hui official sources se banta hai. Har zaroori baat ke saath link hota hai. Source na mile to NyayaVoice saaf kehta hai ki woh verify nahi kar paya.',
    hi: '“Source ke bina koi daava nahi.”',
    ill: (
      <svg className="ill" viewBox="0 0 240 180" role="img" aria-label="Line drawing of a document with a green verified stamp">
        <path className="ln" d="M64 28h70l30 30v96H64z" />
        <path className="ln" d="M134 28v30h30" />
        <path className="ln" d="M82 82h64M82 100h64M82 118h38" />
        <circle className="ln gr" cx="158" cy="128" r="28" />
        <path className="ln gr" d="M145 128l9 9 19-21" />
      </svg>
    ),
  },
  {
    n: 'KADAM 4',
    title: 'Suno, copy karo, portal par jao',
    body: 'Plain-language jawab, evidence checklist aur shikayat ka draft ek jagah. Sab kuch aapko padh kar sunaya bhi jata hai. Bhejna aap khud karte ho, official channel par.',
    hi: '“Ab pata hai agla kadam kya hai.”',
    ill: (
      <svg className="ill" viewBox="0 0 240 180" role="img" aria-label="Line drawing of a speaker beside a checklist">
        <path className="ln" d="M44 74h22l32-26v84l-32-26H44z" />
        <path className="ln ac" d="M112 72c8 10 8 26 0 36" />
        <path className="ln ac" d="M126 60c14 16 14 44 0 60" />
        <rect className="ln" x="156" y="42" width="56" height="96" rx="8" />
        <path className="ln gr" d="M168 66l5 5 9-10M168 92l5 5 9-10M168 118l5 5 9-10" />
        <path className="ln" d="M190 68h12M190 94h12M190 120h12" />
      </svg>
    ),
  },
];

export default function How() {
  return (
    <section className="pad" id="how" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="how-head">
          <p className="eyebrow rv">How it works</p>
          <h2 className="rv">Awaaz se <em>action</em> tak, chaar kadam mein.</h2>
        </div>
        {STEPS.map((s) => (
          <article key={s.n} className="how-step rv">
            <div>
              <p className="n">{s.n}</p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="hi hi-s">{s.hi}</span>
            </div>
            <div className="how-ill">{s.ill}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
