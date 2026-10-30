import Demo from './Demo';
import RollingLine from './RollingLine';

export default function Hero() {
  return (
    <section className="hero">
      <div className="ghost" aria-hidden="true">न्याय</div>
      <div className="wrap">
        <div>
          <p className="eyebrow">Early build · Hindi · Hinglish · English</p>
          <h1>
            <span className="sr">NyayaVoice: voice-first help for consumer complaints and wrong challans in Hindi and Hinglish. </span>
            <span className="ln1" aria-hidden="true"><span>Bolo.</span></span>
            <span className="ln1" aria-hidden="true"><span>Samjho.</span></span>
            <span className="ln1" aria-hidden="true"><span>Karo.</span></span>
          </h1>
          <RollingLine />
          <p className="lead">
            Phone defective nikla? Seller refund nahi de raha? Challan galat lag raha hai? Hindi ya Hinglish mein bolo. NyayaVoice official source dhoondhta hai, agle kadam batata hai, shikayat ka draft banata hai aur sunata bhi hai.
          </p>
          <div className="cta-row">
            <a className="btn pri mag" href="#demo">Try the sample demo</a>
            <a className="btn mag" href="#how">See how it works</a>
          </div>
          <p className="trust"><b></b> Voice by Gnani Prisma and Timbre · Answers carry official source links</p>
        </div>
        <Demo />
      </div>
    </section>
  );
}
