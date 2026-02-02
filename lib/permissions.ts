import type { NextRequest } from 'next/server';
import { prisma } from './db';
import { getAccessToken, verifyToken } from './auth';

export async function requireAuth(request: NextRequest) {
  const token = getAccessToken(request);
  if (!token) {
    return null;
  }
  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export async function ensureCompanyAccess(userId: string, companyId: string) {
  const membership = await prisma.companyUser.findFirst({
    where: { userId, companyId }
  });
  return Boolean(membership);
}

export function isStaffOrAdmin(role: string) {
  return role === 'ADMIN' || role === 'STAFF';
}

export function isAdmin(role: string) {
  return role === 'ADMIN';
}
