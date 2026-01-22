import { z } from 'zod'

export const investorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  amountCommitted: z.number().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
  deal: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  investorType: z.string().optional().nullable(),
  liquidReady: z.boolean().optional().default(false),
})

export const touchpointSchema = z.object({
  investorId: z.string().uuid(),
  channel: z.enum(['LINKEDIN', 'EMAIL', 'SMS', 'CALL', 'OTHER']),
  type: z.enum([
    'CONNECTION_SENT',
    'CONNECTION_ACCEPTED',
    'DM_SENT',
    'DM_REPLIED',
    'PROFILE_VIEWED_MANUAL',
    'POST_ENGAGED_MANUAL',
    'LINK_CLICK',
    'WEBSITE_VISIT',
    'CALENDAR_BOOKED',
    'NOTE',
  ]),
  occurredAt: z.date().optional().default(() => new Date()),
  metadata: z.record(z.any()).optional().nullable(),
})

export const trackedLinkSchema = z.object({
  investorId: z.string().uuid().optional().nullable(),
  destinationUrl: z.string().url('Invalid URL'),
  campaign: z.string().optional().nullable(),
  deal: z.string().optional().nullable(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
