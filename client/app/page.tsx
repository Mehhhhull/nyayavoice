import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Problem from '@/components/Problem';
import How from '@/components/How';
import Compare from '@/components/Compare';
import Cases from '@/components/Cases';
import Language from '@/components/Language';
import Trust from '@/components/Trust';
import Faq from '@/components/Faq';
import Final from '@/components/Final';
import Footer from '@/components/Footer';
import Effects from '@/components/Effects';
import { FAQ } from '@/lib/data';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'NyayaVoice',
      description: 'Voice-first Indian consumer-rights assistant for Hindi and Hinglish speakers.',
      inLanguage: ['hi-IN', 'en-IN'],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'NyayaVoice',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      description: 'Speak a consumer problem in Hindi or Hinglish, get official sources, next steps, an evidence checklist and a complaint draft, read aloud.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main id="top">
        <Hero />
        <Marquee />
        <Problem />
        <How />
        <Compare />
        <Cases />
        <Language />
        <Trust />
        <Faq />
        <Final />
      </main>
      <Footer />
      <Effects />
    </>
  );
}
