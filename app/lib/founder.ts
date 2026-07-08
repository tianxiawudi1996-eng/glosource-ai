// Single source of truth for the GloSource AI founder trust anchor (EN buyers).
// Real data only — unconfirmed fields stay null and simply do not render or emit
// (no fabrication). Domestic business registration is intentionally omitted:
// GloSource is not yet domestically registered, and the operator's employer
// registration number must never be used here (dual-track separation).

export interface FounderProfile {
  name: string;
  jobTitle: string;
  location: string;
  /** Path under /public once a real photo exists; null renders an initials avatar. */
  photo: string | null;
  /** Real LinkedIn URL once confirmed; null omits the link and the sameAs entry. */
  linkedin: string | null;
  email: string;
}

export const FOUNDER: FounderProfile = {
  name: 'John Kim',
  jobTitle: 'Founder & operator',
  location: 'Korea · UTC+9',
  photo: null,
  linkedin: null,
  email: 'hello@glosourceai.com',
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Extra Organization.sameAs entries backed by the founder's real profiles.
export function founderSameAs(founder: FounderProfile): string[] {
  return founder.linkedin ? [founder.linkedin] : [];
}

// schema.org Person for Organization.founder — omits fields we cannot confirm.
export function founderPersonSchema(founder: FounderProfile): Record<string, unknown> {
  const person: Record<string, unknown> = {
    '@type': 'Person',
    name: founder.name,
    jobTitle: founder.jobTitle,
  };
  if (founder.linkedin) person.sameAs = [founder.linkedin];
  return person;
}
