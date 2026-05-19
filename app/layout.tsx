import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Providers from "@/app/components/Providers";
import { ConsentAnalytics } from "@/app/components/ConsentAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const BASE_URL = "https://glosource-ai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "GloSource AI | 공급자 후보 AI 매칭",
    template: "%s | GloSource AI",
  },
  description: "중국·해외 공급자 후보를 AI로 찾고 RFQ 준비까지. 1688, Baidu 爱采购, Alibaba 동시 비교. 신뢰도 점수·가격·MOQ 한눈에 확인.",
  keywords: "중국소싱, 해외소싱, 공급자후보, RFQ, 1688소싱, Alibaba소싱, 소싱매칭, AI소싱, 건자재소싱, 중국공급자",
  authors: [{ name: "GloSource AI" }],
  creator: "GloSource AI",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "GloSource AI",
    title: "GloSource AI | 공급자 후보 AI 매칭",
    description: "중국·해외 공급자 후보를 AI로 찾고 RFQ 준비까지. 1688, Baidu 爱采购, Alibaba 동시 비교.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "GloSource AI — 공급자 후보 AI 매칭",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GloSource AI | 공급자 후보 AI 매칭",
    description: "중국·해외 공급자 후보를 AI로 찾고 RFQ 준비까지. 1688, Baidu, Alibaba 동시 비교.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GloSource AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "중국·해외 공급자 후보를 AI로 찾고 RFQ 준비까지 돕는 소싱 매칭 도구.",
    url: BASE_URL,
    offers: { "@type": "Offer", priceCurrency: "KRW", price: "9900" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GloSource AI",
    url: BASE_URL,
    email: "glosourceai@gmail.com",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isEnglishRoute = pathname === "/en" || pathname.startsWith("/en/");

  return (
    <html lang={isEnglishRoute ? "en" : "ko"} className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50" style={{ fontFamily: "'Pretendard', 'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
        {!isEnglishRoute && (
          <script
            id="root-json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
          />
        )}
        <Providers>{children}</Providers>
        <ConsentAnalytics />
      </body>
    </html>
  );
}
