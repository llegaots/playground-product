import Airtable from 'airtable'
import { prisma } from '../lib/prisma'

async function importFromAirtable() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Investors'

  if (!apiKey || !baseId) {
    console.error('Missing required environment variables: AIRTABLE_API_KEY and AIRTABLE_BASE_ID')
    process.exit(1)
  }

  Airtable.configure({ apiKey })
  const base = Airtable.base(baseId)
  const table = base(tableName)

  console.log(`Fetching records from Airtable table: ${tableName}...`)

  const allRecords: any[] = []

  await table
    .select({
      view: 'Grid view',
    })
    .eachPage(
      (records, fetchNextPage) => {
        allRecords.push(...records.map((record) => record.fields))
        fetchNextPage()
      },
      (err) => {
        if (err) {
          console.error('Error fetching Airtable records:', err)
          throw err
        }
      }
    )

  console.log(`Found ${allRecords.length} records in Airtable`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const record of allRecords) {
    try {
      const email = record['Email Address'] || record['Email'] || null
      const name = record['Investor Name'] || record['Name'] || ''
      const phone = record['Phone Number'] || record['Phone'] || null
      const status = record['Status'] || null
      const amount = record['Amount$'] || record['Amount'] || null
      const notes = record['Investor Notes'] || record['Notes'] || null
      const deal = record['Deal'] || null
      const source = record['Source'] || null
      const investorType = record['Investor Type'] || null
      const liquidReady = record['Liquid Ready'] === true || record['Liquid Ready'] === 'Yes'
      const createdAt = record['Created Time']
        ? new Date(record['Created Time'])
        : new Date()

      if (!name) {
        console.warn(`Skipping record with no name: ${JSON.stringify(record)}`)
        skipped++
        continue
      }

      const data: any = {
        name,
        email,
        phone,
        status,
        amountCommitted: amount ? parseFloat(String(amount)) : null,
        notes,
        deal,
        source,
        investorType,
        liquidReady,
        createdAt,
      }

      if (email) {
        // Try to find existing by email
        const existing = await prisma.investor.findUnique({
          where: { email },
        })

        if (existing) {
          await prisma.investor.update({
            where: { email },
            data,
          })
          updated++
          console.log(`Updated: ${name} (${email})`)
        } else {
          await prisma.investor.create({ data })
          created++
          console.log(`Created: ${name} (${email})`)
        }
      } else {
        // Create new if no email
        await prisma.investor.create({ data })
        created++
        console.log(`Created: ${name} (no email)`)
      }
    } catch (error: any) {
      console.error(`Error processing record: ${JSON.stringify(record)}`, error.message)
      skipped++
    }
  }

  console.log('\n=== Import Summary ===')
  console.log(`Created: ${created}`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Total: ${allRecords.length}`)

  await prisma.$disconnect()
}

importFromAirtable().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
