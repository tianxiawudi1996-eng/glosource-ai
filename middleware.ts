import { NextResponse } from 'next/server';
import { auth } from './auth';

export default auth((request) => {
  if (!request.auth) {
    const loginUrl = new URL('/auth/login', request.nextUrl);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/billing/:path*', '/admin/:path*', '/account/:path*'],
};
