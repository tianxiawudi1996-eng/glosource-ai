/**
 * Hunminjeongeum Haerye-style Hangul glyphs, drawn as SVG.
 * The 1446 Haerye edition wrote vowel strokes as round dots (ㅏ = ㅣ + ●,
 * ㅗ = ㅡ + ●, and the lost letters ㆍ 아래아 / ㆁ 옛이응) — web fonts cannot
 * compose those archaic syllables reliably, so each block is drawn by hand.
 * Decorative only: every use is aria-hidden with the modern label alongside.
 *
 * Every stroked shape carries pathLength={1} so a single dashoffset sweep can
 * write it at a uniform rate; children are ordered by stroke order (획순) so a
 * per-child delay reproduces how the glyph is actually written by hand.
 * See .gs-glyph-draw in globals.css.
 */

interface GlyphProps {
  char: 'hwa' | 'sik' | 'pae' | 'ui' | 'geon' | 'yak' | 'oe' | 'pum' | 'geom' | 'jeung';
  className?: string;
}

const SW = 8.5; // uniform Haerye stroke (bolder, brush-like)

type StrokeProps = { d: string };
const Stroke = ({ d }: StrokeProps) => <path d={d} pathLength={1} />;

type RingProps = { cx: number; cy: number; r: number };
const Ring = ({ cx, cy, r }: RingProps) => <circle cx={cx} cy={cy} r={r} pathLength={1} />;

type BoxProps = { x: number; y: number; width: number; height: number };
const Box = ({ x, y, width, height }: BoxProps) => (
  <rect x={x} y={y} width={width} height={height} pathLength={1} />
);

/* Filled Haerye vowel dot — brushed on, not drawn. */
function Dot({ cx, cy }: { cx: number; cy: number }) {
  return <circle className="gs-yet-dot" cx={cx} cy={cy} r={7.5} fill="currentColor" stroke="none" />;
}

/* 화(化) — ㅎ over ㅗ (호), with ㅏ pulled close on the right = 화 */
const Hwa = (
  <>
    {/* ㅎ — top tick, bar, ring (compact) */}
    <Stroke d="M25 8 H43" />
    <Stroke d="M16 20 H52" />
    <Ring cx={34} cy={35} r={11} />
    {/* ㅗ — dot + bar directly under ㅎ */}
    <Dot cx={34} cy={54} />
    <Stroke d="M14 68 H54" />
    {/* ㅏ — tall stem close to the block, round dot */}
    <Stroke d="M70 8 V88" />
    <Dot cx={84} cy={46} />
  </>
);

/* 식(食) — ㅅ + ㅣ + ㄱ */
const Sik = (
  <>
    <Stroke d="M32 10 L14 42" />
    <Stroke d="M32 10 L50 42" />
    <Stroke d="M70 8 V50" />
    <Stroke d="M14 64 H80 V90" />
  </>
);

/* 패 — ㅍ + ㅐ(ㅏ with round Haerye dot + ㅣ) */
const Pae = (
  <>
    {/* ㅍ */}
    <Stroke d="M8 24 H44" />
    <Stroke d="M8 56 H44" />
    <Stroke d="M19 24 V56" />
    <Stroke d="M33 24 V56" />
    {/* ㅐ = ㅏ(stem + right dot) + ㅣ */}
    <Stroke d="M60 8 V80" />
    <Dot cx={73} cy={44} />
    <Stroke d="M87 8 V80" />
  </>
);

/* 의(醫) — ㆁ 옛이응(stemmed ring) + ㅡ + ㅣ */
const Ui = (
  <>
    <Stroke d="M32 8 V16" />
    <Ring cx={32} cy={32} r={15} />
    <Stroke d="M10 62 H54" />
    <Stroke d="M78 8 V88" />
  </>
);

/* 건(健) — ㄱ + ㅓ(stem + left round dot) + ㄴ */
const Geon = (
  <>
    {/* ㄱ */}
    <Stroke d="M12 12 H40 V30" />
    {/* ㅓ — tall stem with the round dot clearly to its left */}
    <Stroke d="M68 6 V50" />
    <Dot cx={50} cy={28} />
    {/* ㄴ */}
    <Stroke d="M12 56 V86 H74" />
  </>
);

/* 약(藥) — ㅇ + ㅑ(two right dots) + ㄱ */
const Yak = (
  <>
    <Ring cx={28} cy={26} r={13} />
    <Stroke d="M62 6 V52" />
    <Dot cx={78} cy={19} />
    <Dot cx={78} cy={39} />
    <Stroke d="M14 66 H78 V90" />
  </>
);

/* 외(外) — ㅇ + ㅗ(dot above bar) + ㅣ */
const Oe = (
  <>
    <Ring cx={30} cy={26} r={14} />
    <Dot cx={30} cy={54} />
    <Stroke d="M8 68 H52" />
    <Stroke d="M78 8 V88" />
  </>
);

/* 품(品) — ㅍ + ㅜ(dot below bar) + ㅁ */
const Pum = (
  <>
    <Stroke d="M26 10 H70" />
    <Stroke d="M26 32 H70" />
    <Stroke d="M38 10 V32" />
    <Stroke d="M58 10 V32" />
    <Stroke d="M14 48 H82" />
    <Dot cx={48} cy={60} />
    <Box x={28} y={70} width={40} height={22} />
  </>
);

/* 검(檢) — ㄱ + ㅓ + ㅁ */
const Geom = (
  <>
    <Stroke d="M16 12 H44 V32" />
    <Dot cx={55} cy={24} />
    <Stroke d="M72 6 V48" />
    <Box x={26} y={60} width={42} height={28} />
  </>
);

/* 증(證) — ㅈ + ㅡ + ㅇ */
const Jeung = (
  <>
    <Stroke d="M16 10 H48" />
    <Stroke d="M32 10 L18 32" />
    <Stroke d="M32 10 L46 32" />
    <Stroke d="M12 46 H84" />
    <Ring cx={48} cy={71} r={15} />
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
