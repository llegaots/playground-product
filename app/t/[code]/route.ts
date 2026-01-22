import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const searchParams = request.nextUrl.searchParams

    // Find the tracked link
    const trackedLink = await prisma.trackedLink.findUnique({
      where: { code },
    })

    if (!trackedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Get request metadata
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || null
    const referrer = headersList.get('referer') || null
    const ip = request.ip || headersList.get('x-forwarded-for') || null

    // Extract UTM parameters
    const utmSource = searchParams.get('utm_source') || null
    const utmMedium = searchParams.get('utm_medium') || null
    const utmCampaign = searchParams.get('utm_campaign') || null
    const utmContent = searchParams.get('utm_content') || null

    // Log the click
    await prisma.trackedLinkClick.create({
      data: {
        trackedLinkId: trackedLink.id,
        investorId: trackedLink.investorId,
        ip,
        userAgent,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        metadata: {
          queryParams: Object.fromEntries(searchParams.entries()),
        },
      },
    })

    // Create touchpoint if investor is known
    if (trackedLink.investorId) {
      await prisma.touchpoint.create({
        data: {
          investorId: trackedLink.investorId,
          channel: 'LINKEDIN',
          type: 'LINK_CLICK',
          metadata: {
            trackedLinkId: trackedLink.id,
            destinationUrl: trackedLink.destinationUrl,
            campaign: trackedLink.campaign,
            utmSource,
            utmMedium,
            utmCampaign,
          },
        },
      })
    }

    // Redirect to destination
    return NextResponse.redirect(trackedLink.destinationUrl, { status: 302 })
  } catch (error) {
    console.error('Error handling tracked link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
