export type AdminPathDecision =
  | 'not-admin-path'
  | 'public-login'
  | 'unauthenticated'
  | 'authorized'
  | 'forbidden';

function adminEmails(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined, configuredEmails: string | undefined): boolean {
  if (!email) return false;
  return adminEmails(configuredEmails).includes(email.trim().toLowerCase());
}

export function adminPathDecision(
  pathname: string,
  email: string | null | undefined,
  configuredEmails: string | undefined,
): AdminPathDecision {
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  if (!isAdminPath) return 'not-admin-path';
  if (pathname === '/admin/login') return 'public-login';
  if (!email) return 'unauthenticated';
  return isAdminEmail(email, configuredEmails) ? 'authorized' : 'forbidden';
}
