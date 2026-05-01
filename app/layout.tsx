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
  description: "해외 공장 직발주, 이제 안전하게 시작하세요. AI가 Alibaba·Made-in-China에서 검증된 공급자를 탐색하고 신뢰도를 한국어로 분석합니다. RFQ 이메일 자동 생성.",
  keywords: "해외소싱, 공급자검증, 글로벌소싱, 수입직발주, AI소싱에이전트, 알리바바검증, 중국공장직거래",
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
      </head>
      <body className="min-h-full flex flex-col bg-slate-50" style={{ fontFamily: "'Pretendard', 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
