import { LINKS } from '@/lib/data';

const NO: [string, string][] = [
  ['Nateeje ki guarantee nahi.', 'Refund ya challan cancel hone ka vaada nahi karta.'],
  ['Kanoon ya section number nahi ghadta.', 'Jo official source mein nahi, woh nahi bolta.'],
  ['Challan ko galat ya sahi nahi theherata.', 'Sirf verify aur contest karne ka tareeka dikhata hai.'],
  ['Shikayat khud submit nahi karta.', 'Draft aapka hai, bhejna aapke haath mein.'],
  ['Aadhaar, PAN ya bank details nahi maangta.', 'Zaroorat hi nahi hoti.'],
  ['Offline hone ka daava nahi.', 'Voice ke liye internet chahiye.'],
];

const SOURCES: [string, string, string][] = [
  ['Consumer Protection Act, 2019', 'India Code', LINKS.act],
  ['National Consumer Helpline', 'Portal · 1915', LINKS.helpline],
  ['eChallan', 'Parivahan', LINKS.echallan],
];

export default function Trust() {
  return (
    <section className="pad" id="trust">
      <div className="wrap">
        <p className="eyebrow rv">Bharosa</p>
        <h2 className="rv" style={{ marginTop: 14 }}>Jo NyayaVoice <em>kabhi nahi</em> karega.</h2>
        <div className="trust-grid">
          <ul className="nolist rv">
            {NO.map(([b, t]) => (
              <li key={b}>
                <span><b>{b}</b> {t}</span>
              </li>
            ))}
          </ul>
          <div className="srcbox rv">
            <svg className="stamp" viewBox="0 0 110 110" aria-hidden="true">
              <circle cx="55" cy="55" r="48" fill="none" stroke="#7FB285" strokeWidth="1.5" strokeDasharray="3 4" />
              <circle cx="55" cy="55" r="38" fill="none" stroke="#7FB285" strokeWidth="1.5" />
              <path d="M40 56l11 11 21-24" fill="none" stroke="#7FB285" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="eyebrow" style={{ color: 'var(--verify)' }}>Source-checked</p>
            <p style={{ marginTop: 12, color: 'var(--paper-dim)', maxWidth: '30ch' }}>
              Jawab in official sources se aate hain, internet ki kisi bhi site se nahi.
            </p>
            <ul>
              {SOURCES.map(([name, tag, href]) => (
                <li key={name}>
                  <a href={href} target="_blank" rel="noopener noreferrer">{name} <span>{tag}</span></a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
