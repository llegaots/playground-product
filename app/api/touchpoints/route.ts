import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { touchpointSchema } from '@/lib/validations'
import { recomputeIntentScore } from '@/lib/intent-scoring'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const investorId = searchParams.get('investorId')

    if (!investorId) {
      return NextResponse.json({ error: 'investorId is required' }, { status: 400 })
    }

    const touchpoints = await prisma.touchpoint.findMany({
      where: { investorId },
      orderBy: { occurredAt: 'desc' },
    })

    return NextResponse.json(touchpoints)
  } catch (error) {
    console.error('Error fetching touchpoints:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = touchpointSchema.parse(body)

    const touchpoint = await prisma.touchpoint.create({
      data: {
        investorId: validated.investorId,
        channel: validated.channel,
        type: validated.type,
        occurredAt: validated.occurredAt,
        metadata: validated.metadata || {},
      },
    })

    // Recompute intent score asynchronously
    recomputeIntentScore(validated.investorId).catch(console.error)

    return NextResponse.json(touchpoint, { status: 201 })
  } catch (error: any) {
    console.error('Error creating touchpoint:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
