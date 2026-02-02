import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { contentReportSchema } from '@/lib/validators';
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
  const parsed = contentReportSchema.safeParse({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    profile: searchParams.get('profile') ?? undefined,
    source: searchParams.get('source') ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  const { fromDate, toDate } = toDateRange(parsed.data.from, parsed.data.to);

  const posts = await prisma.contentPost.findMany({
    where: {
      companyId: params.id,
      source: parsed.data.source,
      profileExternalId: parsed.data.profile
    },
    include: {
      metrics: {
        where: {
          date: {
            gte: fromDate,
            lte: toDate
          }
        }
      }
    },
    orderBy: { createdTime: 'desc' }
  });

  const summary = {
    views: 0,
    reach: 0,
    engagement: 0,
    likes: 0,
    comments: 0,
    shares: 0
  };

  const dailyMap = new Map<string, typeof summary>();

  const postRows = posts.map((post) => {
    const totals = post.metrics.reduce(
      (acc, metric) => {
        acc.views += metric.views;
        acc.reach += metric.reach;
        acc.engagement += metric.engagement;
        acc.likes += metric.likes;
        acc.comments += metric.comments;
        acc.shares += metric.shares;

        const day = metric.date.toISOString().slice(0, 10);
        const daily = dailyMap.get(day) ?? {
          views: 0,
          reach: 0,
          engagement: 0,
          likes: 0,
          comments: 0,
          shares: 0
        };
        daily.views += metric.views;
        daily.reach += metric.reach;
        daily.engagement += metric.engagement;
        daily.likes += metric.likes;
        daily.comments += metric.comments;
        daily.shares += metric.shares;
        dailyMap.set(day, daily);

        return acc;
      },
      { ...summary }
    );

    summary.views += totals.views;
    summary.reach += totals.reach;
    summary.engagement += totals.engagement;
    summary.likes += totals.likes;
    summary.comments += totals.comments;
    summary.shares += totals.shares;

    return {
      id: post.id,
      source: post.source,
      createdTime: post.createdTime,
      permalink: post.permalink,
      captionShort: post.captionShort,
      mediaType: post.mediaType,
      totals
    };
  });

  const dailySeries = Array.from(dailyMap.entries())
    .map(([date, metrics]) => ({ date, ...metrics }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ summary, posts: postRows, dailySeries });
}
