'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type JourneyLang = 'ko' | 'en';

type JourneySpot = {
  id: string;
  region: string;
  regionEn: string;
  spot: string;
  spotEn: string;
  image: string;
  ko: string;
  en: string;
  tint: string;
};

const JOURNEY_SPOTS: JourneySpot[] = [
  {
    id: 'seoul',
    region: '서울',
    regionEn: 'Seoul',
    spot: '경복궁',
    spotEn: 'Gyeongbokgung',
    image: '/images/korea-journey/seoul-gyeongbokgung.png',
    ko: '단청과 봄빛이 만나는 시작점',
    en: 'Where dancheong meets the first light of the journey',
    tint: '#D5A84B',
  },
  {
    id: 'gyeongju',
    region: '경주',
    regionEn: 'Gyeongju',
    spot: '불국사',
    spotEn: 'Bulguksa Temple',
    image: '/images/korea-journey/gyeongju-bulguksa.png',
    ko: '천년의 돌계단과 고요한 숲',
    en: 'A thousand years in stone steps and pine shade',
    tint: '#A7C9A0',
  },
  {
    id: 'jeonju',
    region: '전주',
    regionEn: 'Jeonju',
    spot: '한옥마을',
    spotEn: 'Hanok Village',
    image: '/images/korea-journey/jeonju-hanok.png',
    ko: '기와의 곡선과 느린 골목의 온기',
    en: 'Curved rooflines and the warmth of a slower lane',
    tint: '#C78A55',
  },
  {
    id: 'busan',
    region: '부산',
    regionEn: 'Busan',
    spot: '감천문화마을',
    spotEn: 'Gamcheon Culture Village',
    image: '/images/korea-journey/busan-gamcheon.png',
    ko: '산과 바다가 겹쳐지는 색의 도시',
    en: 'A city of color where mountain and sea overlap',
    tint: '#69B8C2',
  },
  {
    id: 'gangwon',
    region: '강원',
    regionEn: 'Gangwon',
    spot: '설악산',
    spotEn: 'Seoraksan',
    image: '/images/korea-journey/gangwon-seoraksan.png',
    ko: '소나무 사이로 솟은 가을의 바위',
    en: 'Autumn granite rising through Korean pine',
    tint: '#D98253',
  },
  {
    id: 'jeju',
    region: '제주',
    regionEn: 'Jeju',
    spot: '성산일출봉',
    spotEn: 'Seongsan Ilchulbong',
    image: '/images/korea-journey/jeju-seongsan.png',
    ko: '푸른 바다에서 다시 만나는 아침',
    en: 'A new morning rising from the blue coast',
    tint: '#7BC7D9',
  },
];

const EN_JOURNEY_SPOTS = JOURNEY_SPOTS.filter(({ id }) => ['seoul', 'busan', 'jeju'].includes(id));

const COPY = {
  ko: {
    eyebrow: 'Korea, in one scroll · 대한민국 한 바퀴',
    title: '경복궁에서 제주까지,\n한국의 결을 따라가세요',
    description: '한 장면에 머물지 않습니다. 지역마다 다른 빛·재료·속도를 담아, 화면을 내려가는 동안 대한민국을 천천히 여행하는 감각을 만듭니다.',
    note: '실제 명소를 기반으로 한 GloSource AI 브랜드 에디토리얼 이미지입니다. 관광 정보나 위치 인증을 대신하지 않습니다.',
    route: 'SEOUL · GYEONGJU · JEONJU · BUSAN · GANGWON · JEJU',
    previous: '이전 장면',
    next: '다음 장면',
  },
  en: {
    eyebrow: 'Korea, in one scroll · 한국의 결',
    title: 'From Gyeongbokgung to Jeju,\nfollow the texture of Korea',
    description: 'The landing page does not stay in one scene. Each stop carries a different light, material, and pace — a visual journey around Korea before the buyer starts a sourcing project.',
    note: 'GloSource AI editorial imagery based on real landmarks. It is brand storytelling, not tourism or location verification.',
    route: 'SEOUL · GYEONGJU · JEONJU · BUSAN · GANGWON · JEJU',
    previous: 'Previous scene',
    next: 'Next scene',
  },
};

