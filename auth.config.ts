import type { NextAuthConfig } from 'next-auth';

// Edge-compatible auth config (no bcrypt, no DB imports)
// Used by middleware.ts only. Full config with credentials/DB is in auth.ts.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPrefixes = ['/dashboard', '/billing', '/admin', '/account'];
      const isProtected = protectedPrefixes.some(p => nextUrl.pathname.startsWith(p));
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
  providers: [],
};
