import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <section className="auth-shell">
      <div className="auth-intro">
        <a className="logo" href="/" aria-label="NyayaVoice home">
          <i className="hi" aria-hidden="true">न्</i>NyayaVoice
        </a>
        <p className="eyebrow">Aapki awaaz. Aapke haq.</p>
        <h1>Make your voice <em>heard.</em></h1>
        <p>Create an account to keep your NyayaVoice space ready for what comes next.</p>
      </div>
      <div className="auth-panel">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
        <a className="auth-back" href="/">← Back to NyayaVoice</a>
      </div>
    </section>
  );
}
