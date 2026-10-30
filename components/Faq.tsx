import { FAQ } from '@/lib/data';

export default function Faq() {
  return (
    <section className="pad" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <p className="eyebrow rv">FAQ</p>
        <h2 className="rv" style={{ marginTop: 14 }}>Aksar <em>poochhe</em> jaane wale sawaal.</h2>
        <div className="faq rv">
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
