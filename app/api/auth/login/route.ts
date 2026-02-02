import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validators';
import { setAuthCookies, signAccessToken, signRefreshToken, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
  setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({ ok: true });
}
