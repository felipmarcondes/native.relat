import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { adsReportSchema } from '@/lib/validators';
import { ensureCompanyAccess, requireAuth } from '@/lib/permissions';

function toDateRange(from: string, to: string) {
  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);
  return { fromDate, toDate };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await ensureCompanyAccess(auth.userId, params.id);
  if (!allowed && auth.role === 'CLIENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = adsReportSchema.safeParse({
    from: searchParams.get('from'),
    to: searchParams.get('to')
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  const { fromDate, toDate } = toDateRange(parsed.data.from, parsed.data.to);

  const metrics = await prisma.adsMetricsDaily.findMany({
    where: {
      companyId: params.id,
      date: {
        gte: fromDate,
        lte: toDate
      }
    },
    orderBy: { date: 'asc' }
  });

  const summary = metrics.reduce(
    (acc, item) => {
      acc.spend += item.spend;
      acc.results += item.results;
      acc.clicks += item.clicks;
      acc.impressionsOrViews += item.impressionsOrViews;
      acc.activeAdsCount = Math.max(acc.activeAdsCount, item.activeAdsCount);
      return acc;
    },
    {
      spend: 0,
      results: 0,
      clicks: 0,
      impressionsOrViews: 0,
      activeAdsCount: 0
    }
  );

  const dailySeries = metrics.map((item) => ({
    date: item.date.toISOString().slice(0, 10),
    spend: item.spend,
    results: item.results,
    clicks: item.clicks,
    impressionsOrViews: item.impressionsOrViews,
    activeAdsCount: item.activeAdsCount
  }));

  return NextResponse.json({ summary, dailySeries });
}
