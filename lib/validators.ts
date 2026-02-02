import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const createCompanySchema = z.object({
  name: z.string().min(2)
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'STAFF', 'CLIENT'])
});

export const linkUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['ADMIN', 'STAFF', 'CLIENT'])
});

export const createConnectionSchema = z.object({
  type: z.enum(['instagram_profile', 'facebook_page', 'ad_account']),
  externalId: z.string().min(1),
  displayName: z.string().min(1)
});

export const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const contentReportSchema = dateRangeSchema.extend({
  profile: z.string().optional(),
  source: z.enum(['instagram', 'facebook']).optional()
});

export const adsReportSchema = dateRangeSchema;
