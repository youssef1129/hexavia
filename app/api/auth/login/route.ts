import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;
    const expectedPassword = process.env.APP_PASSWORD;

    if (!expectedPassword || expectedPassword.trim() === '') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('hexavia_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: '/',
      });
      return response;
    }

    if (password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('hexavia_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }

    return NextResponse.json(
      { error: 'Mot de passe incorrect. Veuillez reessayer.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la requete.' },
      { status: 500 }
    );
  }
}
