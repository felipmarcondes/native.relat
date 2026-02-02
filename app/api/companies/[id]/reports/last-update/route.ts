import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ensureCompanyAccess, requireAuth } from '@/lib/permissions';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await ensureCompanyAccess(auth.userId, params.id);
  if (!allowed && auth.role === 'CLIENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const latestContent = await prisma.contentMetricsDaily.findFirst({
    where: { post: { companyId: params.id } },
    orderBy: { date: 'desc' }
  });

  const latestAds = await prisma.adsMetricsDaily.findFirst({
    where: { companyId: params.id },
    orderBy: { date: 'desc' }
  });

  const latestDates = [latestContent?.date, latestAds?.date].filter(Boolean) as Date[];
  const latest = latestDates.sort((a, b) => b.getTime() - a.getTime())[0];

  return NextResponse.json({ updatedAt: latest ? latest.toISOString().slice(0, 10) : null });
}
