'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Investor, InvestorIntentDaily } from '@prisma/client'

interface InvestorRowProps {
  investor: Investor & {
    intentScores: InvestorIntentDaily[]
  }
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onClick: () => void
}

export function InvestorRow({
  investor,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onClick,
}: InvestorRowProps) {
  const [formData, setFormData] = useState({
    status: investor.status || '',
    amountCommitted: investor.amountCommitted ? Number(investor.amountCommitted) : '',
    source: investor.source || '',
    deal: investor.deal || '',
    liquidReady: investor.liquidReady,
  })
  const [loading, setLoading] = useState(false)

  const latestIntent = investor.intentScores[0]
  const intentScore = latestIntent ? Number(latestIntent.score) : 0

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/investors/${investor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amountCommitted: formData.amountCommitted || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update investor')
      }

      onSave()
    } catch (error) {
      console.error('Error updating investor:', error)
      alert('Failed to update investor')
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {investor.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {investor.email || '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Input
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-32"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Input
            type="number"
            step="0.01"
            value={formData.amountCommitted}
            onChange={(e) =>
              setFormData({
                ...formData,
                amountCommitted: e.target.value ? parseFloat(e.target.value) : '',
              })
            }
            className="w-32"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Input
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-32"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Input
            value={formData.deal}
            onChange={(e) => setFormData({ ...formData, deal: e.target.value })}
            className="w-32"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {intentScore.toFixed(1)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Select
            value={formData.liquidReady ? 'true' : 'false'}
            onChange={(e) =>
              setFormData({ ...formData, liquidReady: e.target.value === 'true' })
            }
            className="w-24"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="text-blue-600 hover:text-blue-900"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {investor.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {investor.email || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {investor.status || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {investor.amountCommitted
          ? `$${Number(investor.amountCommitted).toLocaleString()}`
          : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {investor.source || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {investor.deal || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <span
          className={
            intentScore >= 10
              ? 'text-green-600'
              : intentScore >= 5
              ? 'text-yellow-600'
              : 'text-gray-500'
          }
        >
          {intentScore.toFixed(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {investor.liquidReady ? 'Yes' : 'No'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="text-blue-600 hover:text-blue-900"
        >
          Edit
        </button>
      </td>
    </tr>
  )
}
