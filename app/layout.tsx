import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GloSource AI | AI 글로벌 소싱 에이전트",
  description: "중국·해외 공급자 후보를 빠르게 찾고 RFQ 준비까지 돕는 AI 소싱 매칭 도구입니다. 1688, Baidu 爱采购, Alibaba 등 주요 채널을 비교해 발주 전 판단 자료를 정리합니다.",
  keywords: "중국소싱, 해외소싱, 공급자후보, RFQ, 1688소싱, Baidu爱采购, Alibaba소싱, 소싱매칭, AI소싱",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GloSource AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "중국·해외 공급자 후보를 빠르게 찾고 RFQ 준비까지 돕는 AI 소싱 매칭 도구입니다.",
    offers: {
      "@type": "Offer",
      priceCurrency: "KRW",
      price: "190000",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GloSource AI",
    url: "https://glosource-ai.vercel.app/",
    email: "like2buyglobal@gmail.com",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "GloSource AI가 납품까지 대행하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "아니요. 공급자 후보 발굴, 비교 분석, RFQ 준비까지 지원하며 거래 실행과 납품은 사용자가 직접 판단합니다.",
        },
      },
      {
        "@type": "Question",
        name: "어떤 채널을 분석하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "1688, Baidu 爱采购, Alibaba, Made-in-China, Global Sources, WeChat 등 주요 소싱 채널을 비교합니다.",
        },
      },
      {
        "@type": "Question",
        name: "RFQ도 작성해주나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "네. 제품 사양, MOQ, 샘플, 포장, 결제조건, 리드타임 확인 질문을 영문·중문 RFQ 형태로 정리합니다.",
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50" style={{ fontFamily: "'Pretendard', 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        {children}
      </body>
    </html>
  );
}
