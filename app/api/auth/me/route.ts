import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, name: true, role: true }
  });

  const companies = await prisma.companyUser.findMany({
    where: { userId: auth.userId },
    include: { company: true }
  });

  return NextResponse.json({ user, companies });
}
