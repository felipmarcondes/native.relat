import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { prisma } from './db';

const ACCESS_TOKEN_TTL = 60 * 15; // 15 min
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days

export type AuthPayload = {
  userId: string;
  role: 'ADMIN' | 'STAFF' | 'CLIENT';
};

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: AuthPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(payload: AuthPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_TTL
  });
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_TTL
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.set('accessToken', '', { httpOnly: true, path: '/', maxAge: 0 });
  cookieStore.set('refreshToken', '', { httpOnly: true, path: '/', maxAge: 0 });
}

export function getAccessToken(request: NextRequest) {
  return request.cookies.get('accessToken')?.value;
}

export function getRefreshToken(request: NextRequest) {
  return request.cookies.get('refreshToken')?.value;
}

export async function getUserCompanies(userId: string) {
  return prisma.companyUser.findMany({
    where: { userId },
    include: { company: true }
  });
}
