import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafeDoc AI | 건설 현장 안전교육 자료 자동 생성",
  description: "산업안전보건법 제29조 기준 법정 안전교육 자료를 AI가 2분 만에 자동 생성. PPT 스크립트, 퀴즈, 출석부, 이수확인서 PDF 즉시 출력.",
  keywords: "안전교육, 건설현장, 산업안전보건법, 교육자료, AI자동생성",
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
