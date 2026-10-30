export default function Nav() {
  return (
    <header className="nav">
      <div className="wrap">
        <a className="logo" href="#top" aria-label="NyayaVoice home">
          <i className="hi" aria-hidden="true">न्</i>NyayaVoice
        </a>
        <nav aria-label="Main">
          <ul>
            <li><a href="#how">How it works</a></li>
            <li><a href="#cases">Use cases</a></li>
            <li><a href="#trust">Trust</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>
        <a className="btn sm pri mag" href="#demo">Try the sample</a>
      </div>
    </header>
  );
}
