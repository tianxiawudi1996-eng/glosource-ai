/**
 * Hunminjeongeum Haerye-style Hangul glyphs, drawn as SVG.
 * The 1446 Haerye edition wrote vowel strokes as round dots (ㅏ = ㅣ + ●,
 * ㅗ = ㅡ + ●, and the lost letters ㆍ 아래아 / ㆁ 옛이응) — web fonts cannot
 * compose those archaic syllables reliably, so each block is drawn by hand.
 * Decorative only: every use is aria-hidden with the modern label alongside.
 */

interface GlyphProps {
  char: 'hwa' | 'sik' | 'pae' | 'ui' | 'geon' | 'yak' | 'geom' | 'jeung';
  className?: string;
}

const SW = 7; // uniform Haerye stroke

function Dot({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={6.5} fill="currentColor" stroke="none" />;
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

/* ᄑᆡ — ㅍ + ㆎ(아래아 ㆍ + ㅣ): the archaic diphthong of 패 */
const Pae = (
  <>
    <path d="M12 22 H50" />
    <path d="M12 58 H50" />
    <path d="M23 22 V58" />
    <path d="M39 22 V58" />
    <Dot cx={64} cy={40} />
    <path d="M82 10 V72" />
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

/* 건(健) — ㄱ + ㅓ(left dot) + ㄴ */
const Geon = (
  <>
    <path d="M14 12 H44 V32" />
    <Dot cx={56} cy={26} />
    <path d="M72 8 V48" />
    <path d="M14 58 V86 H74" />
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
  hwa: Hwa, sik: Sik, pae: Pae, ui: Ui, geon: Geon, yak: Yak, geom: Geom, jeung: Jeung,
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
