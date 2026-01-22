import { prisma } from '../lib/prisma'
import { recomputeIntentScore } from '../lib/intent-scoring'

async function seed() {
  console.log('Seeding database...')

  // Create sample investors
  const investors = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-0101',
      status: 'Qualified',
      amountCommitted: 50000,
      notes: 'Interested in workforce housing. Met at conference.',
      deal: 'Horizon Park',
      source: 'HubSpot',
      investorType: 'Accredited',
      liquidReady: true,
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1-555-0102',
      status: 'Warm Lead',
      amountCommitted: null,
      notes: 'Referred by John Smith. High net worth individual.',
      deal: null,
      source: 'Jeff Intro',
      investorType: 'Accredited',
      liquidReady: true,
    },
    {
      name: 'Michael Chen',
      email: 'mchen@example.com',
      phone: '+1-555-0103',
      status: 'Cold',
      amountCommitted: null,
      notes: 'Found via LinkedIn outreach.',
      deal: null,
      source: 'IGs LinkedIn',
      investorType: 'Accredited',
      liquidReady: false,
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1-555-0104',
      status: 'Qualified',
      amountCommitted: 75000,
      notes: 'Family office. Interested in multiple deals.',
      deal: 'Horizon Park',
      source: 'IG',
      investorType: 'Institutional',
      liquidReady: true,
    },
    {
      name: 'Robert Wilson',
      email: 'rwilson@example.com',
      phone: '+1-555-0105',
      status: 'Warm Lead',
      amountCommitted: null,
      notes: 'Real estate professional. Needs more information.',
      deal: null,
      source: 'IG Story',
      investorType: 'Accredited',
      liquidReady: false,
    },
  ]

  const createdInvestors = []
  for (const investorData of investors) {
    const investor = await prisma.investor.create({
      data: investorData,
    })
    createdInvestors.push(investor)
    console.log(`Created investor: ${investor.name}`)
  }

  // Create touchpoints for some investors
  const now = new Date()
  const touchpoints = [
    // John Smith - high intent
    {
      investorId: createdInvestors[0].id,
      channel: 'LINKEDIN' as const,
      type: 'CONNECTION_ACCEPTED' as const,
      occurredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      investorId: createdInvestors[0].id,
      channel: 'LINKEDIN' as const,
      type: 'DM_REPLIED' as const,
      occurredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      metadata: { message: 'Interested in learning more about the deal' },
    },
    {
      investorId: createdInvestors[0].id,
      channel: 'LINKEDIN' as const,
      type: 'LINK_CLICK' as const,
      occurredAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      investorId: createdInvestors[0].id,
      channel: 'LINKEDIN' as const,
      type: 'LINK_CLICK' as const,
      occurredAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    },

    // Sarah Johnson - medium intent
    {
      investorId: createdInvestors[1].id,
      channel: 'LINKEDIN' as const,
      type: 'CONNECTION_SENT' as const,
      occurredAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      investorId: createdInvestors[1].id,
      channel: 'LINKEDIN' as const,
      type: 'PROFILE_VIEWED_MANUAL' as const,
      occurredAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },

    // Michael Chen - low intent
    {
      investorId: createdInvestors[2].id,
      channel: 'LINKEDIN' as const,
      type: 'CONNECTION_SENT' as const,
      occurredAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },

    // Emily Davis - high intent
    {
      investorId: createdInvestors[3].id,
      channel: 'LINKEDIN' as const,
      type: 'CONNECTION_ACCEPTED' as const,
      occurredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      investorId: createdInvestors[3].id,
      channel: 'LINKEDIN' as const,
      type: 'WEBSITE_VISIT' as const,
      occurredAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      investorId: createdInvestors[3].id,
      channel: 'LINKEDIN' as const,
      type: 'CALENDAR_BOOKED' as const,
      occurredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ]

  for (const tpData of touchpoints) {
    await prisma.touchpoint.create({
      data: tpData,
    })
  }
  console.log(`Created ${touchpoints.length} touchpoints`)

  // Create some tracked links
  const trackedLinks = [
    {
      code: 'horizon1',
      investorId: createdInvestors[0].id,
      destinationUrl: 'https://example.com/horizon-park',
      campaign: 'Q1 2024 Outreach',
      deal: 'Horizon Park',
    },
    {
      code: 'horizon2',
      investorId: createdInvestors[3].id,
      destinationUrl: 'https://example.com/horizon-park',
      campaign: 'Q1 2024 Outreach',
      deal: 'Horizon Park',
    },
    {
      code: 'generic1',
      investorId: null,
      destinationUrl: 'https://example.com/general-info',
      campaign: 'Q1 2024 Outreach',
      deal: null,
    },
  ]

  for (const linkData of trackedLinks) {
    await prisma.trackedLink.create({
      data: linkData,
    })
  }
  console.log(`Created ${trackedLinks.length} tracked links`)

  // Compute intent scores
  console.log('Computing intent scores...')
  for (const investor of createdInvestors) {
    await recomputeIntentScore(investor.id)
  }

  console.log('\n✅ Seed completed successfully!')
  await prisma.$disconnect()
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
