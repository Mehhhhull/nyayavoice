import { ImageResponse } from 'next/og';

export const alt = 'NyayaVoice: Bolo. Samjho. Karo.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0D0E0B',
          color: '#F3EEE3',
          padding: 72,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 38 }}>
          <div style={{ width: 22, height: 22, borderRadius: 22, background: '#F2A93B' }} />
          NyayaVoice
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 168, lineHeight: 0.92, letterSpacing: -4 }}>
          <span>Bolo.</span>
          <span>Samjho.</span>
          <span style={{ color: '#F2A93B', fontStyle: 'italic' }}>Karo.</span>
        </div>
        <div style={{ fontSize: 30, color: '#B4AFA1' }}>Voice-first help for consumer complaints in Hindi and Hinglish.</div>
      </div>
    ),
    size,
  );
}
