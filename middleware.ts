import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Reponse de base avec directive noindex pour la protection de la vie privee
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  const appPassword = process.env.APP_PASSWORD;

  // Si aucun mot de passe n est configure, acces libre (ex: tests)
  if (!appPassword || appPassword.trim() === '') {
    return response;
  }

  // Chemins publics autorises sans mot de passe
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/login' ||
    pathname === '/api/auth/login'
  ) {
    return response;
  }

  // Verification du cookie d authentification
  const authCookie = request.cookies.get('hexavia_auth');
  const isAuthenticated = authCookie?.value === 'authenticated';

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
