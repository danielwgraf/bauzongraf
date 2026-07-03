import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'de'];

export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang');

  if (lang && SUPPORTED_LOCALES.includes(lang)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('lang');

    const response = NextResponse.redirect(url);
    response.cookies.set('locale', lang, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next|favicon|images).*)'],
};
