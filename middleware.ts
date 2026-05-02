import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === 'production' &&
    request.nextUrl.pathname.startsWith('/dev')
  ) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/dev/:path*',
};
