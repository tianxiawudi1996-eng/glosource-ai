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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "GloSource AI",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "중국·해외 공급자 후보를 AI로 탐색하고 RFQ 초안을 자동 생성하는 B2B 소싱 매칭 도구. 1688, Baidu 爱采购, Alibaba 등 주요 채널을 비교 분석합니다.",
              "url": "https://safedoc-ai.vercel.app",
              "inLanguage": "ko",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "무료 체험",
                  "price": "0",
                  "priceCurrency": "KRW",
                  "description": "5회 무료 탐색"
                },
                {
                  "@type": "Offer",
                  "name": "Starter",
                  "price": "190000",
                  "priceCurrency": "KRW",
                  "billingDuration": "P1M"
                },
                {
                  "@type": "Offer",
                  "name": "Pro",
                  "price": "490000",
                  "priceCurrency": "KRW",
                  "billingDuration": "P1M"
                },
                {
                  "@type": "Offer",
                  "name": "Enterprise",
                  "price": "990000",
                  "priceCurrency": "KRW",
                  "billingDuration": "P1M"
                }
              ],
              "featureList": [
                "1688.com 공장 직거래 소싱",
                "Baidu 爱采购 공급자 탐색",
                "Alibaba 비교 분석",
                "RFQ 영문·중문 자동 생성",
                "신뢰도 0~100점 평가",
                "이미지 제품 인식 (Vision AI)"
              ],
              "publisher": {
                "@type": "Organization",
                "name": "GloSource AI",
                "email": "like2buyglobal@gmail.com"
              }
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50" style={{ fontFamily: "'Pretendard', 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
