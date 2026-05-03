import type { ReactNode } from 'react';

export type GlyphKey =
  | 'rebar' | 'steelPipe' | 'hBeam' | 'steelSheet' | 'galvCoil'
  | 'angleSteel' | 'wireMesh' | 'steelStud' | 'castPipe' | 'deckPlate'
  | 'windowFrame' | 'aluExtrusion' | 'aluSheet' | 'curtainWall' | 'solarFrame'
  | 'aluRoof' | 'acpPanel' | 'aluTube' | 'louver' | 'dieCast'
  | 'cementBag' | 'conBlock' | 'rcPipe' | 'precastPanel' | 'phcPile'
  | 'readyMix' | 'pavingBlock' | 'hollowSlab' | 'fiberBoard' | 'grout'
  | 'marble' | 'granite' | 'porcelainTile' | 'slate' | 'ceramicTile'
  | 'mosaic' | 'quartz' | 'terracotta' | 'culturedStone' | 'acidBrick'
  | 'plywood' | 'osb' | 'floatGlass' | 'xpsBoard' | 'pprPipe'
  | 'powerCable' | 'scaffold' | 'robotArm' | 'serverRack' | 'iotSensor'
  | 'steel' | 'aluminum' | 'concrete' | 'stone' | 'wood' | 'glass'
  | 'insulation' | 'mep' | 'electrical' | 'machinery'
  | 'robotics' | 'itHardware' | 'smartFactory';

type GlyphTone = {
  bg: string;
  fg: string;
  accent: string;
};

const TONES: Record<string, GlyphTone> = {
  steel: { bg: '#E7ECF2', fg: '#334155', accent: '#94A3B8' },
  alu: { bg: '#E8F1F7', fg: '#1E5A78', accent: '#7CB3C9' },
  concrete: { bg: '#ECEAE4', fg: '#5B5B55', accent: '#B8B2A4' },
  stone: { bg: '#F0ECE7', fg: '#6B5D52', accent: '#C2B3A2' },
  wood: { bg: '#F3E8D5', fg: '#7C4A25', accent: '#C98B4A' },
  glass: { bg: '#E7F4F8', fg: '#146C82', accent: '#8BD3E6' },
  insulation: { bg: '#EEF6DC', fg: '#4F6F1D', accent: '#A8C76A' },
  mep: { bg: '#EAF1FF', fg: '#244A86', accent: '#7EA6E8' },
  electric: { bg: '#FFF2D8', fg: '#9A5A00', accent: '#F5B53D' },
  machine: { bg: '#ECE7F4', fg: '#553C7B', accent: '#9B7BD1' },
  robot: { bg: '#F0E8FF', fg: '#6D28D9', accent: '#B794F4' },
  it: { bg: '#E8F0FF', fg: '#1D4ED8', accent: '#8AB4F8' },
  smart: { bg: '#E4F8EF', fg: '#047857', accent: '#72D9A2' },
};

const GLYPH_TONE: Record<GlyphKey, keyof typeof TONES> = {
  rebar: 'steel', steelPipe: 'steel', hBeam: 'steel', steelSheet: 'steel', galvCoil: 'steel',
  angleSteel: 'steel', wireMesh: 'steel', steelStud: 'steel', castPipe: 'steel', deckPlate: 'steel',
  windowFrame: 'alu', aluExtrusion: 'alu', aluSheet: 'alu', curtainWall: 'alu', solarFrame: 'alu',
  aluRoof: 'alu', acpPanel: 'alu', aluTube: 'alu', louver: 'alu', dieCast: 'alu',
  cementBag: 'concrete', conBlock: 'concrete', rcPipe: 'concrete', precastPanel: 'concrete', phcPile: 'concrete',
  readyMix: 'concrete', pavingBlock: 'concrete', hollowSlab: 'concrete', fiberBoard: 'concrete', grout: 'concrete',
  marble: 'stone', granite: 'stone', porcelainTile: 'stone', slate: 'stone', ceramicTile: 'stone',
  mosaic: 'stone', quartz: 'stone', terracotta: 'stone', culturedStone: 'stone', acidBrick: 'stone',
  plywood: 'wood', osb: 'wood', floatGlass: 'glass', xpsBoard: 'insulation', pprPipe: 'mep',
  powerCable: 'electric', scaffold: 'machine', robotArm: 'robot', serverRack: 'it', iotSensor: 'smart',
  steel: 'steel', aluminum: 'alu', concrete: 'concrete', stone: 'stone', wood: 'wood', glass: 'glass',
  insulation: 'insulation', mep: 'mep', electrical: 'electric', machinery: 'machine',
  robotics: 'robot', itHardware: 'it', smartFactory: 'smart',
};

