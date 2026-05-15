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
      const protectedPrefixes = ['/dashboard', '/billing', '/admin', '/account', '/en/billing', '/en/dashboard'];
      const isProtected = protectedPrefixes.some(p => nextUrl.pathname.startsWith(p));
      if (isProtected) {
        if (isLoggedIn) return true;
        // EN 경로는 EN 로그인 페이지로
        if (nextUrl.pathname.startsWith('/en/')) {
          return Response.redirect(new URL(`/en/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
        }
        return false; // nextAuth가 기본 signIn 페이지로 리다이렉트
      }
      return true;
    },
  },
  providers: [],
};
