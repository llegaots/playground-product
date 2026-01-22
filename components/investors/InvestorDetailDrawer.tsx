'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { TouchpointTimeline } from './TouchpointTimeline'
import { AddTouchpointForm } from './AddTouchpointForm'
import type { Investor, Touchpoint, InvestorIntentDaily } from '@prisma/client'

interface InvestorDetailDrawerProps {
  investor: Investor & {
    touchpoints: Touchpoint[]
    intentScores: InvestorIntentDaily[]
  }
  onClose: () => void
  onUpdate: () => void
}

export function InvestorDetailDrawer({
  investor,
  onClose,
  onUpdate,
}: InvestorDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: investor.name,
    email: investor.email || '',
    phone: investor.phone || '',
    status: investor.status || '',
    amountCommitted: investor.amountCommitted ? Number(investor.amountCommitted) : '',
    notes: investor.notes || '',
    deal: investor.deal || '',
    source: investor.source || '',
    investorType: investor.investorType || '',
    liquidReady: investor.liquidReady,
  })
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const latestIntent = investor.intentScores[0]

  const handleQuickAdd = async (type: string) => {
    try {
      const response = await fetch('/api/touchpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorId: investor.id,
          channel: 'LINKEDIN',
          type,
          occurredAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create touchpoint')
      }

      setRefreshKey((k) => k + 1)
      onUpdate()
    } catch (error) {
      console.error('Error creating touchpoint:', error)
      alert('Failed to create touchpoint')
    }
  }

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

      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating investor:', error)
      alert('Failed to update investor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end">
      <div className="bg-white h-full w-full max-w-2xl shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{investor.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Intent Score */}
          {latestIntent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Intent Score
                </span>
                <span className="text-2xl font-bold text-blue-900">
                  {Number(latestIntent.score).toFixed(1)}
                </span>
              </div>
              {latestIntent.reasons.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-blue-800 mb-1">
                    Top Reasons:
                  </div>
                  <ul className="text-xs text-blue-700 space-y-1">
                    {latestIntent.reasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quick Add LinkedIn Touchpoints */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Quick Add LinkedIn Touchpoint
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd('CONNECTION_SENT')}
              >
                Connection Sent
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd('CONNECTION_ACCEPTED')}
              >
                Connection Accepted
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd('DM_SENT')}
              >
                DM Sent
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd('DM_REPLIED')}
              >
                DM Replied
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd('PROFILE_VIEWED_MANUAL')}
              >
                Profile Viewed
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd('POST_ENGAGED_MANUAL')}
              >
                Post Engaged
              </Button>
            </div>
          </div>

          {/* Investor Details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Investor Details</h3>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: investor.name,
                        email: investor.email || '',
                        phone: investor.phone || '',
                        status: investor.status || '',
                        amountCommitted: investor.amountCommitted
                          ? Number(investor.amountCommitted)
                          : '',
                        notes: investor.notes || '',
                        deal: investor.deal || '',
                        source: investor.source || '',
                        investorType: investor.investorType || '',
                        liquidReady: investor.liquidReady,
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <div className="text-sm text-gray-900">{investor.name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <div className="text-sm text-gray-900">{investor.email || '-'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <div className="text-sm text-gray-900">{investor.phone || '-'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <Input
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                ) : (
                  <div className="text-sm text-gray-900">{investor.status || '-'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Committed
                </label>
                {isEditing ? (
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
                  />
                ) : (
                  <div className="text-sm text-gray-900">
                    {investor.amountCommitted
                      ? `$${Number(investor.amountCommitted).toLocaleString()}`
                      : '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                {isEditing ? (
                  <Input
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                ) : (
                  <div className="text-sm text-gray-900">{investor.source || '-'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal
                </label>
                {isEditing ? (
                  <Input
                    value={formData.deal}
                    onChange={(e) => setFormData({ ...formData, deal: e.target.value })}
                  />
                ) : (
                  <div className="text-sm text-gray-900">{investor.deal || '-'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investor Type
                </label>
                {isEditing ? (
                  <Input
                    value={formData.investorType}
                    onChange={(e) =>
                      setFormData({ ...formData, investorType: e.target.value })
                    }
                  />
                ) : (
                  <div className="text-sm text-gray-900">{investor.investorType || '-'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liquid Ready
                </label>
                {isEditing ? (
                  <Select
                    value={formData.liquidReady ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({ ...formData, liquidReady: e.target.value === 'true' })
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Select>
                ) : (
                  <div className="text-sm text-gray-900">
                    {investor.liquidReady ? 'Yes' : 'No'}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              {isEditing ? (
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              ) : (
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {investor.notes || '-'}
                </div>
              )}
            </div>
          </div>

          {/* Add Touchpoint Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Add Touchpoint</h3>
            <AddTouchpointForm
              investorId={investor.id}
              onSuccess={() => {
                setRefreshKey((k) => k + 1)
                onUpdate()
              }}
            />
          </div>

          {/* Touchpoints Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Touchpoints Timeline</h3>
            <TouchpointTimeline key={refreshKey} touchpoints={investor.touchpoints} />
          </div>
        </div>
      </div>
    </div>
  )
}
