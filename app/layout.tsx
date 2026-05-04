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
      </head>
      <body className="min-h-full flex flex-col bg-slate-50" style={{ fontFamily: "'Pretendard', 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