export const CATEGORY_GLYPH_MAP: Record<string, GlyphKey> = {
  STL_REBAR: 'rebar',
  STL_PIPE: 'steelPipe',
  STL_BEAM: 'hBeam',
  STL_SHEET: 'steelSheet',
  STL_GALV: 'galvCoil',
  STL_ANGLE: 'angleSteel',
  STL_WIRE: 'wireMesh',
  STL_STUD: 'steelStud',
  STL_CAST: 'castPipe',
  STL_DECK: 'deckPlate',
  ALU_WIN: 'windowFrame',
  ALU_EXTRUDE: 'aluExtrusion',
  ALU_SHEET: 'aluSheet',
  ALU_CURTAIN: 'curtainWall',
  ALU_SOLAR: 'solarFrame',
  ALU_ROOF: 'aluRoof',
  ALU_COMPOSITE: 'acpPanel',
  ALU_TUBE: 'aluTube',
  ALU_LOUVER: 'louver',
  ALU_CAST: 'dieCast',
  CON_CEMENT: 'cementBag',
  CON_BLOCK: 'conBlock',
  CON_PIPE: 'rcPipe',
  CON_PANEL: 'precastPanel',
  CON_PILE: 'phcPile',
  CON_READY: 'readyMix',
  CON_PAVING: 'pavingBlock',
  CON_HOLLOW: 'hollowSlab',
  CON_FIBER: 'fiberBoard',
  CON_GROUT: 'grout',
  STO_MARBLE: 'marble',
  STO_GRANITE: 'granite',
  STO_PORCELAIN: 'porcelainTile',
  STO_SLATE: 'slate',
  STO_CERAMIC: 'ceramicTile',
  STO_MOSAIC: 'mosaic',
  STO_QUARTZ: 'quartz',
  STO_TERRACOTTA: 'terracotta',
  STO_CULTURED: 'culturedStone',
  STO_ACID: 'acidBrick',
  WOD_PLYWOOD: 'plywood',
  WOD_OSB: 'osb',
  GLS_FLOAT: 'floatGlass',
  INS_XPS: 'xpsBoard',
  MEP_PPR: 'pprPipe',
  ELC_CABLE: 'powerCable',
  MCH_SCAFFOLD: 'scaffold',
  AIR_ARM: 'robotArm',
  ITH_SERVER: 'serverRack',
  SMF_IOT: 'iotSensor',
};

const L1_GLYPH_MAP: Record<string, GlyphKey> = {
  STEEL: 'steel',
  ALUMINUM: 'aluminum',
  CONCRETE: 'concrete',
  STONE: 'stone',
  WOOD: 'wood',
  GLASS: 'glass',
  INSULATION: 'insulation',
  MEP: 'mep',
  ELECTRICAL: 'electrical',
  MACHINERY: 'machinery',
  AI_ROBOT: 'robotics',
  IT_HARDWARE: 'itHardware',
  SMART_MFG: 'smartFactory',
};

export function getCategoryGlyphKey(code: string, l1Code: string): GlyphKey {
  return CATEGORY_GLYPH_MAP[code] ?? L1_GLYPH_MAP[l1Code] ?? 'steel';
}

