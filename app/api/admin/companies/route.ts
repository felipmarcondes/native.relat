import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { createCompanySchema } from '@/lib/validators';
import { requireAuth, isAdmin } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth || !isAdmin(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ companies });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth || !isAdmin(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createCompanySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name: parsed.data.name,
      maxProfiles: 5,
      maxAdAccounts: 1
    }
  });

  return NextResponse.json({ company });
}
