import { Show, UserButton } from '@clerk/nextjs';

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
        <div className="nav-actions">
          <a className="btn sm pri nav-sample" href="#demo">Try the sample</a>
          <Show when="signed-out">
            <a className="nav-sign-in" href="/sign-in">Sign in</a>
            <a className="btn sm" href="/sign-up">Get started</a>
          </Show>
          <Show when="signed-in">
            <a className="btn sm pri" href="/dashboard">My account</a>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
