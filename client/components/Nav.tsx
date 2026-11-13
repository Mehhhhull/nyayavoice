import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Suspense } from 'react';

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
          <Suspense fallback={null}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="btn sm">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn sm pri">Sign up</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <a className="btn sm" href="/dashboard">Dashboard</a>
              <UserButton />
            </Show>
          </Suspense>
        </div>
      </div>
    </header>
  );
}
