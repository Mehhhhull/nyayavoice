import FixNumber from './FixNumber';

export default function Language() {
  return (
    <section className="pad lang" id="language">
      <div className="wrap">
        <p className="eyebrow rv">Bhasha</p>
        <h2 className="rv" style={{ marginTop: 14 }}>Jaise bolte ho, <em>waise hi</em>.</h2>
        <div className="lang-big rv">
          <p><small>Hindi</small><span className="hi" lang="hi">मेरा फ़ोन खराब निकला और विक्रेता रिफंड नहीं दे रहा।</span></p>
          <p><small>Hinglish</small><span lang="hi-Latn">Mera phone kharab nikla, seller refund nahi de raha.</span></p>
          <p><small>English</small><span className="en" lang="en">My phone arrived defective and the seller won’t refund me.</span></p>
        </div>

        <div className="fixbox">
          <div className="rv">
            <p className="eyebrow">Galat suna? Theek karo.</p>
            <h3 style={{ marginTop: 12 }}>Ek galat number poora jawab bigaad deta hai.</h3>
            <p className="lead">
              Speech recognition kabhi price, date ya “nahi” galat sun leta hai. Isliye NyayaVoice advice dene se pehle transcript aapko dikhata hai. Neeche try karo.
            </p>
          </div>
          <FixNumber />
        </div>
      </div>
    </section>
  );
}
