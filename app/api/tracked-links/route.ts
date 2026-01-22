import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackedLinkSchema } from '@/lib/validations'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const investorId = searchParams.get('investorId')

    const where: any = {}
    if (investorId) {
      where.investorId = investorId
    }

    const trackedLinks = await prisma.trackedLink.findMany({
      where,
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            clicks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(trackedLinks)
  } catch (error) {
    console.error('Error fetching tracked links:', error)
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
    const validated = trackedLinkSchema.parse(body)

    // Generate unique code
    let code: string
    let isUnique = false
    while (!isUnique) {
      code = nanoid(8)
      const existing = await prisma.trackedLink.findUnique({
        where: { code },
      })
      if (!existing) {
        isUnique = true
      }
    }

    const trackedLink = await prisma.trackedLink.create({
      data: {
        code: code!,
        investorId: validated.investorId || null,
        destinationUrl: validated.destinationUrl,
        campaign: validated.campaign || null,
        deal: validated.deal || null,
      },
    })

    return NextResponse.json(trackedLink, { status: 201 })
  } catch (error: any) {
    console.error('Error creating tracked link:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
