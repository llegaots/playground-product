'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { InvestorRow } from './InvestorRow'
import type { Investor, InvestorIntentDaily } from '@prisma/client'

interface InvestorsTableProps {
  investors: (Investor & {
    intentScores: InvestorIntentDaily[]
  })[]
  onRefresh: () => void
  onInvestorClick: (investor: Investor) => void
}

export function InvestorsTable({
  investors,
  onRefresh,
  onInvestorClick,
}: InvestorsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Intent Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Liquid Ready
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {investors.map((investor) => (
            <InvestorRow
              key={investor.id}
              investor={investor}
              isEditing={editingId === investor.id}
              onEdit={() => setEditingId(investor.id)}
              onCancel={() => setEditingId(null)}
              onSave={() => {
                setEditingId(null)
                onRefresh()
              }}
              onClick={() => onInvestorClick(investor)}
            />
          ))}
        </tbody>
      </table>
      {investors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No investors found. Create one to get started.
        </div>
      )}
    </div>
  )
}
