import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const proxy = auth((request) => {
  const { pathname } = request.nextUrl;

  // Korean homepage ('/') is public. (Previously redirected to /en.)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/.*|.*\\..*).*)',
  ],
};
