import { DATA } from '@/lib/data';

export default function Cases() {
  const c = DATA.consumer.c;
  const list = (a: string[]) => a.map((x) => <li key={x}>{x}</li>);

  return (
    <section className="pad" id="cases" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cases-top">
          <div>
            <p className="eyebrow rv">Use cases</p>
            <h2 className="rv" style={{ marginTop: 14 }}>Do roz ki <em>problems</em>, abhi ke liye.</h2>
          </div>
          <div className="seg rv" role="tablist" aria-label="Use case">
            <button role="tab" aria-selected="true">Online order</button>
          </div>
        </div>
        <div className="case" aria-live="polite">
          <div className="quote">
            {c.quote}
            <small>{c.who}</small>
          </div>
          <div className="cgrid">
            <div className="cbox"><p className="lbl">NyayaVoice poochta hai</p><ul>{list(c.asks)}</ul></div>
            <div className="cbox"><p className="lbl">Aap saath rakho</p><ul>{list(c.keep)}</ul></div>
            <div className="cbox no"><p className="lbl">Yeh nahi karta</p><ul>{list(c.no)}</ul></div>
            <div className="cbox">
              <p className="lbl">Official channel</p>
              <p><a href={c.ch[1]} target="_blank" rel="noopener noreferrer">{c.ch[0]} ↗</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