function strokeIcon(key: GlyphKey): ReactNode {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const filled = { fill: 'currentColor' };

  switch (key) {
    case 'rebar': return <><path {...common} d="M5 18 18 5M8 20 20 8M6 14l4 4M10 10l4 4M14 6l4 4" /></>;
    case 'steelPipe': return <><ellipse {...common} cx="9" cy="8" rx="4" ry="2.4" /><path {...common} d="M13 8v7c0 1.3-1.8 2.4-4 2.4S5 16.3 5 15V8" /><ellipse {...common} cx="15" cy="12" rx="4" ry="2.4" /><path {...common} d="M19 12v5c0 1.3-1.8 2.4-4 2.4-1.1 0-2.1-.3-2.8-.8" /></>;
    case 'hBeam': return <path {...common} d="M6 5v14M18 5v14M7 12h10M8 5h8M8 19h8" />;
    case 'steelSheet': return <><path {...common} d="M6 7h10l2 3v9H6z" /><path {...common} d="M16 7v3h2M8 13h8M8 16h6" /></>;
    case 'galvCoil': return <><circle {...common} cx="11" cy="12" r="6" /><circle {...common} cx="11" cy="12" r="2" /><path {...common} d="M15 7h3v10h-3" /></>;
    case 'angleSteel': return <path {...common} d="M7 5v12h11M10 8v6h6" />;
    case 'wireMesh': return <><path {...common} d="M5 6h14v12H5zM5 10h14M5 14h14M9 6v12M13 6v12M17 6v12" /></>;
    case 'steelStud': return <path {...common} d="M7 5h10v4h-6v2h6v8H7v-4h6v-2H7z" />;
    case 'castPipe': return <><path {...common} d="M5 12h11M8 8h8a3 3 0 0 1 0 6H8a3 3 0 0 1 0-6Z" /><path {...common} d="M16 8l3-2v12l-3-2" /></>;
    case 'deckPlate': return <path {...common} d="M4 15l3-6 3 6 3-6 3 6 3-6 1 6v3H4z" />;
    case 'windowFrame': return <><rect {...common} x="5" y="5" width="14" height="14" rx="1" /><path {...common} d="M12 5v14M5 12h14" /></>;
    case 'aluExtrusion': return <><rect {...common} x="5" y="7" width="14" height="10" rx="1" /><path {...common} d="M9 7v10M15 7v10M5 12h14" /></>;
    case 'aluSheet': return <path {...common} d="M6 6h12v12H6zM8 8h8M8 11h8M8 14h5" />;
    case 'curtainWall': return <><rect {...common} x="5" y="4" width="14" height="16" /><path {...common} d="M5 9h14M5 14h14M10 4v16M15 4v16" /></>;
    case 'solarFrame': return <><rect {...common} x="5" y="6" width="14" height="10" /><path {...common} d="M5 10h14M10 6v10M15 6v10M9 19h6" /></>;
    case 'aluRoof': return <path {...common} d="M4 13 12 6l8 7M7 12v7h10v-7M9 15h6" />;
    case 'acpPanel': return <><rect {...common} x="5" y="5" width="14" height="14" rx="1.5" /><path {...common} d="M8 8h8v8H8z" /></>;
    case 'aluTube': return <><circle {...common} cx="9" cy="10" r="4" /><circle {...common} cx="15" cy="14" r="4" /><path {...common} d="M9 10h6" /></>;
    case 'louver': return <path {...common} d="M5 7h14M5 11h14M5 15h14M7 7l-2 4M11 7l-2 4M15 7l-2 4M19 7l-2 4" />;
    case 'dieCast': return <><path {...common} d="M7 8h10v8H7z" /><circle {...common} cx="9" cy="10" r="1" /><circle {...common} cx="15" cy="14" r="1" /><path {...common} d="M12 8v8M7 12h10" /></>;
    case 'cementBag': return <><path {...common} d="M7 6h10l1 13H6z" /><path {...common} d="M9 6c0-1 1-2 3-2s3 1 3 2M9 12h6" /></>;
    case 'conBlock': return <><rect {...common} x="5" y="7" width="14" height="10" rx="1" /><path {...common} d="M9 7v10M15 7v10M5 12h14" /></>;
    case 'rcPipe': return <><circle {...common} cx="12" cy="12" r="6" /><circle {...common} cx="12" cy="12" r="3" /></>;
    case 'precastPanel': return <><rect {...common} x="6" y="5" width="12" height="14" /><path {...common} d="M9 8h6M9 12h6M9 16h6" /></>;
    case 'phcPile': return <><path {...common} d="M8 5h8v14H8z" /><path {...common} d="M10 8h4M10 12h4M10 16h4" /></>;
    case 'readyMix': return <><path {...common} d="M5 15h9l3-5h2v5h-2" /><circle {...common} cx="8" cy="17" r="2" /><circle {...common} cx="16" cy="17" r="2" /><path {...common} d="M7 10h7l-2 5H8z" /></>;
    case 'pavingBlock': return <><path {...common} d="M5 8h6v4H5zM13 8h6v4h-6zM9 14h6v4H9z" /></>;
    case 'hollowSlab': return <><rect {...common} x="5" y="8" width="14" height="8" rx="1" /><circle {...common} cx="9" cy="12" r="1.5" /><circle {...common} cx="15" cy="12" r="1.5" /></>;
    case 'fiberBoard': return <><rect {...common} x="6" y="5" width="12" height="14" /><path {...common} d="M8 8c3 1 5 1 8 0M8 12c3 1 5 1 8 0M8 16c3 1 5 1 8 0" /></>;
    case 'grout': return <><path {...common} d="M8 6h8l1 12H7z" /><path {...common} d="M10 10h4M9 14h6" /></>;
    case 'marble': return <><rect {...common} x="5" y="5" width="14" height="14" rx="1" /><path {...common} d="M7 15c3-5 6 1 10-6M8 9c2 1 3 1 5-2" /></>;
    case 'granite': return <><rect {...common} x="5" y="5" width="14" height="14" rx="1" /><circle {...filled} cx="9" cy="9" r=".8" /><circle {...filled} cx="14" cy="11" r=".7" /><circle {...filled} cx="11" cy="15" r=".7" /></>;
    case 'porcelainTile': return <><rect {...common} x="5" y="5" width="14" height="14" /><path {...common} d="M12 5v14M5 12h14" /></>;
    case 'slate': return <><path {...common} d="M6 7h12l-2 10H4z" /><path {...common} d="M8 10h7M7 13h8" /></>;
    case 'ceramicTile': return <><rect {...common} x="6" y="6" width="12" height="12" rx="2" /><path {...common} d="M9 9h6v6H9z" /></>;
    case 'mosaic': return <><rect {...common} x="5" y="5" width="5" height="5" /><rect {...common} x="14" y="5" width="5" height="5" /><rect {...common} x="5" y="14" width="5" height="5" /><rect {...common} x="14" y="14" width="5" height="5" /></>;
    case 'quartz': return <><path {...common} d="M12 4 5 10l7 10 7-10z" /><path {...common} d="M5 10h14M9 10l3 10M15 10l-3 10" /></>;
    case 'terracotta': return <><path {...common} d="M5 8h14v8H5zM7 8v8M11 8v8M15 8v8" /></>;
    case 'culturedStone': return <><path {...common} d="M6 9 10 5l4 2 4 4-2 6H8z" /><path {...common} d="M9 12h6" /></>;
    case 'acidBrick': return <><rect {...common} x="5" y="8" width="14" height="8" rx="1" /><path {...common} d="M8 8v8M13 8v8M18 8v8" /><path {...common} d="M10 5l4 4" /></>;
    case 'plywood': return <><rect {...common} x="5" y="6" width="14" height="12" rx="1" /><path {...common} d="M7 9c3-2 7 2 10 0M7 13c3-2 7 2 10 0" /></>;
    case 'osb': return <><rect {...common} x="5" y="6" width="14" height="12" /><path {...common} d="m8 9 3 2M14 8l3 3M9 15l4-2M15 15l2-1" /></>;
    case 'floatGlass': return <><rect {...common} x="7" y="4" width="10" height="16" rx="1" /><path {...common} d="M10 7h4M9 12h6" /></>;
    case 'xpsBoard': return <><rect {...common} x="5" y="7" width="14" height="10" rx="1" /><path {...common} d="M7 10h10M7 14h10" /></>;
    case 'pprPipe': return <><path {...common} d="M5 13h9a3 3 0 0 0 0-6h-2" /><path {...common} d="M9 17h6a4 4 0 0 0 4-4" /></>;
    case 'powerCable': return <><path {...common} d="M6 12c4-7 8 7 12 0" /><path {...common} d="M7 8l-2 2M17 16l2-2" /></>;
    case 'scaffold': return <><path {...common} d="M6 19V5M18 19V5M6 8h12M6 13h12M8 5l8 14M16 5 8 19" /></>;
    case 'robotArm': return <><circle {...common} cx="7" cy="17" r="2" /><circle {...common} cx="13" cy="11" r="2" /><path {...common} d="M8.5 15.5 11.5 12.5M14.5 9.5 18 6M17 5l2 2M5 19h6" /></>;
    case 'serverRack': return <><rect {...common} x="6" y="4" width="12" height="16" rx="1" /><path {...common} d="M8 8h8M8 12h8M8 16h8" /><circle {...filled} cx="9" cy="8" r=".6" /><circle {...filled} cx="9" cy="12" r=".6" /><circle {...filled} cx="9" cy="16" r=".6" /></>;
    case 'iotSensor': return <><circle {...common} cx="12" cy="12" r="3" /><path {...common} d="M12 5v2M12 17v2M5 12h2M17 12h2M7.5 7.5 9 9M15 15l1.5 1.5M16.5 7.5 15 9M9 15l-1.5 1.5" /></>;
    case 'steel': return <path {...common} d="M6 5h12M8 5v14M16 5v14M6 19h12M8 12h8" />;
    case 'aluminum': return <path {...common} d="M5 7h14v10H5zM9 7v10M15 7v10" />;
    case 'concrete': return <path {...common} d="M5 8h14v8H5zM9 8v8M15 8v8" />;
    case 'stone': return <path {...common} d="M6 9 11 5l7 4-2 9H7z" />;
    case 'wood': return <><rect {...common} x="5" y="7" width="14" height="10" /><path {...common} d="M7 10c3-2 7 2 10 0M7 14c3-2 7 2 10 0" /></>;
    case 'glass': return <><rect {...common} x="7" y="5" width="10" height="14" /><path {...common} d="M10 8h4" /></>;
    case 'insulation': return <><rect {...common} x="5" y="7" width="14" height="10" rx="2" /><path {...common} d="M8 10h8M8 14h8" /></>;
    case 'mep': return <path {...common} d="M5 13h8a3 3 0 0 0 0-6h-1M9 17h6a4 4 0 0 0 4-4" />;
    case 'electrical': return <path {...common} d="M13 3 6 13h5l-1 8 8-12h-5z" />;
    case 'machinery': return <><circle {...common} cx="12" cy="12" r="3" /><path {...common} d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" /></>;
    case 'robotics': return <><rect {...common} x="6" y="8" width="12" height="9" rx="2" /><path {...common} d="M12 8V5M9 12h.01M15 12h.01M10 16h4" /></>;
    case 'itHardware': return <><rect {...common} x="6" y="6" width="12" height="12" rx="2" /><path {...common} d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M18 9h3M3 15h3M18 15h3" /></>;
    case 'smartFactory': return <><path {...common} d="M5 19V9l5 3V9l5 3V7h4v12z" /><path {...common} d="M8 16h2M13 16h2" /></>;
    default: return <circle {...common} cx="12" cy="12" r="6" />;
  }
}

export function CategoryGlyph({ glyph, className = '' }: { glyph: GlyphKey; className?: string }) {
  const tone = TONES[GLYPH_TONE[glyph]];

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      <svg viewBox="0 0 24 24" className="h-[78%] w-[78%]">
        <circle cx="18" cy="6" r="2.5" fill={tone.accent} opacity="0.55" />
        {strokeIcon(glyph)}
      </svg>
    </span>
  );
}
