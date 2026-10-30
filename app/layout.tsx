import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { DM_Mono, Hanken_Grotesk, Instrument_Serif, Noto_Sans_Devanagari, Tiro_Devanagari_Hindi } from 'next/font/google';
import { SITE_URL } from '@/lib/data';
import './globals.css';

const display = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const mono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const deva = Noto_Sans_Devanagari({ subsets: ['devanagari', 'latin'], variable: '--font-deva', display: 'swap' });
const devaDisplay = Tiro_Devanagari_Hindi({ weight: '400', style: ['normal', 'italic'], subsets: ['devanagari', 'latin'], variable: '--font-deva-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'NyayaVoice',
  description:
    'NyayaVoice helps you handle a defective product, a refund refusal or a wrong challan. Speak in Hindi or Hinglish, get official next steps, a complaint draft and a spoken answer.',
  keywords: [
    'refund nahi mil raha kya kare',
    'defective product complaint kaise kare',
    'consumer helpline 1915',
    'challan galat hai kaise check kare',
    'e-challan dispute process',
    'online shopping complaint India',
  ],
  alternates: { canonical: '/', languages: { 'en-IN': '/', 'hi-IN': '/' } },
  openGraph: {
    title: 'NyayaVoice: bolkar apne consumer aur challan rights samjho',
    description: 'Speak your problem in Hindi or Hinglish. Get official sources, an evidence checklist and a complaint draft.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'NyayaVoice',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#0D0E0B',
  colorScheme: 'dark',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${mono.variable} ${deva.variable} ${devaDisplay.variable}`}>
      <body>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#F2A93B',
              colorPrimaryForeground: '#1A1204',
              colorForeground: '#F3EEE3',
              colorMutedForeground: '#B4AFA1',
              colorBackground: '#14150F',
              colorInput: '#0D0E0B',
              colorInputForeground: '#F3EEE3',
              colorBorder: '#2B2C24',
              borderRadius: '14px',
              fontFamily: 'var(--body)',
            },
            elements: {
              card: 'auth-card',
              headerTitle: 'auth-title',
              headerSubtitle: 'auth-subtitle',
              formButtonPrimary: 'auth-primary-button',
              socialButtonsBlockButton: 'auth-social-button',
              formFieldLabel: 'auth-label',
              formFieldInput: 'auth-input',
              footerActionLink: 'auth-link',
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
