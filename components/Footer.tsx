import { LINKS } from '@/lib/data';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="links">
          <a href={LINKS.helpline} target="_blank" rel="noopener noreferrer">National Consumer Helpline</a>
          <a href={LINKS.echallan} target="_blank" rel="noopener noreferrer">eChallan portal</a>
          <a href={LINKS.act} target="_blank" rel="noopener noreferrer">Consumer Protection Act, 2019</a>
        </div>
        <p>
          NyayaVoice general legal information deta hai, legal advice ya kisi nateeje ki guarantee nahi. Hamesha official channel se verify karo. NyayaVoice kisi sarkari sanstha se juda nahi hai. Early build, Gnani AI Great Indian AI Internship Challenge 2026 ke liye. Page par dikhaya gaya demo sample data par chalta hai.
        </p>
      </div>
    </footer>
  );
}
