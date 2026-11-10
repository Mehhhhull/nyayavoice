const ROWS: [string, string][] = [
  ['Mostly text', 'Voice-first, Hindi and Hinglish'],
  ['Seedha jawab de deta hai', 'Pehle zaroori missing facts poochta hai'],
  ['Model ki yaadasht se bolta hai', 'Official sources dhoondhta hai aur link dikhata hai'],
  ['Jawab ke saath khatam', 'Complaint draft aur evidence checklist deta hai'],
  ['Maan leta hai ki usne sahi suna', 'Transcript dikhata hai, aap theek kar sakte ho'],
  ['Har baat ek jaise bharose se', 'Evidence kam ho to saaf kehta hai “verify nahi kar paya”'],
];

export default function Compare() {
  return (
    <section className="pad" id="compare" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <p className="eyebrow rv">Alag kyun hai</p>
        <h2 className="rv" style={{ marginTop: 14 }}>Yeh <em>legal chatbot</em> nahi hai.</h2>
        <p className="lead rv" style={{ marginTop: 18 }}>
          Chatbot sawaal ka jawab deta hai. NyayaVoice aapko uljhi hui problem se ek verified agle kadam tak le jaata hai.
        </p>
        <div className="cmp-wrap rv">
          <table className="cmp">
            <thead>
              <tr>
                <th scope="col">Generic legal chatbot</th>
                <th scope="col">NyayaVoice</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([a, b]) => (
                <tr key={a}>
                  <td>{a}</td>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
