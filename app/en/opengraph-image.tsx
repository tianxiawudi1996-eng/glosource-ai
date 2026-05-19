import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GloSource AI — Source Korean Suppliers in 60 Seconds';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function EnOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0D1B2A',
          padding: '64px',
          justifyContent: 'space-between',
        }}
      >
        {/* top: logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            G
          </div>
          <span style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff' }}>
            GloSource AI
          </span>
          <div
            style={{
              marginLeft: '12px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: '#EA580C22',
              border: '1px solid #EA580C66',
              fontSize: '14px',
              color: '#EA580C',
            }}
          >
            Free Trial
          </div>
        </div>

        {/* center: headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '68px',
              fontWeight: '900',
              color: '#ffffff',
              lineHeight: '1.1',
              letterSpacing: '-2px',
            }}
          >
            Source Korean Suppliers in{' '}
            <span style={{ color: '#EA580C' }}>60 Seconds</span>
          </div>
          <div style={{ fontSize: '28px', color: '#94a3b8', fontWeight: '400' }}>
            EC21 · BuyKorea · KOTRA · tradeKorea — AI-powered sourcing
          </div>
        </div>

        {/* bottom: feature tags */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['Up to 3–5 supplier candidates', 'Risk score 0–100', 'Auto RFQ draft'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#ffffff0f',
                border: '1px solid #ffffff1a',
                fontSize: '18px',
                color: '#e2e8f0',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
