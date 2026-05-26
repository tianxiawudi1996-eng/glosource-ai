import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // 관리·계정·결제 — 인덱싱 의미 X
          '/admin',
          '/api/',
          '/dashboard',
          '/billing',
          '/account',
          // 다국어 (Korean version 미공개 + 영문 자식)
          '/en/dashboard',
          '/en/billing',
          '/en/reset-password',
          // 보안 페이지 (auth callback·token 등)
          '/auth/',
          '/.well-known/',
        ],
      },
      // AI 학습 크롤러 명시 차단 (옵션 — 콘텐츠 보호)
      // GPTBot, ClaudeBot 등은 robots를 존중하므로 명시
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: 'https://glosource-ai.vercel.app/sitemap.xml',
    host: 'https://glosource-ai.vercel.app',
  };
}
