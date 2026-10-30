import { LINKS } from '@/lib/data';

export default function Final() {
  return (
    <section className="pad final">
      <div className="wrap">
        <h2 className="rv">Apni baat <em>boliye.</em></h2>
        <span className="hi rv">Agla kadam hum dikhayenge.</span>
        <div className="cta-row rv" style={{ marginTop: 34 }}>
          <a className="btn pri mag" href="#demo">Try the sample demo</a>
          <a className="btn mag" href={LINKS.helpline} target="_blank" rel="noopener noreferrer">National Consumer Helpline</a>
        </div>
      </div>
    </section>
  );
}
