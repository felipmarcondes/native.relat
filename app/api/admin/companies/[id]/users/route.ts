import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { linkUserSchema } from '@/lib/validators';
import { requireAuth, isAdmin } from '@/lib/permissions';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth || !isAdmin(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = linkUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const companyUser = await prisma.companyUser.create({
    data: {
      companyId: params.id,
      userId: parsed.data.userId,
      role: parsed.data.role
    }
  });

  return NextResponse.json({ companyUser });
}
