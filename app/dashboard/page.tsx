import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default function DashboardPage() {
  return (
    <main className="dashboard wrap">
      <header className="dashboard-top">
        <Link className="logo" href="/" aria-label="NyayaVoice home">
          <i className="hi" aria-hidden="true">न्</i>NyayaVoice
        </Link>
        <UserButton />
      </header>
      <section className="dashboard-content">
        <p className="eyebrow">Your NyayaVoice space</p>
        <h1>Your voice.<br /><em>Your rights.</em></h1>
        <p>Your account is ready. The NyayaVoice sample is available while the personalized assistant is being built.</p>
        <div className="cta-row">
          <Link className="btn pri" href="/#demo">Explore the sample</Link>
          <Link className="btn" href="/">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
