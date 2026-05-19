import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // Korean version is not yet public — redirect root to /en
  if (pathname === '/' || pathname === '') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url, 302);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/.*|.*\\..*).*)',
  ],
};
