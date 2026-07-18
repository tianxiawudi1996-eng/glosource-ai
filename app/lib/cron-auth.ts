import { safeTokenEqual } from './internal-auth';

export function isCronAuthorized(
  authorization: string | null,
  secret: string | undefined,
): boolean {
  return Boolean(
    authorization
    && secret
    && safeTokenEqual(authorization, `Bearer ${secret}`),
  );
}
