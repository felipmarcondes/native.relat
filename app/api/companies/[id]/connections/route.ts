import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { createConnectionSchema } from '@/lib/validators';
import { ensureCompanyAccess, isStaffOrAdmin, requireAuth } from '@/lib/permissions';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await ensureCompanyAccess(auth.userId, params.id);
  if (!allowed && !isStaffOrAdmin(auth.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const connections = await prisma.metaConnection.findMany({
    where: { companyId: params.id }
  });

  return NextResponse.json({ connections });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth || !isStaffOrAdmin(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const allowed = await ensureCompanyAccess(auth.userId, params.id);
  if (!allowed && auth.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createConnectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: params.id } });
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  const existing = await prisma.metaConnection.findMany({
    where: { companyId: params.id }
  });

  const profileCount = existing.filter((item) => item.type !== 'ad_account').length;
  const adAccountCount = existing.filter((item) => item.type === 'ad_account').length;

  if (parsed.data.type === 'ad_account' && adAccountCount >= company.maxAdAccounts) {
    return NextResponse.json({ error: 'Ad account limit reached' }, { status: 400 });
  }

  if (parsed.data.type !== 'ad_account' && profileCount >= company.maxProfiles) {
    return NextResponse.json({ error: 'Profile limit reached' }, { status: 400 });
  }

  const connection = await prisma.metaConnection.create({
    data: {
      companyId: params.id,
      type: parsed.data.type,
      externalId: parsed.data.externalId,
      displayName: parsed.data.displayName,
      status: 'connected'
    }
  });

  return NextResponse.json({ connection });
}
