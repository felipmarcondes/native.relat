import { NextResponse, type NextRequest } from 'next/server';
import { getRefreshToken, setAuthCookies, signAccessToken, signRefreshToken, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const refreshToken = getRefreshToken(request);
  if (!refreshToken) {
    return NextResponse.json({ error: 'Missing refresh token.' }, { status: 401 });
  }

  try {
    const payload = verifyToken(refreshToken);
    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    const newRefreshToken = signRefreshToken({ userId: payload.userId, role: payload.role });
    setAuthCookies(accessToken, newRefreshToken);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid refresh token.' }, { status: 401 });
  }
}
