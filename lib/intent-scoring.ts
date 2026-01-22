import { prisma } from './prisma'
import type { Touchpoint, TouchpointType } from '@prisma/client'

interface TouchpointWithAge extends Touchpoint {
  ageInDays: number
}

// Base scores per touchpoint type
const TOUCHPOINT_SCORES: Record<TouchpointType, number> = {
  LINK_CLICK: 3,
  WEBSITE_VISIT: 2,
  DM_REPLIED: 8,
  CONNECTION_ACCEPTED: 4,
  PROFILE_VIEWED_MANUAL: 2,
  POST_ENGAGED_MANUAL: 2,
  CONNECTION_SENT: 0,
  DM_SENT: 0,
  CALENDAR_BOOKED: 5,
  NOTE: 0,
}

// Age decay multipliers
function getDecayMultiplier(ageInDays: number): number {
  if (ageInDays <= 2) return 1.0
  if (ageInDays <= 7) return 0.6
  if (ageInDays <= 14) return 0.3
  return 0
}

// Calculate momentum bonus
function calculateMomentumBonus(touchpoints: TouchpointWithAge[]): number {
  let bonus = 0

  // Check for 2+ link clicks in last 72 hours
  const linkClicks = touchpoints.filter(
    (tp) => tp.type === 'LINK_CLICK' && tp.ageInDays <= 3
  )
  if (linkClicks.length >= 2) {
    bonus += 5
  }

  // Check for any event in last 24 hours
  const recentEvents = touchpoints.filter((tp) => tp.ageInDays <= 1)
  if (recentEvents.length > 0) {
    bonus += 3
  }

  return bonus
}

// Extract top 3 reasons for the score
function getTopReasons(
  touchpoints: TouchpointWithAge[],
  baseScore: number,
  momentumBonus: number
): string[] {
  const reasons: string[] = []

  // Add momentum reasons first if applicable
  if (momentumBonus >= 5) {
    reasons.push('Multiple link clicks in last 72 hours')
  }
  if (momentumBonus >= 3 && momentumBonus < 5) {
    reasons.push('Recent activity in last 24 hours')
  }

  // Group touchpoints by type and count
  const typeCounts = new Map<TouchpointType, number>()
  touchpoints.forEach((tp) => {
    const score = TOUCHPOINT_SCORES[tp.type] * getDecayMultiplier(tp.ageInDays)
    if (score > 0) {
      typeCounts.set(tp.type, (typeCounts.get(tp.type) || 0) + 1)
    }
  })

  // Get top contributing types
  const sortedTypes = Array.from(typeCounts.entries())
    .sort((a, b) => {
      const scoreA = TOUCHPOINT_SCORES[a[0]] * a[1]
      const scoreB = TOUCHPOINT_SCORES[b[0]] * b[1]
      return scoreB - scoreA
    })
    .slice(0, 3 - reasons.length)

  sortedTypes.forEach(([type, count]) => {
    const typeLabels: Record<TouchpointType, string> = {
      LINK_CLICK: 'Link clicks',
      WEBSITE_VISIT: 'Website visits',
      DM_REPLIED: 'DM replies',
      CONNECTION_ACCEPTED: 'Connection accepted',
      PROFILE_VIEWED_MANUAL: 'Profile views',
      POST_ENGAGED_MANUAL: 'Post engagements',
      CONNECTION_SENT: 'Connection sent',
      DM_SENT: 'DM sent',
      CALENDAR_BOOKED: 'Calendar bookings',
      NOTE: 'Notes',
    }
    reasons.push(`${typeLabels[type]} (${count})`)
  })

  return reasons.slice(0, 3)
}

// Main scoring function
export async function computeIntentScore(investorId: string): Promise<{
  score: number
  reasons: string[]
}> {
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const touchpoints = await prisma.touchpoint.findMany({
    where: {
      investorId,
      occurredAt: {
        gte: fourteenDaysAgo,
      },
    },
    orderBy: {
      occurredAt: 'desc',
    },
  })

  const now = new Date()
  const touchpointsWithAge: TouchpointWithAge[] = touchpoints.map((tp) => {
    const ageInMs = now.getTime() - tp.occurredAt.getTime()
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24)
    return {
      ...tp,
      ageInDays,
    }
  })

  // Calculate base score with decay
  let baseScore = 0
  touchpointsWithAge.forEach((tp) => {
    const basePoints = TOUCHPOINT_SCORES[tp.type] || 0
    const decay = getDecayMultiplier(tp.ageInDays)
    baseScore += basePoints * decay
  })

  // Add momentum bonus
  const momentumBonus = calculateMomentumBonus(touchpointsWithAge)
  const totalScore = baseScore + momentumBonus

  // Get top reasons
  const reasons = getTopReasons(touchpointsWithAge, baseScore, momentumBonus)

  return {
    score: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
    reasons,
  }
}

// Store intent score in database
export async function storeIntentScore(
  investorId: string,
  score: number,
  reasons: string[]
): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.investorIntentDaily.upsert({
    where: {
      investorId_computedAt: {
        investorId,
        computedAt: today,
      },
    },
    update: {
      score,
      reasons,
    },
    create: {
      investorId,
      score,
      reasons,
      computedAt: today,
    },
  })
}

// Get latest intent score for an investor
export async function getLatestIntentScore(investorId: string): Promise<{
  score: number
  reasons: string[]
} | null> {
  const latest = await prisma.investorIntentDaily.findFirst({
    where: {
      investorId,
    },
    orderBy: {
      computedAt: 'desc',
    },
  })

  if (!latest) return null

  return {
    score: Number(latest.score),
    reasons: latest.reasons,
  }
}

// Recompute intent score for an investor
export async function recomputeIntentScore(investorId: string): Promise<void> {
  const { score, reasons } = await computeIntentScore(investorId)
  await storeIntentScore(investorId, score, reasons)
}

// Recompute intent scores for all investors
export async function recomputeAllIntentScores(): Promise<void> {
  const investors = await prisma.investor.findMany({
    select: {
      id: true,
    },
  })

  for (const investor of investors) {
    await recomputeIntentScore(investor.id)
  }
}
