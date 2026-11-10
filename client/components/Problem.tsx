import Converge from './Converge';

export default function Problem() {
  return (
    <section className="pad" id="problem">
      <div className="wrap prob">
        <div>
          <p className="eyebrow rv">Problem</p>
          <h2 className="rv" style={{ marginTop: 14 }}>Rules publish ho chuke hain. Bas <em>dhoondhna</em> mushkil hai.</h2>
          <p className="lead rv">
            Consumer helpline ek site par, challan portal doosri par, Act ka text teesri par aur woh bhi vakeelon ki bhasha mein. Zyada log shikayat shuru karne se pehle hi thak jaate hain.
          </p>
          <p className="hi hi-line rv">Aap bas boliye. Baaki dhoondhna hamara kaam.</p>
        </div>
        <Converge />
      </div>
    </section>
  );
}
