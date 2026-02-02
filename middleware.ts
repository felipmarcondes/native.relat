import { NextResponse, type NextRequest } from 'next/server';
import { getAccessToken, verifyToken } from '@/lib/auth';

const protectedPaths = ['/dashboard', '/company', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = getAccessToken(request);
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/company/:path*', '/admin/:path*']
};
