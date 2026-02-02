import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth, isAdmin } from '@/lib/permissions';
import { syncQueue } from '@/lib/queue';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request);
  if (!auth || !isAdmin(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await syncQueue.add('sync:company', { companyId: params.id });

  return NextResponse.json({ ok: true });
}
