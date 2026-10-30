import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <section className="auth-shell">
      <div className="auth-intro">
        <a className="logo" href="/" aria-label="NyayaVoice home">
          <i className="hi" aria-hidden="true">न्</i>NyayaVoice
        </a>
        <p className="eyebrow">Aapki awaaz. Aapke haq.</p>
        <h1>Welcome <em>back.</em></h1>
        <p>Sign in to continue to your NyayaVoice space.</p>
      </div>
      <div className="auth-panel">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />
        <a className="auth-back" href="/">← Back to NyayaVoice</a>
      </div>
    </section>
  );
}