export default function KoreaJourneySection({ lang = 'ko' }: { lang?: JourneyLang }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const copy = COPY[lang];
  const journeySpots = lang === 'en' ? EN_JOURNEY_SPOTS : JOURNEY_SPOTS;
  const route = lang === 'en' ? 'SEOUL · BUSAN · JEJU' : copy.route;

  useEffect(() => {
    if (lang === 'en') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % journeySpots.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [journeySpots.length, lang]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector<HTMLElement>(`[data-journey-card="${journeySpots[activeIndex].id}"]`);
    if (!scroller || !card) return;

    const left = card.offsetLeft - Math.max(0, (scroller.clientWidth - card.offsetWidth) / 2);
    scroller.scrollTo({
      left: Math.max(0, left),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [activeIndex, journeySpots]);

  const goTo = (index: number) => {
    setActiveIndex((index + journeySpots.length) % journeySpots.length);
  };

  return (
    <section
      className="gs-korea-journey overflow-hidden border-b border-slate-200 bg-[#F5F0E8]"
      data-lang={lang}
      data-style-dna="heritage-journey"
      data-cultural-density={lang === 'en' ? 'restrained' : 'expressive'}
      data-journey-count={journeySpots.length}
      aria-labelledby="korea-journey-title"
    >
      <div className={`mx-auto max-w-6xl px-6 ${lang === 'en' ? 'py-12 sm:py-14' : 'py-20 sm:py-24'}`}>
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div className="gs-journey-heading max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8F3A26]">{copy.eyebrow}</p>
            <span className="gs-journey-ornament" aria-hidden="true"><i /><i /><i /></span>
            <h2 id="korea-journey-title" className="mt-4 whitespace-pre-line font-display text-3xl font-black leading-[1.08] tracking-tight text-[#0D1B2A] sm:text-4xl lg:text-[2.7rem]">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">{copy.description}</p>
            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                aria-label={copy.previous}
                className="gs-journey-arrow"
                onClick={() => goTo(activeIndex - 1)}
              >
                ←
              </button>
              <div className="gs-journey-progress flex items-center gap-1.5" aria-label={`${activeIndex + 1} / ${journeySpots.length}`}>
                {journeySpots.map((spot, index) => (
                  <button
                    key={spot.id}
                    type="button"
                    aria-label={lang === 'ko' ? `${spot.region} 장면 보기` : `View ${spot.regionEn} scene`}
                    aria-pressed={activeIndex === index}
                    className="gs-journey-dot"
                    data-active={activeIndex === index ? 'true' : 'false'}
                    style={{ '--journey-tint': spot.tint } as React.CSSProperties}
                    onClick={() => goTo(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={copy.next}
                className="gs-journey-arrow"
                onClick={() => goTo(activeIndex + 1)}
              >
                →
              </button>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="gs-journey-route" aria-hidden="true">
              <span className="gs-journey-route-line" />
              <span>{route}</span>
            </div>
            <div ref={scrollerRef} className="gs-journey-scroller" role="region" aria-label={lang === 'ko' ? '대한민국 지역 명소 장면' : 'Korean regional landmark scenes'}>
              {journeySpots.map((spot, index) => (
                <button
                  key={spot.id}
                  type="button"
                  className="gs-journey-card"
                  data-journey-card={spot.id}
                  data-active={activeIndex === index ? 'true' : 'false'}
                  aria-pressed={activeIndex === index}
                  onClick={() => goTo(index)}
                >
                  <Image
                    src={spot.image}
                    alt={`${spot.region} ${spot.regionEn} · ${spot.spot} ${spot.spotEn}`}
                    fill
                    sizes="(min-width: 1280px) 360px, (min-width: 768px) 34vw, 76vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                  <span className="gs-journey-card-wash" aria-hidden="true" />
                  <span className="gs-journey-card-copy">
                    <span className="gs-journey-card-region">{lang === 'ko' ? spot.region : spot.regionEn}</span>
                    <span className="gs-journey-card-title">{lang === 'ko' ? spot.spot : spot.spotEn}</span>
                    <span className="gs-journey-card-bilingual">{lang === 'ko' ? `${spot.spot} · ${spot.spotEn}` : `${spot.spotEn} · ${spot.spot}`}</span>
                    <span className="gs-journey-card-note">{lang === 'ko' ? spot.ko : spot.en}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">{copy.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
