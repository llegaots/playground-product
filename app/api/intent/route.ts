import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { recomputeIntentScore, recomputeAllIntentScores } from '@/lib/intent-scoring'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { investorId } = body

    if (investorId) {
      await recomputeIntentScore(investorId)
      return NextResponse.json({ success: true, message: 'Intent score recomputed' })
    } else {
      await recomputeAllIntentScores()
      return NextResponse.json({ success: true, message: 'All intent scores recomputed' })
    }
  } catch (error) {
    console.error('Error recomputing intent score:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
