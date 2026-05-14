import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GloSource AI — 공급자 후보 60초 매칭';
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
          background: '#0D1B2A',
          padding: '64px',
          justifyContent: 'space-between',
        }}
      >
        {/* 상단: 로고 + 브랜드 */}
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
            Beta
          </div>
        </div>

        {/* 중앙: 메인 카피 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '72px',
              fontWeight: '900',
              color: '#ffffff',
              lineHeight: '1.1',
              letterSpacing: '-2px',
            }}
          >
            공급자 후보{' '}
            <span style={{ color: '#EA580C' }}>60초</span> 매칭
          </div>
          <div style={{ fontSize: '28px', color: '#94a3b8', fontWeight: '400' }}>
            1688 · Baidu 爱采购 · Alibaba · WeChat 동시 비교
          </div>
        </div>

        {/* 하단: 태그들 */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['신뢰도 점수 자동 산출', 'RFQ 영문·중문 자동 작성', '건자재 특화 500+ 카테고리'].map((tag) => (
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
