import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { createUserSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/auth';
import { requireAuth, isAdmin } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth || !isAdmin(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true }
  });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth || !isAdmin(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role
    }
  });

  return NextResponse.json({ user });
}
