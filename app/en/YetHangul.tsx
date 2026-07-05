/**
 * Hunminjeongeum Haerye-style Hangul glyphs, drawn as SVG.
 * The 1446 Haerye edition wrote vowel strokes as round dots (ㅏ = ㅣ + ●,
 * ㅗ = ㅡ + ●, and the lost letters ㆍ 아래아 / ㆁ 옛이응) — web fonts cannot
 * compose those archaic syllables reliably, so each block is drawn by hand.
 * Decorative only: every use is aria-hidden with the modern label alongside.
 */

interface GlyphProps {
  char: 'hwa' | 'sik' | 'pae' | 'ui' | 'geon' | 'yak' | 'oe' | 'pum' | 'geom' | 'jeung';
  className?: string;
}

const SW = 8.5; // uniform Haerye stroke (bolder, brush-like)

function Dot({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={7.5} fill="currentColor" stroke="none" />;
}

/* 화(化) — ㅎ + ㅗ(dot above bar) + ㅏ(bar with right dot) */
const Hwa = (
  <>
    <path d="M23 9 H41" />
    <path d="M14 21 H50" />
    <circle cx={32} cy={37} r={12} />
    <Dot cx={32} cy={57} />
    <path d="M10 71 H54" />
    <path d="M74 8 V88" />
    <Dot cx={88} cy={48} />
  </>
);

/* 식(食) — ㅅ + ㅣ + ㄱ */
const Sik = (
  <>
    <path d="M32 10 L14 42" />
    <path d="M32 10 L50 42" />
    <path d="M70 8 V50" />
    <path d="M14 64 H80 V90" />
  </>
);

/* 패 — ㅍ + ㅐ(ㅏ with round Haerye dot + ㅣ) */
const Pae = (
  <>
    {/* ㅍ */}
    <path d="M8 24 H44" />
    <path d="M8 56 H44" />
    <path d="M19 24 V56" />
    <path d="M33 24 V56" />
    {/* ㅐ = ㅏ(stem + right dot) + ㅣ */}
    <path d="M60 8 V80" />
    <Dot cx={73} cy={44} />
    <path d="M87 8 V80" />
  </>
);

/* 의(醫) — ㆁ 옛이응(stemmed ring) + ㅡ + ㅣ */
const Ui = (
  <>
    <path d="M32 8 V16" />
    <circle cx={32} cy={32} r={15} />
    <path d="M10 62 H54" />
    <path d="M78 8 V88" />
  </>
);

/* 건(健) — ㄱ + ㅓ(stem + left round dot) + ㄴ */
const Geon = (
  <>
    {/* ㄱ */}
    <path d="M12 12 H40 V30" />
    {/* ㅓ — tall stem with the round dot clearly to its left */}
    <path d="M68 6 V50" />
    <Dot cx={50} cy={28} />
    {/* ㄴ */}
    <path d="M12 56 V86 H74" />
  </>
);

/* 약(藥) — ㅇ + ㅑ(two right dots) + ㄱ */
const Yak = (
  <>
    <circle cx={28} cy={26} r={13} />
    <path d="M62 6 V52" />
    <Dot cx={78} cy={19} />
    <Dot cx={78} cy={39} />
    <path d="M14 66 H78 V90" />
  </>
);

/* 외(外) — ㅇ + ㅗ(dot above bar) + ㅣ */
const Oe = (
  <>
    <circle cx={30} cy={26} r={14} />
    <Dot cx={30} cy={54} />
    <path d="M8 68 H52" />
    <path d="M78 8 V88" />
  </>
);

/* 품(品) — ㅍ + ㅜ(dot below bar) + ㅁ */
const Pum = (
  <>
    <path d="M26 10 H70" />
    <path d="M26 32 H70" />
    <path d="M38 10 V32" />
    <path d="M58 10 V32" />
    <path d="M14 48 H82" />
    <Dot cx={48} cy={60} />
    <rect x={28} y={70} width={40} height={22} />
  </>
);

/* 검(檢) — ㄱ + ㅓ + ㅁ */
const Geom = (
  <>
    <path d="M16 12 H44 V32" />
    <Dot cx={55} cy={24} />
    <path d="M72 6 V48" />
    <rect x={26} y={60} width={42} height={28} />
  </>
);

/* 증(證) — ㅈ + ㅡ + ㅇ */
const Jeung = (
  <>
    <path d="M16 10 H48" />
    <path d="M32 10 L18 32" />
    <path d="M32 10 L46 32" />
    <path d="M12 46 H84" />
    <circle cx={48} cy={71} r={15} />
  </>
);

const GLYPHS: Record<GlyphProps['char'], React.ReactNode> = {
  hwa: Hwa, sik: Sik, pae: Pae, ui: Ui, geon: Geon, yak: Yak, oe: Oe, pum: Pum, geom: Geom, jeung: Jeung,
};

export default function YetGlyph({ char, className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={SW}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS[char]}
    </svg>
  );
}
