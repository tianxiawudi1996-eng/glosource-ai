/**
 * Hand-drawn traditional Korean ornaments (all public-domain motifs, no assets):
 *  - GiwaEaves: the scalloped silhouette of layered roof tiles (기와 처마) used
 *    as a section transition — two staggered runs of tile-ends for depth.
 *  - SaekdongBand: the striped sleeve trim of children's hanbok (색동) as a
 *    thin obangsaek-derived band, muted for a premium read.
 *  - DancheongBand: a simplified 머리초 dancheong border — alternating lotus
 *    petals and dots on a dark ground.
 *  - SumaksaeRosette: the lotus roof-end tile (연꽃 수막새) as a numbered medallion.
 * Decorative only — every ornament is aria-hidden.
 */

/* 기와 처마 — overlapping tile-end arcs; color via currentColor, sits on the
   FOLLOWING section's background and is colored like the PRECEDING section. */
export function GiwaEaves({ className, flip = false }: { className?: string; flip?: boolean }) {
  const arcs: React.ReactNode[] = [];
  for (let i = 0; i < 30; i++) {
    // back run (offset half-pitch, slightly taller)
    arcs.push(<path key={`b${i}`} d={`M${i * 48 - 24} 20 a24 24 0 0 1 48 0 v-20 h-48 Z`} opacity={0.45} />);
  }
  for (let i = 0; i < 30; i++) {
    // front run
    arcs.push(<path key={`f${i}`} d={`M${i * 48} 26 a24 24 0 0 1 48 0 v-26 h-48 Z`} />);
    // tile-end disc (수막새) shadow dot
    arcs.push(<circle key={`d${i}`} cx={i * 48 + 24} cy={22} r={3.5} opacity={0.35} fill="#FFFFFF" stroke="none" />);
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 28"
      preserveAspectRatio="none"
      className={`${className ?? ''} ${flip ? 'rotate-180' : ''} block w-full`}
      fill="currentColor"
    >
      {arcs}
    </svg>
  );
}

/* 색동 — muted obangsaek family, aged like mineral pigment on wood */
const SAEKDONG = ['#8F3A26', '#B9782E', '#B89A4A', '#2F604B', '#244B63', '#4B3E54'];
export function SaekdongBand({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-1.5 w-full ${className ?? ''}`}>
      {SAEKDONG.map(c => (
        <span key={c} className="h-full flex-1" style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}

/* 단청 머리초 — restrained lotus/meander border on dark green-black ground */
export function DancheongBand({ className }: { className?: string }) {
  const units: React.ReactNode[] = [];
  for (let i = 0; i < 48; i++) {
    const x = i * 30;
    if (i % 2 === 0) {
      units.push(<path key={`p${i}`} d={`M${x + 15} 3 Q${x + 27} 10 ${x + 15} 17 Q${x + 3} 10 ${x + 15} 3 Z`} fill="#8F3A26" opacity={0.92} />);
      units.push(<path key={`pi${i}`} d={`M${x + 15} 6.5 Q${x + 21} 10 ${x + 15} 13.5 Q${x + 9} 10 ${x + 15} 6.5 Z`} fill="#B9782E" opacity={0.9} />);
      units.push(<circle key={`pd${i}`} cx={x + 15} cy={10} r={1.8} fill="#D7BF73" opacity={0.85} />);
    } else {
      units.push(<path key={`m${i}`} d={`M${x + 4} 10 H${x + 10} V5 H${x + 20} V15 H${x + 26}`} fill="none" stroke="#2F604B" strokeWidth={1.4} opacity={0.9} />);
      units.push(<circle key={`c${i}`} cx={x + 15} cy={10} r={2.2} fill="#244B63" />);
      units.push(<circle key={`co${i}`} cx={x + 15} cy={10} r={5.5} fill="none" stroke="#B89A4A" strokeWidth={0.9} opacity={0.7} />);
    }
  }
  return (
    <div aria-hidden="true" className={`bg-[#07130F] ${className ?? ''}`}>
      <svg viewBox="0 0 1440 20" preserveAspectRatio="xMidYMid slice" className="block h-5 w-full">
        <rect x={0} y={0} width={1440} height={20} fill="#07130F" />
        <line x1={0} y1={1} x2={1440} y2={1} stroke="#B89A4A" strokeWidth={0.8} opacity={0.55} />
        <line x1={0} y1={4} x2={1440} y2={4} stroke="#203F35" strokeWidth={0.7} opacity={0.75} />
        {units}
        <line x1={0} y1={16} x2={1440} y2={16} stroke="#203F35" strokeWidth={0.7} opacity={0.75} />
        <line x1={0} y1={19} x2={1440} y2={19} stroke="#B89A4A" strokeWidth={0.8} opacity={0.55} />
      </svg>
    </div>
  );
}

/* 연꽃 수막새 — lotus roof-end medallion, with a slot for the step number */
export function SumaksaeRosette({ label, className }: { label: string; className?: string }) {
  const petals: React.ReactNode[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 * Math.PI) / 180;
    const cx = 48 + Math.cos(a) * 26;
    const cy = 48 + Math.sin(a) * 26;
    const deg = i * 45 + 90;
    petals.push(
      <ellipse key={i} cx={cx} cy={cy} rx={7.5} ry={13} transform={`rotate(${deg} ${cx} ${cy})`} />
    );
  }
  return (
    <span className={`relative inline-flex items-center justify-center ${className ?? ''}`}>
      <svg aria-hidden="true" viewBox="0 0 96 96" className="absolute inset-0 h-full w-full opacity-40" fill="none" stroke="currentColor" strokeWidth={3}>
        <circle cx={48} cy={48} r={45} strokeWidth={4} />
        {petals}
        <circle cx={48} cy={48} r={15} />
      </svg>
      <span className="font-display relative text-2xl font-black">{label}</span>
    </span>
  );
}
