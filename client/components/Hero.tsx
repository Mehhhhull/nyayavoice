import RollingLine from './RollingLine';
import HeroFlow from './HeroFlow';

export default function Hero() {
  return (
    <section className="hero hero-redesign">
      <div className="ghost" aria-hidden="true">न्याय</div>
      <div className="wrap">
        <div className="hero-copy">
          <p className="eyebrow">Voice-first help · Hindi · Hinglish · English</p>
          <h1>
            <span className="sr">NyayaVoice: voice-first help for consumer complaints and wrong challans in Hindi and Hinglish. </span>
            <span className="ln1" aria-hidden="true"><span>Bolo. Samjho.</span></span>
            <span className="ln1" aria-hidden="true"><span>Karo.</span></span>
          </h1>
          <RollingLine />
          <p className="lead">
            Consumer ya challan ki pareshani apni zubaan mein kahiye. NyayaVoice official sources dhoondhkar agle kadam aur shikayat ka draft taiyar karta hai.
          </p>
          <div className="cta-row">
            <a className="btn pri mag" href="#how">Explore how it works</a>
          </div>
          <p className="trust"><b></b> Answers grounded in official sources</p>
        </div>
      </div>
      <HeroFlow />
    </section>
  );
}
