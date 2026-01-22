import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { investorSchema } from '@/lib/validations'
import { recomputeIntentScore } from '@/lib/intent-scoring'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const deal = searchParams.get('deal')
    const investorType = searchParams.get('investorType')
    const sortBy = searchParams.get('sortBy') || 'intentScore'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) where.status = status
    if (source) where.source = source
    if (deal) where.deal = deal
    if (investorType) where.investorType = investorType

    const investors = await prisma.investor.findMany({
      where,
      include: {
        intentScores: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
      orderBy:
        sortBy === 'name'
          ? { name: sortOrder }
          : sortBy === 'createdAt'
          ? { createdAt: sortOrder }
          : undefined,
    })

    // Sort by intent score if needed
    if (sortBy === 'intentScore') {
      investors.sort((a, b) => {
        const scoreA = a.intentScores[0] ? Number(a.intentScores[0].score) : 0
        const scoreB = b.intentScores[0] ? Number(b.intentScores[0].score) : 0
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB
      })
    }

    return NextResponse.json(investors)
  } catch (error) {
    console.error('Error fetching investors:', error)
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
    const validated = investorSchema.parse(body)

    const investor = await prisma.investor.create({
      data: {
        ...validated,
        amountCommitted: validated.amountCommitted
          ? validated.amountCommitted
          : null,
      },
    })

    // Compute initial intent score
    await recomputeIntentScore(investor.id)

    return NextResponse.json(investor, { status: 201 })
  } catch (error: any) {
    console.error('Error creating investor:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
