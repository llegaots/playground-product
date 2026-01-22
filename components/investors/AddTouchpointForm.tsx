'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface AddTouchpointFormProps {
  investorId: string
  onSuccess: () => void
}

export function AddTouchpointForm({ investorId, onSuccess }: AddTouchpointFormProps) {
  const [channel, setChannel] = useState<'LINKEDIN' | 'EMAIL' | 'SMS' | 'CALL' | 'OTHER'>('LINKEDIN')
  const [type, setType] = useState<string>('')
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const linkedInTypes = [
    { value: 'CONNECTION_SENT', label: 'Connection Sent' },
    { value: 'CONNECTION_ACCEPTED', label: 'Connection Accepted' },
    { value: 'DM_SENT', label: 'DM Sent' },
    { value: 'DM_REPLIED', label: 'DM Replied' },
    { value: 'PROFILE_VIEWED_MANUAL', label: 'Profile Viewed (Manual)' },
    { value: 'POST_ENGAGED_MANUAL', label: 'Post Engaged (Manual)' },
  ]

  const otherTypes = [
    { value: 'LINK_CLICK', label: 'Link Click' },
    { value: 'WEBSITE_VISIT', label: 'Website Visit' },
    { value: 'CALENDAR_BOOKED', label: 'Calendar Booked' },
    { value: 'NOTE', label: 'Note' },
  ]

  const availableTypes = channel === 'LINKEDIN' ? linkedInTypes : otherTypes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type) return

    setLoading(true)
    try {
      const response = await fetch('/api/touchpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorId,
          channel,
          type,
          occurredAt: new Date(occurredAt).toISOString(),
          metadata: notes ? { notes } : {},
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create touchpoint')
      }

      onSuccess()
      // Reset form
      setType('')
      setNotes('')
      setOccurredAt(new Date().toISOString().slice(0, 16))
    } catch (error) {
      console.error('Error creating touchpoint:', error)
      alert('Failed to create touchpoint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Channel
        </label>
        <Select
          value={channel}
          onChange={(e) => {
            setChannel(e.target.value as any)
            setType('')
          }}
        >
          <option value="LINKEDIN">LinkedIn</option>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
          <option value="CALL">Call</option>
          <option value="OTHER">Other</option>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <Select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="">Select type...</option>
          {availableTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Occurred At
        </label>
        <Input
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <Input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Adding...' : 'Add Touchpoint'}
      </Button>
    </form>
  )
}
