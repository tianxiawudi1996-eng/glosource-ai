interface UnverifiedCertificationMention {
  key: string;
  label: string;
  className: string;
}

interface CertificationPattern {
  key: string;
  label: string;
  pattern: RegExp;
  confirmedBy?: RegExp;
  className: string;
}

const CERTIFICATION_PATTERNS: CertificationPattern[] = [
  {
    key: 'mfds',
    label: 'MFDS',
    pattern: /KFDA|MFDS|식약처/i,
    confirmedBy: /^(MFDS|CGMP|Medical|Health-food|Quasi-drug)$/i,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    key: 'haccp',
    label: 'HACCP',
    pattern: /HACCP/i,
    confirmedBy: /^HACCP$/i,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  { key: 'kc', label: 'KC', pattern: /\bKC\b|Korea Certification/i, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'ks', label: 'KS', pattern: /\bKS\b|Korean Standard/i, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'iso-22716', label: 'ISO 22716', pattern: /ISO 22716/i, className: 'bg-slate-100 text-slate-600 border-slate-200' },
  { key: 'iso-22000', label: 'ISO 22000', pattern: /ISO 22000/i, className: 'bg-slate-100 text-slate-600 border-slate-200' },
  { key: 'iso-9001', label: 'ISO 9001', pattern: /ISO 9001/i, className: 'bg-slate-100 text-slate-600 border-slate-200' },
  { key: 'halal', label: 'HALAL', pattern: /HALAL/i, className: 'bg-green-50 text-green-700 border-green-200' },
  { key: 'buykorea', label: 'On BuyKorea', pattern: /KOTRA\s*[Ll]isted|BuyKorea/i, className: 'bg-slate-100 text-slate-600 border-slate-200' },
  { key: 'ce', label: 'CE', pattern: /\bCE\b/, className: 'bg-slate-100 text-slate-600 border-slate-200' },
  { key: 'sgs', label: 'SGS', pattern: /\bSGS\b/i, className: 'bg-slate-100 text-slate-600 border-slate-200' },
];

export function extractUnverifiedCertificationMentions(
  evidence: string[],
  governmentRegistries: string[] = [],
): UnverifiedCertificationMention[] {
  const joinedEvidence = (Array.isArray(evidence) ? evidence : []).join(' ');
  const registries = Array.isArray(governmentRegistries) ? governmentRegistries : [];

  return CERTIFICATION_PATTERNS
    .filter(({ pattern, confirmedBy }) => {
      if (!pattern.test(joinedEvidence)) return false;
      if (!confirmedBy) return true;
      return !registries.some(registry => confirmedBy.test(registry));
    })
    .map(({ key, label, className }) => ({
      key,
      label: `${label} mentioned — unconfirmed`,
      className,
    }));
}
