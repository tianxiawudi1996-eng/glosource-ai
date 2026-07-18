export function isPasswordSessionInvalidated(
  issuedAtMs: number | undefined,
  passwordSetAt: Date | null | undefined,
): boolean {
  if (!passwordSetAt) return false;
  if (!Number.isFinite(issuedAtMs)) return true;
  return (issuedAtMs as number) < passwordSetAt.getTime();
}
